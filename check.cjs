
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const bundled=fs.readFileSync(__dirname+'/BREACH.html','utf8'),source=fs.readFileSync(__dirname+'/dist/game.js','utf8');
assert(bundled.includes(source),'Standalone JavaScript matches source');assert(bundled.includes(fs.readFileSync(__dirname+'/dist/style.css','utf8')),'Standalone CSS matches source');assert(!/window\.(?:BREACH|__qa)\s*=/.test(source),'No production diagnostic API');
const events={},elements={},store={};let nextFrame;
const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,getError:()=>0},{get:(o,k)=>o[k]||(()=>({}))});
function element(id){return elements[id]??={style:{},classList:{add(){},remove(){},toggle(){}},dataset:{},value:id==='difficulty'?'regular':'1',textContent:'',innerHTML:'',addEventListener(n,cb){events[id+':'+n]=cb;},querySelector:()=>element('paragraph'),getContext:()=>gl,requestPointerLock(){},disabled:false};}
const document={getElementById:element,addEventListener(n,cb){(events[n]??=[]).push(cb);},exitPointerLock(){},pointerLockElement:element('game')};const window={addEventListener(){}};let seed=129883;const random=Object.create(Math);random.random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
const sandbox={document,window,console,performance:{now:()=>1000},requestAnimationFrame:cb=>nextFrame=cb,innerWidth:1280,innerHeight:800,devicePixelRatio:1,Math:random,Float32Array,Int32Array,Set,localStorage:{getItem:k=>store[k]||null,setItem:(k,v)=>store[k]=v},setTimeout(){}};
const instrumented=source.replace('initializeUI();','window.__qa={run:code=>eval(code)};initializeUI();');vm.runInNewContext(instrumented,sandbox);const qa=window.__qa;qa.event=(name,event)=>{for(const cb of events[name]||[])cb({preventDefault(){},...event});};const results=require('./qa-tests.cjs')(qa);
console.log(JSON.stringify({checks:Object.keys(results).length,results,note:'Simulation with mocked WebGL; real browser tests are separate.'},null,2));for(const [name,pass]of Object.entries(results))assert.equal(pass,true,name);
