const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("fs"),os=require("os"),path=require("path");
const library=require("../src/library");
test("bookmarks deduplicate by URL",()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),"veyra-lib-"));
  assert.equal(library.addBookmark(dir,{title:"A",url:"https://example.com"}).added,true);
  assert.equal(library.addBookmark(dir,{title:"Again",url:"https://example.com"}).added,false);
  assert.equal(library.listBookmarks(dir).length,1);fs.rmSync(dir,{recursive:true,force:true});
});
test("history keeps newest visit first and deduplicates",()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),"veyra-lib-"));
  library.recordHistory(dir,{title:"One",url:"https://example.com"});library.recordHistory(dir,{title:"Two",url:"https://example.org"});library.recordHistory(dir,{title:"One again",url:"https://example.com"});
  const h=library.listHistory(dir);assert.equal(h.length,2);assert.equal(h[0].url,"https://example.com");fs.rmSync(dir,{recursive:true,force:true});
});