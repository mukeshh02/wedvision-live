const motionAllowed=!matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.add('js-ready');

// Scroll reveal animations
const observer=new IntersectionObserver(entries=>{
 for(const entry of entries){
  if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}
 }
},{threshold:.08,rootMargin:'0px 0px 30px 0px'});
document.querySelectorAll('[data-reveal]').forEach(element=>observer.observe(element));

// Main navigation active tracking
const links=[...document.querySelectorAll('.header nav a')];
const navObserver=new IntersectionObserver(entries=>{
 for(const entry of entries){
  if(!entry.isIntersecting)continue;
  links.forEach(link=>link.hash==='#'+entry.target.id?link.setAttribute('aria-current','location'):link.removeAttribute('aria-current'));
 }
},{rootMargin:'-15% 0px -55% 0px'});
links.forEach(link=>{
 if(!link.hash)return;
 const section=document.querySelector(link.hash);
 if(section)navObserver.observe(section);
});

// Mobile navigation drawer toggle
const navToggle=document.querySelector('.mobile-nav-toggle');
const navDrawer=document.querySelector('.mobile-nav-drawer');
function toggleMenu(open){
 if(!navDrawer||!navToggle)return;
 const isOpen=open!==undefined?open:!navDrawer.classList.contains('open');
 navDrawer.classList.toggle('open',isOpen);
 navToggle.setAttribute('aria-expanded',String(isOpen));
}

// Smooth scroll to #contact section and focus the input field
function scrollToContact(e){
 const target=document.querySelector('#contact');
 if(!target){
  // If not on homepage (e.g. legal pages), allow default navigation to /#contact
  return;
 }
 if(e&&e.preventDefault)e.preventDefault();
 if(navDrawer&&navDrawer.classList.contains('open')){
  toggleMenu(false);
 }
 const isMobile=window.innerWidth<=800;
 const headerOffset=isMobile?70:85;
 const currentScroll=window.pageYOffset||document.documentElement.scrollTop||document.body.scrollTop||0;
 const targetPos=target.getBoundingClientRect().top+currentScroll-headerOffset;
 window.scrollTo({top:Math.max(0,targetPos),behavior:'smooth'});

 const firstInput=target.querySelector('#contact-name');
 if(firstInput&&!isMobile){
  setTimeout(()=>{
   firstInput.focus({preventScroll:true});
  },700);
 }
}

if(navToggle&&navDrawer){
 navToggle.addEventListener('click',()=>toggleMenu());
 navDrawer.querySelectorAll('a').forEach(a=>{
  a.addEventListener('click',e=>{
   const href=a.getAttribute('href')||'';
   toggleMenu(false);
   if(href==='#contact'||href==='/#contact'){
    const target=document.querySelector('#contact');
    if(target){
     e.preventDefault();
     scrollToContact(e);
    }
   }else if(href.startsWith('#')){
    const target=document.querySelector(href);
    if(target){
     e.preventDefault();
     const currentScroll=window.pageYOffset||document.documentElement.scrollTop||document.body.scrollTop||0;
     const top=target.getBoundingClientRect().top+currentScroll-70;
     window.scrollTo({top:Math.max(0,top),behavior:'smooth'});
    }
   }
  });
 });
 document.addEventListener('click',e=>{
  if(navDrawer.classList.contains('open')&&!navDrawer.contains(e.target)&&!navToggle.contains(e.target)){
   toggleMenu(false);
  }
 });
 document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&navDrawer.classList.contains('open'))toggleMenu(false);
 });
}

// Bind all "Book a Meeting" buttons (excluding navDrawer which is handled above) to smoothly scroll to #contact
document.querySelectorAll('a[href="#contact"], a.button[href*="contact"]').forEach(btn=>{
 if(!btn.closest('.mobile-nav-drawer')){
  btn.addEventListener('click',scrollToContact);
 }
});

// On-page consultation form handler (in #contact section)
const contactForm=document.querySelector('#consultation-form');
if(contactForm){
 contactForm.addEventListener('submit',e=>{
  e.preventDefault();
  const name=contactForm.querySelector('#contact-name').value.trim();
  const studio=contactForm.querySelector('#contact-studio').value.trim();
  const contact=contactForm.querySelector('#contact-info').value.trim();
  const service=contactForm.querySelector('#contact-service').value;
  const message=contactForm.querySelector('#contact-msg').value.trim();

  const successBox=document.querySelector('.contact-form-success');
  if(successBox){
   contactForm.style.display='none';
   successBox.style.display='block';
   successBox.innerHTML='<strong>Thank you, '+name+'!</strong><br>We’ve received your details for <em>'+(studio||'your studio')+'</em>.<br>Our team will reach out via WhatsApp / Email within 24 hours to schedule our call.';
  }

  const subject=encodeURIComponent('WedVision Meeting Request: '+(studio||name));
  const body=encodeURIComponent('Name: '+name+'\nStudio: '+studio+'\nContact: '+contact+'\nService Needed: '+service+'\n\nNotes:\n'+message);
  const mailUrl='mailto:hello@wedvision.in?subject='+subject+'&body='+body;
  window.open(mailUrl,'_blank');
 });
}

// Portfolio category filtering with accessibility
const filterPills=document.querySelectorAll('.filter-pill');
filterPills.forEach(pill=>{
 pill.addEventListener('click',()=>{
  filterPills.forEach(p=>{
   p.classList.remove('active');
   p.setAttribute('aria-pressed','false');
  });
  pill.classList.add('active');
  pill.setAttribute('aria-pressed','true');
  const targetCategory=pill.dataset.filter;
  document.querySelectorAll('.project-card').forEach(card=>{
   const match=targetCategory==='all'||card.dataset.category.split(' ').includes(targetCategory);
   card.style.display=match?'flex':'none';
  });
 });
});
