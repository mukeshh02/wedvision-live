(() => {
 const allowMotion=!matchMedia('(prefers-reduced-motion: reduce)').matches;
 const root=document.querySelector('.journey');
 if(!root)return;
 const scrollRegion=root.querySelector('.journey-scroll'),pin=root.querySelector('.journey-pin'),scene=root.querySelector('.journey-scene');
 const steps=[
 {title:'Everything stops at you.',status:'Waiting',caption:'Every decision comes back to you.',label:'Inquiries, follow-ups, approvals, payments, team and delivery all waiting for the business owner.'},
 {title:'The system connects the work.',status:'Moving',caption:'Clear responsibilities. Clear next steps.',label:'WedVision connects all six business functions in a custom system. The owner has an overview while the team and work move forward.'},
 {title:'More work. Still in control.',status:'Connected',caption:'New work enters. The flow keeps moving.',label:'New inquiries and weddings join the connected workflow without creating another queue around the business owner.'}
 ];
 const buttons=[...root.querySelectorAll('[data-journey-step]')];
 let current=-1,frame=0;
 function setStep(index){
  index=Math.max(0,Math.min(2,index));if(index===current)return;current=index;
  scene.dataset.step=String(index);root.dataset.currentStep=String(index);
  root.querySelector('[data-stage-title]').textContent=steps[index].title;
  root.querySelector('[data-stage-status]').textContent=steps[index].status;
  root.querySelector('[data-stage-description]').textContent=steps[index].caption;
  root.querySelector('.business-map').setAttribute('aria-label',steps[index].label);
  buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(index===i)));
 }
 function measure(){
  if(!allowMotion||matchMedia('(max-height: 600px)').matches)return null;
  const top=parseFloat(getComputedStyle(pin).top)||90,rect=scrollRegion.getBoundingClientRect(),travel=Math.max(1,scrollRegion.offsetHeight-pin.offsetHeight);
  return {top,rect,travel,progress:Math.max(0,Math.min(1,(top-rect.top)/travel))};
 }
 function render(){frame=0;const m=measure();root.dataset.control=m?'scroll':'manual';if(m)setStep(Math.min(2,Math.floor(m.progress*3)));pin.style.setProperty('--journey-progress',String(m?m.progress:(current+1)/3));}
 function schedule(){if(!frame)frame=requestAnimationFrame(render);}
 buttons.forEach((b,i)=>b.addEventListener('click',()=>{const m=measure();if(!m){setStep(i);render();return;}scrollTo({top:scrollY+m.rect.top-m.top+m.travel*((i+.35)/3),behavior:'smooth'});}));
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});setStep(0);render();
 // A short overview of the same wedding workflow plays in the hero.
 const hero=document.querySelector('.hero-scene');
 if(!hero)return;
 const previewStates=[
  {label:'Inquiry organized',task:'Client details organized',detail:'Everything in its place',second:'A clear next step',secondDetail:'Your inquiry is connected',notice:'Organized'},
  {label:'Wedding project created',task:'Wedding project created',detail:'One place to track the work',second:'Client connected',secondDetail:'From inquiry to project',notice:'Tracked'},
  {label:'Team & files connected',task:'Photos shared with editor',detail:'The right files, in place',second:'Editor assigned',secondDetail:'Everyone knows what’s next',notice:'In progress'},
  {label:'Wedding gallery shared',task:'Gallery shared with client',detail:'The wedding story, delivered',second:'Project complete',secondDetail:'From first inquiry to delivery',notice:'Delivered'}
 ];
 const controls=hero.querySelector('.hero-playback');
 let previewStep=0,paused=!allowMotion,heroVisible=true;
 function setPreview(index){
  previewStep=index;
  const state=previewStates[index];
  hero.dataset.previewStep=String(index);
  hero.querySelector('.project-banner>div:nth-child(2)>small').textContent=state.label;
  const stageItems=hero.querySelectorAll('.app-stages>span');
  stageItems.forEach((item,i)=>{
   item.classList.toggle('done',i<index||index===3);
   item.classList.toggle('current',i===index&&index!==3);
   item.querySelector('b').textContent=i<index||index===3?'✓':'';
  });
  const taskItems=hero.querySelectorAll('.app-tasks>div>span');
  for(const [i,pair]of [[state.task,state.detail],[state.second,state.secondDetail]].entries()){
   taskItems[i].firstChild.textContent=pair[0];
   taskItems[i].querySelector('small').textContent=pair[1];
  }
  hero.querySelector('.label-inquiry>small').textContent=state.notice;
  if(allowMotion&&heroVisible&&hero.querySelector('.app-tasks').animate)hero.querySelector('.app-tasks').animate([{opacity:.35,translate:'0 4px'},{opacity:1,translate:'0 0'}],{duration:600,easing:'ease-out'});
 }
 if(controls){
  controls.addEventListener('click',()=>{
   paused=!paused;
   controls.setAttribute('aria-pressed',String(paused));
   controls.textContent=paused?'▶ Play preview':'Ⅱ Pause preview';
   controls.setAttribute('aria-label',paused?'Play automatic workflow preview':'Pause automatic workflow preview');
  });
  if(!allowMotion){controls.hidden=true;setPreview(3);}else setPreview(0);
 }
 const heroObserver=new IntersectionObserver(entries=>{heroVisible=entries[0].isIntersecting;},{threshold:.1});
 heroObserver.observe(hero);
 const timer=setInterval(()=>{if(!paused&&heroVisible&&!document.hidden)setPreview((previewStep+1)%previewStates.length);},3600);
 addEventListener('pagehide',()=>{clearInterval(timer);heroObserver.disconnect();},{once:true});
})();
