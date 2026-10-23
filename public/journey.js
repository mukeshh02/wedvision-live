(() => {
 const allowMotion=!matchMedia('(prefers-reduced-motion: reduce)').matches;
 const root=document.querySelector('.journey');
 const scrollRegion=root?.querySelector('.journey-scroll');
 const pin=root?.querySelector('.journey-pin');
 const scene=root?.querySelector('.journey-scene');
 if(!root||!scrollRegion||!pin||!scene)return;
 const steps=[
  {title:'A conversation becomes a client.',kicker:'INQUIRY RECEIVED',status:'Organized',project:'New inquiry',owner:'Your business',event:'Client details, in one place.',sub:'No message left to search for.',reply:'Your inquiry is with us. Let’s talk.',update:'Inquiry organized',caption:'An inquiry becomes an organized client record.',icon:'person'},
  {title:'The same inquiry. Now a project.',kicker:'PROJECT CREATED',status:'Tracked',project:'Project created',owner:'Your business',event:'A clear next step for every wedding.',sub:'Your client and project stay connected.',reply:'Your wedding project is ready. We’ll keep you updated.',update:'Project created',caption:'The client record becomes a project your team can follow.',icon:'plan'},
  {title:'The right files. The right people.',kicker:'TEAM & FILES CONNECTED',status:'In progress',project:'Editing in progress',owner:'Your editor',event:'Editor assigned. Files shared.',sub:'Everyone knows what they’re working on.',reply:'Your photos are with our editor. Your story is coming together.',update:'Team & files connected',caption:'Your editor, project and wedding files connect in the same workflow.',icon:'team'},
  {title:'From your team. To your client.',kicker:'GALLERY SHARED',status:'Delivered',project:'Gallery shared',owner:'Your client',event:'Your gallery is ready to share.',sub:'Delivery stays connected to the project.',reply:'Your wedding gallery is ready. Here’s your story.',update:'Gallery shared with client',caption:'The finished wedding gallery reaches your client.',icon:'gallery'}
 ];
 const buttons=[...root.querySelectorAll('[data-journey-step]')];
 let current=-1;
 let animationFrame=0;
 const fields={title:'[data-stage-title]',kicker:'.journey-kicker',status:'[data-stage-status]',project:'[data-project-label]',owner:'[data-owner-label]',event:'[data-event-title]',sub:'[data-event-subtitle]',reply:'[data-chat-reply]',update:'[data-chat-update]',caption:'[data-stage-description]'};
 function setStep(index,animate=true){
  index=Math.max(0,Math.min(steps.length-1,index));
  if(index===current)return;
  const first=current===-1;
  current=index;
  scene.dataset.step=String(index);
  root.dataset.currentStep=String(index);
  const state=steps[index];
  for(const [key,selector] of Object.entries(fields)){
   const element=root.querySelector(selector);
   element.textContent=state[key];
   if(allowMotion&&animate&&!first&&element.animate&&['title','reply','event'].includes(key))element.animate([{opacity:.35,translate:'0 4px'},{opacity:1,translate:'0 0'}],{duration:500,easing:'ease-out'});
  }
  root.querySelector('.event-symbol use').setAttribute('href','#'+state.icon);
  root.querySelector('.mini-avatar').textContent=index===2?'E':index===3?'C':'Y';
  buttons.forEach((button,i)=>{
   button.setAttribute('aria-pressed',String(i===index));
   button.classList.toggle('passed',i<index);
  });
  if(allowMotion&&animate&&!first){
   scene.classList.remove('in-transit');
   void scene.offsetWidth;
   scene.classList.add('in-transit');
  }
 }
 function isManual(){return !allowMotion||matchMedia('(max-height: 600px)').matches;}
 function measure(){
  if(isManual())return null;
  const top=parseFloat(getComputedStyle(pin).top)||90;
  const rect=scrollRegion.getBoundingClientRect();
  const travel=Math.max(1,scrollRegion.offsetHeight-pin.offsetHeight);
  return {top,rect,travel,progress:Math.max(0,Math.min(1,(top-rect.top)/travel))};
 }
 function renderScroll(){
  animationFrame=0;
  const measured=measure();
  root.dataset.control=measured?'scroll':'manual';
  if(!measured){pin.style.setProperty('--journey-progress',String((current+1)/4));return;}
  pin.style.setProperty('--journey-progress',String(measured.progress));
  setStep(Math.min(3,Math.floor(measured.progress*4)));
 }
 function schedule(){if(!animationFrame)animationFrame=requestAnimationFrame(renderScroll);}
 buttons.forEach((button,index)=>button.addEventListener('click',()=>{
  const measured=measure();
  if(!measured){setStep(index);pin.style.setProperty('--journey-progress',String((index+1)/4));return;}
  const position=scrollY+measured.rect.top-measured.top+measured.travel*((index+.4)/4);
  scrollTo({top:position,behavior:allowMotion?'smooth':'instant'});
 }));
 addEventListener('scroll',schedule,{passive:true});
 addEventListener('resize',schedule,{passive:true});
 setStep(0,false);
 renderScroll();

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
