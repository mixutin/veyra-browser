const fs=require("fs");
const path=require("path");
const DEFAULTS={version:1,activeWorkspaceId:"personal",workspaces:[
{id:"personal",name:"Personal",icon:"P"},{id:"work",name:"Work",icon:"W"},{id:"research",name:"Research",icon:"R"}],
tabs:[],recentlyClosed:[],activeByWorkspace:{},splitByWorkspace:{}};
function normalize(raw={}){
const s={...DEFAULTS,...raw};
s.workspaces=Array.isArray(raw.workspaces)&&raw.workspaces.length?raw.workspaces:DEFAULTS.workspaces;
s.tabs=Array.isArray(raw.tabs)?raw.tabs:[];
s.recentlyClosed=Array.isArray(raw.recentlyClosed)?raw.recentlyClosed.slice(0,20):[];
s.activeByWorkspace=raw.activeByWorkspace&&typeof raw.activeByWorkspace==="object"?raw.activeByWorkspace:{};
s.splitByWorkspace=raw.splitByWorkspace&&typeof raw.splitByWorkspace==="object"?raw.splitByWorkspace:{};
if(!s.workspaces.some(w=>w.id===s.activeWorkspaceId))s.activeWorkspaceId=s.workspaces[0].id;
return s;
}
function createStore(userData){
const file=path.join(userData,"veyra-state.json");
let state=normalize();
try{state=normalize(JSON.parse(fs.readFileSync(file,"utf8")))}catch{}
const save=()=>{const tmp=file+".tmp";fs.writeFileSync(tmp,JSON.stringify(state,null,2));fs.renameSync(tmp,file);};
return{file,get:()=>state,replace:v=>{state=normalize(v);save();return state;},save};
}
module.exports={createStore,normalize};