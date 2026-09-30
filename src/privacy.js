const {ElectronBlocker}=require("@ghostery/adblocker-electron");
let blocker=null,activeSession=null,enabled=false,blocked=0,cleaned=0,listener=()=>{};
const perTab=new Map();
const TRACKING=/^(utm_.+|fbclid|gclid|dclid|msclkid|mc_cid|mc_eid|igshid|yclid|vero_id|oly_anon_id|oly_enc_id)$/i;
function emit(){listener(stats());}
function sanitizeUrl(raw){
try{const u=new URL(raw);let changed=false;for(const k of [...u.searchParams.keys()])if(TRACKING.test(k)){u.searchParams.delete(k);changed=true;}
if(changed){cleaned++;emit();return u.toString();}}catch{} return raw;
}
async function enablePrivacy(ses,onStats=()=>{}){
listener=onStats;activeSession=ses;
ses.setPermissionRequestHandler((_wc,p,cb)=>cb(["fullscreen","clipboard-sanitized-write"].includes(p)));
ses.setPermissionCheckHandler((_wc,p)=>["fullscreen","clipboard-sanitized-write"].includes(p));
ses.webRequest.onBeforeSendHeaders({urls:["<all_urls>"]},(d,cb)=>{d.requestHeaders.DNT="1";d.requestHeaders["Sec-GPC"]="1";cb({requestHeaders:d.requestHeaders});});
try{blocker=await ElectronBlocker.fromPrebuiltAdsAndTracking(fetch);
blocker.on("request-blocked",request=>{blocked++;if(request.tabId)perTab.set(request.tabId,(perTab.get(request.tabId)||0)+1);emit();});
blocker.enableBlockingInSession(ses);enabled=true;console.log("[Veyra] Shield enabled");emit();}
catch(e){console.warn("[Veyra] Shield failed:",e.message);emit();}
}
function setEnabled(value){
if(!blocker||!activeSession)return false;
if(value&&!enabled){blocker.enableBlockingInSession(activeSession);enabled=true;}
if(!value&&enabled){blocker.disableBlockingInSession(activeSession);enabled=false;}
emit();return enabled;
}
function stats(webContentsId){return{enabled,blocked,cleaned,tabBlocked:webContentsId?(perTab.get(webContentsId)||0):0};}
module.exports={enablePrivacy,setEnabled,sanitizeUrl,stats};