const $=s=>document.querySelector(s);
const tabsEl=$("#tabs"),rail=$("#workspaceRail"),home=$("#home"),url=$("#url"),palette=$("#palette"),migration=$("#migration"),bookmarksGrid=$("#bookmarksGrid"),controlPanel=$("#controlPanel");
let state={tabs:[],workspaces:[],activeWorkspaceId:"",activeId:0,splitId:0,shield:{enabled:false,blocked:0,cleaned:0},resources:{policy:{preset:"balanced",warmTabs:8,ramTargetMB:2048,autoSleepMinutes:30,autoSleep:true}}};
function activeTab(){return state.tabs.find(t=>t.id===state.activeId);}
function workspaceTabs(){return state.tabs.filter(t=>t.workspaceId===state.activeWorkspaceId);}
function renderWorkspaces(){
  rail.innerHTML="";
  for(const [i,w] of state.workspaces.entries()){
    const b=document.createElement("button");b.className="rail-btn workspace-dot "+(w.id===state.activeWorkspaceId?"active":"");
    b.textContent=w.icon||w.name[0]?.toUpperCase()||String(i+1);b.title=w.name;b.onclick=()=>window.veyra.switchWorkspace(w.id);rail.appendChild(b);
  }
  const active=state.workspaces.find(w=>w.id===state.activeWorkspaceId);$("#workspaceName").textContent=active?.name||"Workspace";
}
function renderTabs(){
  tabsEl.innerHTML="";
  for(const t of workspaceTabs()){
    const row=document.createElement("div");row.className="tab "+(t.id===state.activeId?"active ":"")+(t.id===state.splitId?"split ":"")+(t.sleeping?"sleeping":"");
    row.innerHTML="<span class='favicon'></span><span class='tabtitle'></span><span class='badge'></span><button class='close'>×</button>";
    row.querySelector(".favicon").textContent=t.loading?"◌":t.url==="veyra://home"?"⌂":"●";
    row.querySelector(".tabtitle").textContent=t.title||"New Tab";row.querySelector(".badge").textContent=t.id===state.splitId?"SPLIT":t.sleeping?"SLEEP":"";
    row.onclick=()=>window.veyra.switchTab(t.id);row.querySelector(".close").onclick=e=>{e.stopPropagation();window.veyra.closeTab(t.id)};tabsEl.appendChild(row);
  }
}
function formatMemory(mb){return mb>=1024?(mb/1024).toFixed(mb>=2048?1:2)+" GB":Math.round(mb)+" MB";}
function renderResources(){
  const r=state.resources||{},p=r.policy||{},memory=Number(r.memoryMB)||0,cpu=Number(r.cpuPercent)||0,target=Number(p.ramTargetMB)||2048;
  $("#resourceMini").textContent=`${formatMemory(memory)} · ${cpu.toFixed(1)}%`;
  $("#resourceRam").textContent=formatMemory(memory);$("#resourceCpu").textContent=`${cpu.toFixed(1)}% CPU · ${r.loadedTabs||0} loaded tabs`;
  $("#resourceMode").textContent=(p.preset||"custom").toUpperCase();$("#ramMeter").style.width=Math.min(100,(memory/target)*100)+"%";
  $("#panelRam").textContent=formatMemory(memory);$("#panelCpu").textContent=cpu.toFixed(1)+"%";$("#panelLoaded").textContent=String(r.loadedTabs||0);$("#panelSleeping").textContent=String(r.sleepingTabs||0);
  $("#ramTarget").value=target;$("#ramTargetValue").textContent=target+" MB";$("#warmTabs").value=p.warmTabs||8;$("#warmTabsValue").textContent=String(p.warmTabs||8);
  $("#sleepMinutes").value=p.autoSleepMinutes||30;$("#sleepMinutesValue").textContent=(p.autoSleepMinutes||30)+" min";$("#autoSleep").checked=p.autoSleep!==false;
  document.querySelectorAll("[data-preset]").forEach(b=>b.classList.toggle("active",b.dataset.preset===p.preset));
  $("#gameMode").textContent=p.preset==="gaming"?"◒ Game Mode On":"◒ Game Mode";
}
function render(next){
  state=next;renderWorkspaces();renderTabs();renderResources();
  const active=activeTab(),isHome=!active||active.url==="veyra://home";home.classList.toggle("hidden",!isHome);home.classList.toggle("split-home",isHome&&!!state.splitId);
  if(document.activeElement!==url)url.value=isHome?"":active.url;$("#split").classList.toggle("active",!!state.splitId);
  const s=state.shield||{};$("#shield").classList.toggle("off",!s.enabled);$("#shieldStats").textContent=s.enabled?`${Number(s.blocked||0).toLocaleString()} blocked`:"OFF";
  $("#homeBlocked").textContent=Number(s.blocked||0).toLocaleString();
}
window.veyra.onState(render);window.veyra.state().then(render);
function go(value){if(String(value||"").trim())window.veyra.go(value);}
$("#newTab").onclick=()=>window.veyra.newTab();$("#back").onclick=()=>window.veyra.back();$("#forward").onclick=()=>window.veyra.forward();$("#reload").onclick=()=>window.veyra.reload();
$("#split").onclick=()=>window.veyra.toggleSplit();$("#splitHome").onclick=()=>window.veyra.toggleSplit();$("#shield").onclick=()=>window.veyra.toggleShield();
url.onkeydown=e=>{if(e.key==="Enter")go(url.value)};$("#homeSearch").onkeydown=e=>{if(e.key==="Enter")go(e.target.value)};
function newWorkspace(){const name=prompt("Workspace name","New Space");if(name)window.veyra.newWorkspace(name);}
$("#newWorkspace").onclick=newWorkspace;$("#workspaceMenu").onclick=newWorkspace;
function showPalette(){palette.classList.remove("hidden");const input=$("#commandInput");input.value="";filterCommands("");input.focus();}
function hidePalette(){palette.classList.add("hidden");}
function showControl(){controlPanel.classList.remove("hidden");hidePalette();}
function hideControl(){controlPanel.classList.add("hidden");}
$("#cmd").onclick=showPalette;palette.onclick=e=>{if(e.target===palette)hidePalette();};$("#commandInput").oninput=e=>filterCommands(e.target.value);
function filterCommands(value){const q=value.trim().toLowerCase();document.querySelectorAll("[data-command]").forEach(b=>b.classList.toggle("hidden",q&&!b.textContent.toLowerCase().includes(q)));}
$("#openControl").onclick=showControl;$("#openControlRail").onclick=showControl;$("#dashboardControl").onclick=showControl;$("#closeControl").onclick=hideControl;$("#controlScrim").onclick=hideControl;
async function setPreset(name){await window.veyra.setResourcePreset(name);}
$("#gameMode").onclick=()=>setPreset("gaming");document.querySelectorAll("[data-preset]").forEach(b=>b.onclick=()=>setPreset(b.dataset.preset));
function customResourcePolicy(){return{preset:"custom",ramTargetMB:Number($("#ramTarget").value),warmTabs:Number($("#warmTabs").value),autoSleepMinutes:Number($("#sleepMinutes").value),autoSleep:$("#autoSleep").checked};}
for(const id of ["ramTarget","warmTabs","sleepMinutes"])$("#"+id).oninput=()=>{const p=customResourcePolicy();$("#ramTargetValue").textContent=p.ramTargetMB+" MB";$("#warmTabsValue").textContent=String(p.warmTabs);$("#sleepMinutesValue").textContent=p.autoSleepMinutes+" min";};
for(const id of ["ramTarget","warmTabs","sleepMinutes","autoSleep"])$("#"+id).onchange=()=>window.veyra.setResourcePolicy(customResourcePolicy());
$("#sleepNow").onclick=()=>window.veyra.sleepInactive();
async function loadBookmarks(){
  const items=await window.veyra.bookmarks();bookmarksGrid.innerHTML="";
  if(!items.length){const empty=document.createElement("div");empty.className="bookmark-empty";empty.textContent="No bookmarks yet. Import your browser or press ☆ on any page.";bookmarksGrid.appendChild(empty);return;}
  for(const item of items.slice(0,12)){
    const b=document.createElement("button");b.className="bookmark-card";b.innerHTML="<span class='bookmark-icon'>◇</span><span><b></b><small></small></span>";
    b.querySelector("b").textContent=item.title||item.url;try{b.querySelector("small").textContent=new URL(item.url).hostname}catch{b.querySelector("small").textContent=item.url}
    b.onclick=()=>go(item.url);bookmarksGrid.appendChild(b);
  }
}
async function bookmarkCurrent(){const r=await window.veyra.bookmarkCurrent();if(r?.added)await loadBookmarks();}
$("#bookmark").onclick=bookmarkCurrent;$("#refreshBookmarks").onclick=loadBookmarks;loadBookmarks();
async function runMigration(){
  const sources=await window.veyra.scanMigration();migration.classList.remove("hidden");migration.innerHTML="";
  const title=document.createElement("div");title.className="migration-title";title.textContent=sources.length?"Move your browser data into Veyra":"No importable browser profiles found.";migration.appendChild(title);
  for(const source of sources){
    const b=document.createElement("button");b.innerHTML="<span><b></b><small></small></span><span>Import →</span>";b.querySelector("b").textContent=source.name;b.querySelector("small").textContent=source.profile;
    b.onclick=async()=>{b.disabled=true;b.lastElementChild.textContent="Importing…";try{const r=await window.veyra.importProfile(source);b.lastElementChild.textContent=`${r.bookmarksImported} bookmarks + ${r.historyImported} history ✓`;await loadBookmarks();}catch{b.disabled=false;b.lastElementChild.textContent="Import failed";}};migration.appendChild(b);
  }
}
$("#migrate").onclick=runMigration;
function cycleTab(delta){const list=workspaceTabs();if(list.length<2)return;const i=Math.max(0,list.findIndex(t=>t.id===state.activeId)),next=list[(i+delta+list.length)%list.length];window.veyra.switchTab(next.id);}
document.querySelectorAll("[data-command]").forEach(b=>b.onclick=async()=>{
  const command=b.dataset.command;
  if(command==="new")window.veyra.newTab();if(command==="reopen")await window.veyra.reopenClosed();if(command==="game")await setPreset("gaming");if(command==="control")showControl();
  if(command==="split")window.veyra.toggleSplit();if(command==="workspace")newWorkspace();if(command==="sleep")await window.veyra.sleepInactive();if(command==="bookmark")await bookmarkCurrent();
  if(command==="migrate")runMigration();if(command==="shield")await window.veyra.toggleShield();if(command==="focus"){url.focus();url.select();}hidePalette();
});
document.addEventListener("keydown",e=>{
  const mod=e.ctrlKey||e.metaKey,key=e.key.toLowerCase();
  if(mod&&key==="l"){e.preventDefault();url.focus();url.select();}if(mod&&key==="t"&&!e.shiftKey){e.preventDefault();window.veyra.newTab();}
  if(mod&&e.shiftKey&&key==="t"){e.preventDefault();window.veyra.reopenClosed();}if(mod&&key==="w"){e.preventDefault();if(state.activeId)window.veyra.closeTab(state.activeId);}
  if(mod&&key==="tab"){e.preventDefault();cycleTab(e.shiftKey?-1:1);}if(mod&&!e.shiftKey&&/^[1-9]$/.test(e.key)){const t=workspaceTabs()[Number(e.key)-1];if(t){e.preventDefault();window.veyra.switchTab(t.id);}}
  if(mod&&key==="k"){e.preventDefault();showPalette();}if(mod&&key==="d"){e.preventDefault();bookmarkCurrent();}if(mod&&e.shiftKey&&key==="s"){e.preventDefault();window.veyra.toggleSplit();}
  if(mod&&e.shiftKey&&key==="g"){e.preventDefault();setPreset("gaming");}if(mod&&e.shiftKey&&key==="n"){e.preventDefault();newWorkspace();}
  if(e.altKey&&/^[1-9]$/.test(e.key)){const w=state.workspaces[Number(e.key)-1];if(w){e.preventDefault();window.veyra.switchWorkspace(w.id);}}
  if(e.key==="Escape"){hidePalette();hideControl();}if(e.key==="/"&& !["INPUT","TEXTAREA"].includes(document.activeElement.tagName)&&!home.classList.contains("hidden")){e.preventDefault();$("#homeSearch").focus();}
});
