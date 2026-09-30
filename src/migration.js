const fs=require("fs"),path=require("path"),os=require("os");
function chromiumRoots(){
  const h=os.homedir(),p=process.platform;
  if(p==="linux")return[{name:"Chrome",dir:path.join(h,".config/google-chrome")},{name:"Chromium",dir:path.join(h,".config/chromium")},{name:"Brave",dir:path.join(h,".config/BraveSoftware/Brave-Browser")},{name:"Edge",dir:path.join(h,".config/microsoft-edge")}];
  if(p==="darwin")return[{name:"Chrome",dir:path.join(h,"Library/Application Support/Google/Chrome")},{name:"Brave",dir:path.join(h,"Library/Application Support/BraveSoftware/Brave-Browser")},{name:"Edge",dir:path.join(h,"Library/Application Support/Microsoft Edge")}];
  const base=process.env.LOCALAPPDATA||"";
  return[{name:"Chrome",dir:path.join(base,"Google/Chrome/User Data")},{name:"Brave",dir:path.join(base,"BraveSoftware/Brave-Browser/User Data")},{name:"Edge",dir:path.join(base,"Microsoft/Edge/User Data")}];
}
function firefoxRoot(){
  const h=os.homedir();
  return process.platform==="linux"?path.join(h,".mozilla/firefox"):process.platform==="darwin"?path.join(h,"Library/Application Support/Firefox/Profiles"):path.join(process.env.APPDATA||"","Mozilla/Firefox/Profiles");
}
function scan(){
  const out=[];
  for(const browser of chromiumRoots())if(fs.existsSync(browser.dir))for(const profile of fs.readdirSync(browser.dir)){
    const bookmarks=path.join(browser.dir,profile,"Bookmarks"),history=path.join(browser.dir,profile,"History");
    if(fs.existsSync(bookmarks)||fs.existsSync(history))out.push({id:browser.name+":"+profile,name:browser.name,profile,type:"chromium",bookmarks,history});
  }
  const root=firefoxRoot();
  if(fs.existsSync(root))for(const profile of fs.readdirSync(root)){const places=path.join(root,profile,"places.sqlite");if(fs.existsSync(places))out.push({id:"Firefox:"+profile,name:"Firefox",profile,type:"firefox",places});}
  return out;
}
function walk(node,out=[]){if(!node)return out;if(node.type==="url"&&node.url)out.push({title:node.name||node.url,url:node.url});for(const child of node.children||[])walk(child,out);return out;}
function chromiumBookmarks(file){
  if(!file||!fs.existsSync(file))return[];const json=JSON.parse(fs.readFileSync(file,"utf8")),out=[];
  for(const root of Object.values(json.roots||{}))walk(root,out);return out;
}
function withDb(file,userData,fn){
  if(!file||!fs.existsSync(file))return[];
  const {DatabaseSync}=require("node:sqlite"),tmp=path.join(userData,"migration-"+process.pid+"-"+Date.now()+".sqlite");
  try{fs.copyFileSync(file,tmp);const db=new DatabaseSync(tmp,{readOnly:true});try{return fn(db)}finally{db.close();}}finally{try{fs.unlinkSync(tmp)}catch{}}
}
function chromiumHistory(file,userData){
  return withDb(file,userData,db=>db.prepare("SELECT title,url,last_visit_time FROM urls WHERE url IS NOT NULL ORDER BY last_visit_time DESC LIMIT 50000").all().map(r=>({title:r.title||r.url,url:r.url,visitedAt:Math.max(0,Number(r.last_visit_time)/1000-11644473600000)})));
}
function firefoxData(file,userData){
  return withDb(file,userData,db=>{
    const bookmarks=db.prepare("SELECT COALESCE(b.title,p.title,p.url) title,p.url FROM moz_bookmarks b JOIN moz_places p ON p.id=b.fk WHERE b.type=1 AND p.url IS NOT NULL ORDER BY b.id").all().map(r=>({title:r.title||r.url,url:r.url}));
    const history=db.prepare("SELECT COALESCE(title,url) title,url,last_visit_date FROM moz_places WHERE last_visit_date IS NOT NULL AND url IS NOT NULL ORDER BY last_visit_date DESC LIMIT 50000").all().map(r=>({title:r.title||r.url,url:r.url,visitedAt:Number(r.last_visit_date)/1000}));
    return{bookmarks,history};
  });
}
function mergeJson(file,items,key){
  let old=[];try{old=JSON.parse(fs.readFileSync(file,"utf8"))}catch{}
  const merged=new Map([...old,...items].filter(x=>x&&x[key]).map(x=>[x[key],x]));
  fs.writeFileSync(file,JSON.stringify([...merged.values()],null,2));return merged.size;
}
function importProfile(source,userData){
  let bookmarks=[],history=[];
  if(source.type==="firefox"){const data=firefoxData(source.places,userData);bookmarks=data.bookmarks;history=data.history;}
  else{bookmarks=chromiumBookmarks(source.bookmarks);history=chromiumHistory(source.history,userData);}
  const bookmarkFile=path.join(userData,"bookmarks.json"),historyFile=path.join(userData,"history.json");
  const totalBookmarks=mergeJson(bookmarkFile,bookmarks,"url"),totalHistory=mergeJson(historyFile,history.filter(x=>/^https?:\/\//.test(x.url)),"url");
  return{bookmarksImported:bookmarks.length,historyImported:history.length,totalBookmarks,totalHistory};
}
module.exports={scan,importProfile};