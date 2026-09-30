const {app,BrowserWindow,WebContentsView,ipcMain,session}=require("electron");
const path=require("path");
const privacy=require("./src/privacy");
const migration=require("./src/migration");
const library=require("./src/library");
const {createStore}=require("./src/state");

let win,ses,store,state,userData,tabs=[],nextId=1,saveTimer=null,shieldTimer=null;
const shellWidth=296,toolbarHeight=64,gap=8;
const workspaceId=()=>state.activeWorkspaceId;
const activeId=()=>state.activeByWorkspace[workspaceId()]||0;
const splitId=()=>state.splitByWorkspace[workspaceId()]||0;
const activeTab=()=>tabs.find(t=>t.id===activeId());
const clean=t=>({id:t.id,title:t.title,url:t.url,workspaceId:t.workspaceId,loading:t.loading,sleeping:!t.view});
const snapshot=()=>({...state,tabs:tabs.map(t=>({id:t.id,title:t.title,url:t.url,workspaceId:t.workspaceId}))});
function persistSoon(){clearTimeout(saveTimer);saveTimer=setTimeout(()=>store.replace(snapshot()),180);}
function clientState(){const a=activeTab();return{tabs:tabs.map(clean),workspaces:state.workspaces,activeWorkspaceId:workspaceId(),activeId:activeId(),splitId:splitId(),shield:privacy.stats(a?.view?.webContents.id)};}
function emit(){if(win&&!win.isDestroyed())win.webContents.send("browser:state",clientState());}
function emitShield(){clearTimeout(shieldTimer);shieldTimer=setTimeout(emit,150);}
function resolveInput(raw){
  const value=String(raw||"").trim();
  if(!value)return"veyra://home";
  if(/^veyra:\/\//i.test(value))return value;
  if(/^[a-zA-Z][\w+.-]*:\/\//.test(value))return privacy.sanitizeUrl(value);
  if(/^localhost(?::\d+)?(?:\/.*)?$/i.test(value))return"http://"+value;
  if(/^[\w.-]+\.[a-z]{2,}(?::\d+)?(?:\/.*)?$/i.test(value))return privacy.sanitizeUrl("https://"+value);
  return"https://search.brave.com/search?q="+encodeURIComponent(value);
}
function ensureView(t){
  if(!t||t.url==="veyra://home"||t.view)return t?.view;
  const view=new WebContentsView({webPreferences:{partition:"persist:veyra",contextIsolation:true,sandbox:true,nodeIntegration:false}});
  t.view=view;win.contentView.addChildView(view);wire(t);view.webContents.loadURL(resolveInput(t.url));return view;
}
function wire(t){
  const wc=t.view.webContents;
  wc.on("page-title-updated",(_e,title)=>{t.title=title||t.title;emit();persistSoon();});
  wc.on("did-start-loading",()=>{t.loading=true;emit();});
  wc.on("did-stop-loading",()=>{t.loading=false;t.url=wc.getURL()||t.url;library.recordHistory(userData,{title:t.title,url:t.url});emit();persistSoon();});
  wc.on("did-navigate",(_e,url)=>{t.url=url;emit();persistSoon();});
  wc.on("did-navigate-in-page",(_e,url)=>{t.url=url;emit();persistSoon();});
  wc.on("will-navigate",(event,url)=>{const cleaned=privacy.sanitizeUrl(url);if(cleaned!==url){event.preventDefault();wc.loadURL(cleaned);}});
  wc.on("render-process-gone",()=>{t.loading=false;t.title="Crashed tab";emit();});
  wc.setWindowOpenHandler(({url})=>{createTab(privacy.sanitizeUrl(url),t.workspaceId,true);return{action:"deny"};});
}
function layout(){
  if(!win)return;const b=win.getContentBounds(),primary=activeTab(),secondary=tabs.find(t=>t.id===splitId()&&t.workspaceId===workspaceId());
  const usable=Math.max(1,b.width-shellWidth),height=Math.max(1,b.height-toolbarHeight),half=Math.max(1,Math.floor((usable-gap)/2));
  for(const t of tabs)if(t.view)t.view.setBounds({x:0,y:0,width:0,height:0});
  if(primary&&primary.url!=="veyra://home"){ensureView(primary);primary.view.setBounds(secondary?{x:shellWidth,y:toolbarHeight,width:half,height}:{x:shellWidth,y:toolbarHeight,width:usable,height});}
  if(secondary&&secondary.id!==primary?.id&&secondary.url!=="veyra://home"){ensureView(secondary);secondary.view.setBounds({x:shellWidth+half+gap,y:toolbarHeight,width:usable-half-gap,height});}
}
function createTab(url="veyra://home",ws=workspaceId(),activate=true){
  const t={id:nextId++,title:url==="veyra://home"?"New Tab":"Loading…",url:resolveInput(url),workspaceId:ws,loading:false,view:null};
  tabs.push(t);if(activate){state.activeWorkspaceId=ws;state.activeByWorkspace[ws]=t.id;ensureView(t);}layout();emit();persistSoon();return t;
}
function switchTab(id){
  const t=tabs.find(x=>x.id===id);if(!t)return;const ws=t.workspaceId,previous=state.activeByWorkspace[ws];
  state.activeWorkspaceId=ws;if(state.splitByWorkspace[ws]===id&&previous&&previous!==id)state.splitByWorkspace[ws]=previous;
  state.activeByWorkspace[ws]=id;ensureView(t);layout();emit();persistSoon();
}
function closeTab(id){
  const i=tabs.findIndex(t=>t.id===id);if(i<0)return;const[t]=tabs.splice(i,1),ws=t.workspaceId;
  state.recentlyClosed.unshift({title:t.title,url:t.url,workspaceId:ws});state.recentlyClosed=state.recentlyClosed.slice(0,20);
  if(t.view){win.contentView.removeChildView(t.view);t.view.webContents.close();}
  if(state.splitByWorkspace[ws]===id)state.splitByWorkspace[ws]=0;
  if(state.activeByWorkspace[ws]===id){const split=tabs.find(x=>x.id===state.splitByWorkspace[ws]);if(split){state.activeByWorkspace[ws]=split.id;state.splitByWorkspace[ws]=0;}else{const next=tabs.find(x=>x.workspaceId===ws);state.activeByWorkspace[ws]=next?.id||0;}}
  if(!tabs.some(t=>t.workspaceId===workspaceId()))createTab("veyra://home",workspaceId(),true);else{ensureView(activeTab());layout();emit();persistSoon();}
}
function switchWorkspace(id){if(!state.workspaces.some(w=>w.id===id))return;state.activeWorkspaceId=id;let t=tabs.find(x=>x.id===state.activeByWorkspace[id]);if(!t)t=tabs.find(x=>x.workspaceId===id);if(!t)t=createTab("veyra://home",id,false);state.activeByWorkspace[id]=t.id;ensureView(t);layout();emit();persistSoon();}
function createWorkspace(name="Space"){const id="space-"+Date.now().toString(36),label=String(name||"Space").trim().slice(0,32)||"Space";state.workspaces.push({id,name:label,icon:label[0].toUpperCase()});state.activeWorkspaceId=id;createTab("veyra://home",id,true);emit();persistSoon();return id;}
function toggleSplit(){const ws=workspaceId();if(splitId()){state.splitByWorkspace[ws]=0;layout();emit();persistSoon();return;}const primary=activeTab();let second=tabs.find(t=>t.workspaceId===ws&&t.id!==primary?.id&&t.url!=="veyra://home");if(!second)second=createTab("https://search.brave.com",ws,false);state.splitByWorkspace[ws]=second.id;ensureView(second);layout();emit();persistSoon();}
function sleepInactive(){let count=0;for(const t of tabs){if(t.id===activeId()||t.id===splitId()||!t.view)continue;win.contentView.removeChildView(t.view);t.view.webContents.close();t.view=null;count++;}layout();emit();return count;}
function reopenClosed(){const item=state.recentlyClosed.shift();if(!item)return false;const ws=state.workspaces.some(w=>w.id===item.workspaceId)?item.workspaceId:workspaceId();createTab(item.url||"veyra://home",ws,true);persistSoon();return true;}
function bookmarkActive(){const t=activeTab();return library.addBookmark(userData,{title:t?.title,url:t?.url});}
function go(raw){const t=activeTab();if(!t)return;const url=resolveInput(raw);t.url=url;t.title=url==="veyra://home"?"New Tab":"Loading…";if(url==="veyra://home"){if(t.view){win.contentView.removeChildView(t.view);t.view.webContents.close();t.view=null;}}else{ensureView(t);t.view.webContents.loadURL(url);}layout();emit();persistSoon();}
function restore(){
  state=store.get();tabs=state.tabs.map(t=>({...t,loading:false,view:null}));nextId=Math.max(0,...tabs.map(t=>Number(t.id)||0))+1;
  let t=tabs.find(x=>x.id===state.activeByWorkspace[workspaceId()]);if(!t)t=tabs.find(x=>x.workspaceId===workspaceId());
  if(!t)t=createTab("veyra://home",workspaceId(),false);state.activeByWorkspace[workspaceId()]=t.id;ensureView(t);
}
app.whenReady().then(async()=>{
  userData=app.getPath("userData");store=createStore(userData);state=store.get();ses=session.fromPartition("persist:veyra");await privacy.enablePrivacy(ses,emitShield);
  win=new BrowserWindow({width:1500,height:930,minWidth:980,minHeight:650,titleBarStyle:"hidden",backgroundColor:"#090b10",webPreferences:{preload:path.join(__dirname,"src/preload.js"),contextIsolation:true,sandbox:true,nodeIntegration:false}});
  await win.loadFile(path.join(__dirname,"src/index.html"));restore();layout();emit();win.on("resize",layout);win.on("close",()=>store.replace(snapshot()));if(process.argv.includes("--dev"))win.webContents.openDevTools({mode:"detach"});
});
ipcMain.handle("browser:state",()=>clientState());
ipcMain.on("tab:new",()=>createTab());
ipcMain.on("tab:switch",(_e,id)=>switchTab(id));
ipcMain.on("tab:close",(_e,id)=>closeTab(id));
ipcMain.on("nav:go",(_e,value)=>go(value));
ipcMain.on("nav:back",()=>activeTab()?.view?.webContents.goBack());
ipcMain.on("nav:forward",()=>activeTab()?.view?.webContents.goForward());
ipcMain.on("nav:reload",()=>activeTab()?.view?.webContents.reload());
ipcMain.on("workspace:switch",(_e,id)=>switchWorkspace(id));
ipcMain.handle("workspace:new",(_e,name)=>createWorkspace(name));
ipcMain.on("split:toggle",()=>toggleSplit());
ipcMain.handle("shield:toggle",()=>privacy.setEnabled(!privacy.stats().enabled));
ipcMain.handle("tab:sleep-inactive",()=>sleepInactive());
ipcMain.handle("tab:reopen-closed",()=>reopenClosed());
ipcMain.handle("library:bookmarks",()=>library.listBookmarks(userData,24));
ipcMain.handle("library:bookmark-current",()=>bookmarkActive());
ipcMain.handle("library:history",()=>library.listHistory(userData,100));
ipcMain.handle("migration:scan",()=>migration.scan());
ipcMain.handle("migration:import",(_e,source)=>migration.importProfile(source,userData));
app.on("before-quit",()=>{if(store&&state)store.replace(snapshot());});
app.on("window-all-closed",()=>{if(process.platform!=="darwin")app.quit();});
