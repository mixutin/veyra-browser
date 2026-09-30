const test=require("node:test");
const assert=require("node:assert/strict");
const resources=require("../src/resources");

test("gaming preset aggressively limits warm tabs",()=>{
  const p=resources.preset("gaming");
  assert.equal(p.preset,"gaming");
  assert.equal(p.warmTabs,3);
  assert.equal(p.ramTargetMB,1024);
  assert.equal(p.autoSleep,true);
});

test("custom policy clamps unsafe values",()=>{
  const p=resources.normalizePolicy({preset:"custom",warmTabs:0,ramTargetMB:99,autoSleepMinutes:999});
  assert.equal(p.warmTabs,1);
  assert.equal(p.ramTargetMB,512);
  assert.equal(p.autoSleepMinutes,240);
});

test("resource controller never sleeps active or split tabs",()=>{
  const tabs=[
    {id:1,view:{},lastActiveAt:1},
    {id:2,view:{},lastActiveAt:1},
    {id:3,view:{},lastActiveAt:1},
    {id:4,view:{},lastActiveAt:1}
  ];
  const policy=resources.normalizePolicy({preset:"custom",warmTabs:1,ramTargetMB:4096,autoSleepMinutes:240});
  const ids=resources.decideSleeps({tabs,activeId:1,splitId:2,policy,stats:{memoryMB:100},now:2});
  assert.deepEqual(ids.sort(),[3,4]);
});