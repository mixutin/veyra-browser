const PRESETS={
  gaming:{preset:"gaming",warmTabs:3,ramTargetMB:1024,autoSleepMinutes:5,autoSleep:true,backgroundThrottling:true},
  balanced:{preset:"balanced",warmTabs:8,ramTargetMB:2048,autoSleepMinutes:30,autoSleep:true,backgroundThrottling:true},
  saver:{preset:"saver",warmTabs:4,ramTargetMB:768,autoSleepMinutes:10,autoSleep:true,backgroundThrottling:true}
};
function clamp(n,min,max){return Math.min(max,Math.max(min,Number(n)||min));}
function normalizePolicy(raw={}){
  const base=PRESETS[raw.preset]||PRESETS.balanced;
  return{
    preset:["gaming","balanced","saver","custom"].includes(raw.preset)?raw.preset:base.preset,
    warmTabs:clamp(raw.warmTabs??base.warmTabs,1,24),
    ramTargetMB:clamp(raw.ramTargetMB??base.ramTargetMB,512,16384),
    autoSleepMinutes:clamp(raw.autoSleepMinutes??base.autoSleepMinutes,1,240),
    autoSleep:raw.autoSleep===undefined?base.autoSleep:Boolean(raw.autoSleep),
    backgroundThrottling:raw.backgroundThrottling===undefined?base.backgroundThrottling:Boolean(raw.backgroundThrottling)
  };
}
function preset(name){return normalizePolicy(PRESETS[name]||PRESETS.balanced);}
function candidates(tabs,activeId,splitId){
  return tabs.filter(t=>t.view&&t.id!==activeId&&t.id!==splitId).sort((a,b)=>(a.lastActiveAt||0)-(b.lastActiveAt||0));
}
function totalMetrics(app){
  const metrics=app.getAppMetrics();
  let cpu=0,memoryKB=0;
  for(const m of metrics){cpu+=Number(m.cpu?.percentCPUUsage)||0;memoryKB+=Number(m.memory?.workingSetSize)||0;}
  return{cpuPercent:Math.round(cpu*10)/10,memoryMB:Math.round(memoryKB/1024),processes:metrics.length};
}
function decideSleeps({tabs,activeId,splitId,policy,stats,now=Date.now()}){
  if(!policy.autoSleep)return[];
  const loaded=tabs.filter(t=>t.view).length,list=candidates(tabs,activeId,splitId),out=[];
  let projected=loaded;
  for(const t of list){
    const stale=now-(t.lastActiveAt||0)>=policy.autoSleepMinutes*60_000;
    const overWarm=projected>policy.warmTabs;
    const overMemory=stats.memoryMB>policy.ramTargetMB&&out.length===0;
    if(stale||overWarm||overMemory){out.push(t.id);projected--;}
  }
  return out;
}
module.exports={PRESETS,normalizePolicy,preset,totalMetrics,decideSleeps};