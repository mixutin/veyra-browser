const fs=require("fs"),path=require("path");
function read(file){try{const v=JSON.parse(fs.readFileSync(file,"utf8"));return Array.isArray(v)?v:[]}catch{return[];}}
function write(file,value){const tmp=file+".tmp";fs.writeFileSync(tmp,JSON.stringify(value,null,2));fs.renameSync(tmp,file);}
function bookmarkFile(userData){return path.join(userData,"bookmarks.json");}
function historyFile(userData){return path.join(userData,"history.json");}
function listBookmarks(userData,limit=24){return read(bookmarkFile(userData)).slice(0,limit);}
function addBookmark(userData,item){
  if(!item?.url||!/^https?:\/\//.test(item.url))return{added:false};
  const file=bookmarkFile(userData),items=read(file),exists=items.some(x=>x.url===item.url);
  if(!exists){items.unshift({title:item.title||item.url,url:item.url,addedAt:Date.now()});write(file,items);}
  return{added:!exists,total:items.length};
}
function recordHistory(userData,item){
  if(!item?.url||!/^https?:\/\//.test(item.url))return;
  const file=historyFile(userData),items=read(file).filter(x=>x.url!==item.url);
  items.unshift({title:item.title||item.url,url:item.url,visitedAt:Date.now()});write(file,items.slice(0,50000));
}
function listHistory(userData,limit=100){return read(historyFile(userData)).sort((a,b)=>(b.visitedAt||0)-(a.visitedAt||0)).slice(0,limit);}
module.exports={listBookmarks,addBookmark,recordHistory,listHistory};