const $=s=>document.querySelector(s);
const tabsEl=$("#tabs"),rail=$("#workspaceRail"),home=$("#home"),url=$("#url"),palette=$("#palette"),migration=$("#migration"),bookmarksGrid=$("#bookmarksGrid");
let state={tabs:[],workspaces:[],activeWorkspaceId:"",activeId:0,splitId:0,shield:{enabled:false,blocked:0,cleaned:0}};
function activeTab(){return state.tabs.find(t=>t.id===state.activeId);}
function renderWorkspaces(){
  rail.innerHTML="";
  for(const [i,w] of state.workspaces.entries()){
    const b=document.createElement("button");b.className="rail-btn workspace-dot "+(w.id===state.activeWorkspaceId?"active":"");
    b.textContent=w.icon||w.name[0]?.toUpperCase()||String(i+1);b.title=w.name;b.onclick=()=>window.veyra.switchWorkspace(w.id);rail.appendChild(b);
  }
  const active=state.workspaces.find(w=>w.id===state.activeWorkspaceId);$("#workspaceName").textContent=active?.name||"Workspace";
}
function renderTabs(){
  tabsEl.innerHTML="";const list=state.tabs.filter(t=>t.workspaceId===state.activeWorkspaceId);
  for(const t of list){
    const row=document.createElement("div");row.className="tab "+(t.id===state.activeId?"active ":"")+(t.id===state.splitId?"split ":"")+(t.sleeping?"sleeping":"");
    row.innerHTML="<span class='favicon'></span><span class='tabtitle'></span><span class='badge'></span><button class='close'>×</button>";
    row.querySelector(".favicon").textContent=t.loading?"◌":t.url==="veyra://home"?"⌂":"●";
    row.querySelector(".tabtitle").textContent=t.title||"New Tab";
    row.querySelector(".badge").textContent=t.id===state.splitId?"SPLIT":t.sleeping?"SLEEP":"";
    row.onclick=()=>window.veyra.switchTab(t.id);row.querySelector(".close").onclick=e=>{e.stopPropagation();window.veyra.closeTab(t.id)};tabsEl.appendChild(row);
  }
}
function render(next){
  state=next;renderWorkspaces();renderTabs();
  const active=activeTab(),isHome=!active||active.url==="veyra://home";
  home.classList.toggle("hidden",!isHome);home.classList.toggle("split-home",isHome&&!!state.splitId);
  url.value=isHome?"":active.url;$("#split").classList.toggle("active",!!state.splitId);
  const s=state.shield||{};$("#shield").classList.toggle("off",!s.enabled);
  $("#shieldStats").textContent=s.enabled?`${Number(s.blocked||0).toLocaleString()} blocked · ${Number(s.cleaned||0)} cleaned`:"OFF";
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
$("#cmd").onclick=showPalette;$("#paletteBtn").onclick=showPalette;palette.onclick=e=>{if(e.target===palette)hidePalette();};
function filterCommands(value){const q=value.trim().toLowerCase();document.querySelectorAll("[data-command]").forEach(b=>b.classList.toggle("hidden",q&&!b.textContent.toLowerCase().includes(q)));}
$("#commandInput").oninput=e=>filterCommands(e.target.value);
async function loadBookmarks(){
  const items=await window.veyra.bookmarks();bookmarksGrid.innerHTML="";
  if(!items.length){const empty=document.createElement("div");empty.className="bookmark-empty";empty.textContent="No bookmarks yet. Import a browser profile or press ☆ on any page.";bookmarksGrid.appendChild(empty);return;}
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
  const title=document.createElement("div");title.className="migration-title";title.textContent=sources.length?"Choose a browser profile":"No importable browser profiles found.";migration.appendChild(title);
  for(const source of sources){
    const b=document.createElement("button");b.innerHTML="<span><b></b><small></small></span><span>Import →</span>";
    b.querySelector("b").textContent=source.name;b.querySelector("small").textContent=source.profile;
    b.onclick=async()=>{b.disabled=true;b.lastElementChild.textContent="Importing…";try{const r=await window.veyra.importProfile(source);b.lastElementChild.textContent=`${r.bookmarksImported} bookmarks + ${r.historyImported} history ✓`;await loadBookmarks();}catch{b.disabled=false;b.lastElementChild.textContent="Import failed";}};
    migration.appendChild(b);
  }
}
$("#migrate").onclick=runMigration;
function workspaceTabs(){return state.tabs.filter(t=>t.workspaceId===state.activeWorkspaceId);}
function cycleTab(delta){const list=workspaceTabs();if(list.length<2)return;const i=Math.max(0,list.findIndex(t=>t.id===state.activeId)),next=list[(i+delta+list.length)%list.length];window.veyra.switchTab(next.id);}
document.querySelectorAll("[data-command]").forEach(b=>b.onclick=async()=>{
  const command=b.dataset.command;
  if(command==="new")window.veyra.newTab();
  if(command==="reopen")await window.veyra.reopenClosed();
  if(command==="split")window.veyra.toggleSplit();
  if(command==="workspace")newWorkspace();
  if(command==="sleep")await window.veyra.sleepInactive();
  if(command==="bookmark")await bookmarkCurrent();
  if(command==="migrate")runMigration();
  if(command==="shield")await window.veyra.toggleShield();
  if(command==="focus"){url.focus();url.select();}
  hidePalette();
});
document.addEventListener("keydown",e=>{
  const mod=e.ctrlKey||e.metaKey,key=e.key.toLowerCase();
  if(mod&&key==="l"){e.preventDefault();url.focus();url.select();}
  if(mod&&key==="t"&&!e.shiftKey){e.preventDefault();window.veyra.newTab();}
  if(mod&&e.shiftKey&&key==="t"){e.preventDefault();window.veyra.reopenClosed();}
  if(mod&&key==="w"){e.preventDefault();if(state.activeId)window.veyra.closeTab(state.activeId);}
  if(mod&&key==="tab"){e.preventDefault();cycleTab(e.shiftKey?-1:1);}
  if(mod&&!e.shiftKey&&/^[1-9]$/.test(e.key)){const t=workspaceTabs()[Number(e.key)-1];if(t){e.preventDefault();window.veyra.switchTab(t.id);}}
  if(mod&&key==="k"){e.preventDefault();showPalette();}
  if(mod&&key==="d"){e.preventDefault();bookmarkCurrent();}
  if(mod&&e.shiftKey&&key==="s"){e.preventDefault();window.veyra.toggleSplit();}
  if(mod&&e.shiftKey&&key==="n"){e.preventDefault();newWorkspace();}
  if(e.altKey&&/^[1-9]$/.test(e.key)){const w=state.workspaces[Number(e.key)-1];if(w){e.preventDefault();window.veyra.switchWorkspace(w.id);}}
  if(e.key==="Escape")hidePalette();
  if(e.key==="/"&&!["INPUT","TEXTAREA"].includes(document.activeElement.tagName)&&!home.classList.contains("hidden")){e.preventDefault();$("#homeSearch").focus();}
});