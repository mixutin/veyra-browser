const test=require("node:test");
const assert=require("node:assert/strict");
const {normalize}=require("../src/state");
test("state normalization restores required defaults",()=>{
  const s=normalize({activeWorkspaceId:"missing",workspaces:[{id:"one",name:"One",icon:"O"}]});
  assert.equal(s.activeWorkspaceId,"one");assert.deepEqual(s.tabs,[]);assert.deepEqual(s.activeByWorkspace,{});
});
test("valid workspace selection is preserved",()=>{
  const s=normalize({activeWorkspaceId:"work",workspaces:[{id:"work",name:"Work",icon:"W"}],tabs:[{id:1}]});
  assert.equal(s.activeWorkspaceId,"work");assert.equal(s.tabs.length,1);
});