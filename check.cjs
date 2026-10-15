const fs=require('fs'),vm=require('vm'),assert=require('assert');
const bundled=fs.readFileSync(__dirname+'/BREACH.html','utf8');
assert(bundled.includes(fs.readFileSync(__dirname+'/dist/game.js','utf8')),'Standalone JavaScript matches source');
assert(bundled.includes(fs.readFileSync(__dirname+'/dist/style.css','utf8')),'Standalone CSS matches source');
const events={};const elements={};let nextFrame;
const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,getError:()=>0},{get:(o,k)=>o[k]||(()=>({}))});
function element(id){return elements[id]??={style:{},classList:{add(){},remove(){}},value:id==='difficulty'?'regular':'1',textContent:'',innerHTML:'',addEventListener(){},getContext:()=>gl,requestPointerLock(){}};}
const document={getElementById:element,addEventListener:(n,cb)=>events[n]=cb,exitPointerLock(){},pointerLockElement:element('game')};
const window={addEventListener(){}};const sandbox={document,window,console,performance:{now:()=>1000},requestAnimationFrame:cb=>nextFrame=cb,innerWidth:1280,innerHeight:800,devicePixelRatio:1,Math,Float32Array,Int32Array};
vm.runInNewContext(fs.readFileSync(__dirname+'/dist/game.js','utf8'),sandbox);
const game=window.BREACH;const tests=game.test();for(const [name,pass]of Object.entries(tests))assert(pass,name);
game.start();let a=game.getState();events.keydown({code:'KeyW',preventDefault(){}});for(let i=0;i<30;i++)game.update(.016);events.keyup({code:'KeyW'});let walked=game.getState().position[2];assert(walked<17,'WASD movement');events.keydown({code:'KeyW',preventDefault(){}});events.keydown({code:'ShiftLeft'});for(let i=0;i<30;i++)game.update(.016);let sprinted=game.getState().position[2];assert(walked-sprinted>3,'Sprint speed');events.keydown({code:'KeyC'});game.update(.016);assert(element('movement').textContent==='SLIDING','Slide activates');events.keyup({code:'KeyW'});events.keyup({code:'ShiftLeft'});
for(let i=0;i<180;i++)game.update(.016);game.render();assert(game.getState().errors.length===0,'No simulation errors');
console.log(JSON.stringify({checks:{...tests,movement:true,sprint:true,slide:true,simulation:true},note:'Simulation uses a mocked WebGL context; visual browser QA is separate.'},null,2));
