const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
function environment(reduced=false){
 const listeners={},timers=[],raf=[];
 const element=()=>({dataset:{},textContent:'',hidden:false,offsetHeight:500,offsetWidth:600,attributes:{},events:{},style:{setProperty(k,v){this[k]=v}},classList:{values:new Set(),add(k){this.values.add(k)},remove(k){this.values.delete(k)},toggle(k,yes){yes?this.values.add(k):this.values.delete(k)}},setAttribute(k,v){this.attributes[k]=v},addEventListener(k,cb){this.events[k]=cb},animate(){},querySelector(k){return this.nodes[k]},querySelectorAll(k){return this.lists[k]},nodes:{},lists:{}});
 const root=element(),pin=element(),scene=element(),scroll=element(),hero=element();
 scroll.offsetHeight=2400;scroll.top=100;scroll.getBoundingClientRect=()=>({top:scroll.top});
 const buttons=Array.from({length:3},element);
 root.nodes['.journey-scroll']=scroll;root.nodes['.journey-pin']=pin;root.nodes['.journey-scene']=scene;
 root.lists['[data-journey-step]']=buttons;
 for(const key of ['[data-stage-title]','.journey-kicker','[data-stage-status]','[data-project-label]','[data-owner-label]','[data-event-title]','[data-event-subtitle]','[data-chat-reply]','[data-chat-update]','[data-stage-description]','.event-symbol use','.mini-avatar','.business-map'])root.nodes[key]=element();
 const controls=element();hero.nodes['.hero-playback']=controls;
 for(const key of ['.project-banner>div:nth-child(2)>small','.label-inquiry>small','.app-tasks'])hero.nodes[key]=element();
 hero.lists['.app-stages>span']=Array.from({length:4},()=>{const x=element();x.nodes.b=element();return x});
 hero.lists['.app-tasks>div>span']=Array.from({length:2},()=>{const x=element();x.firstChild={textContent:''};x.nodes.small=element();return x});
 const context={console,document:{hidden:false,querySelector(k){return k==='.journey'?root:k==='.hero-scene'?hero:null}},matchMedia(query){return{matches:query.includes('prefers-reduced-motion')&&reduced}},getComputedStyle(){return{top:'100px'}},requestAnimationFrame(cb){raf.push(cb);return raf.length},addEventListener(k,cb){listeners[k]=cb},setInterval(cb){timers.push(cb);return timers.length},clearInterval(){},IntersectionObserver:class{constructor(cb){this.callback=cb}observe(){this.callback([{isIntersecting:true}])}disconnect(){}},scrollY:0,scrollTo(position){context.lastScroll=position}};
 vm.runInNewContext(fs.readFileSync('public/journey.js','utf8'),context);
 return{root,pin,scene,scroll,hero,buttons,controls,context,listeners,timers,raf,flush(){while(raf.length)raf.shift()()}};
}
const normal=environment();
for(const [i,progress]of [0,.4,.8].entries()){
 normal.scroll.top=100-progress*(2400-500);normal.listeners.scroll();normal.flush();
 assert.equal(normal.scene.dataset.step,String(i));
 assert.equal(normal.buttons[i].attributes['aria-pressed'],'true');
 assert.equal(normal.buttons.filter(x=>x.attributes['aria-pressed']==='true').length,1);
}
assert.equal(normal.root.nodes['[data-stage-status]'].textContent,'Connected');
assert.match(normal.root.nodes['.business-map'].attributes['aria-label'],/New inquiries/);
normal.buttons[0].events.click();assert.equal(normal.context.lastScroll.behavior,'smooth');
normal.timers[0]();assert.equal(normal.hero.dataset.previewStep,'1');
normal.controls.events.click();normal.timers[0]();assert.equal(normal.hero.dataset.previewStep,'1');
normal.controls.events.click();normal.timers[0]();assert.equal(normal.hero.dataset.previewStep,'2');
normal.context.document.hidden=true;normal.timers[0]();assert.equal(normal.hero.dataset.previewStep,'2');
const reduced=environment(true);
assert.equal(reduced.root.dataset.control,'manual');
assert.equal(reduced.controls.hidden,true);
assert.equal(reduced.hero.dataset.previewStep,'3');
reduced.buttons[2].events.click();assert.equal(reduced.scene.dataset.step,'2');
reduced.buttons[2].events.click();assert.equal(reduced.root.nodes['[data-stage-status]'].textContent,'Connected');
console.log('PASS: three business transformation stages, accessible scene descriptions, single active step, step navigation, hero playback, pause/resume, hidden-tab pause and reduced-motion manual controls.');
