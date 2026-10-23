const motionAllowed=!matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.add('js-ready');
const observer=new IntersectionObserver(entries=>{
 for(const entry of entries){
  if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}
 }
},{threshold:.08,rootMargin:'0px 0px 30px 0px'});
document.querySelectorAll('[data-reveal]').forEach(element=>observer.observe(element));
const links=[...document.querySelectorAll('.header nav a')];
const navObserver=new IntersectionObserver(entries=>{
 for(const entry of entries){
  if(!entry.isIntersecting)continue;
  links.forEach(link=>link.hash==='#'+entry.target.id?link.setAttribute('aria-current','location'):link.removeAttribute('aria-current'));
 }
},{rootMargin:'-15% 0px -55% 0px'});
links.forEach(link=>{const section=document.querySelector(link.hash);if(section)navObserver.observe(section);});
document.querySelectorAll('.filter-pill').forEach(pill=>{
 pill.addEventListener('click',()=>{
  document.querySelectorAll('.filter-pill').forEach(p=>p.classList.remove('active'));
  pill.classList.add('active');
  const targetCategory=pill.dataset.filter;
  document.querySelectorAll('.project-card').forEach(card=>{
   const match=targetCategory==='all'||card.dataset.category.split(' ').includes(targetCategory);
   card.style.display=match?'flex':'none';
  });
 });
});
// Visual examples represent possible custom solutions, not ready-made products.
// TODO: Replace meeting-link placeholders with the official booking destination.
