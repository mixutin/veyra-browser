const {ElectronBlocker}=require("@ghostery/adblocker-electron");
let blocker=null,blocked=0;
async function enablePrivacy(ses){ses.setPermissionRequestHandler((_wc,p,cb)=>cb(["fullscreen","clipboard-sanitized-write"].includes(p)));ses.setPermissionCheckHandler((_wc,p)=>["fullscreen","clipboard-sanitized-write"].includes(p));
try{blocker=await ElectronBlocker.fromPrebuiltAdsAndTracking(fetch);blocker.on?.("request-blocked",()=>blocked++);blocker.enableBlockingInSession(ses);console.log("[Veyra] Ghostery ads+tracking engine enabled");}catch(e){console.warn("[Veyra] blocker startup failed:",e.message);}
}
module.exports={enablePrivacy,getStats:()=>({blocked,enabled:!!blocker})};