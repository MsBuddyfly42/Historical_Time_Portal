/* Progressive UX features; the original world engine remains unchanged. */
(()=>{'use strict';
const $=s=>document.querySelector(s),$$=s=>Array.from(document.querySelectorAll(s));
const reduce=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const moveTo=id=>document.getElementById(id)?.scrollIntoView({behavior:reduce()?'instant':'smooth',block:'start'});
document.addEventListener('DOMContentLoaded',()=>{
  const search=$('#destinationSearch'),cards=$$('#destinationGrid .destination-card'),counter=$('#destinationCount');
  const renderSearch=()=>{const q=(search?.value||'').trim().toLocaleLowerCase();let shown=0;
    cards.forEach(card=>{const match=card.textContent.toLocaleLowerCase().includes(q);card.hidden=!match;if(match)shown++});
    if(counter)counter.textContent=`${shown} of ${cards.length} worlds to discover`;
    if($('#destinationEmpty'))$('#destinationEmpty').hidden=!!shown;
  };
  search?.addEventListener('input',renderSearch);renderSearch();
  const more=$('#morePortalsBtn'),quick=$('#quickPortals');
  more?.addEventListener('click',()=>{const isOpen=quick.classList.toggle('expanded');more.setAttribute('aria-expanded',String(isOpen));more.textContent=isOpen?'Show fewer quick portals ↑':'Explore all 20 quick portals ↓'});
  const modeButtons=$$('.mode-card');
  const syncModes=()=>modeButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.classList.contains('active'))));
  modeButtons.forEach(b=>b.addEventListener('click',()=>{syncModes();moveTo('experiencePanel')}));syncModes();
  const nav=$$('.jump-nav a'),progress=$('#scrollProgress'),top=$('#backToTop');
  let pending=false;const onScroll=()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{
    const max=Math.max(1,document.documentElement.scrollHeight-window.innerHeight),y=window.scrollY;
    if(progress)progress.style.width=Math.min(100,y/max*100)+'%';top?.classList.toggle('visible',y>800);pending=false;
  })};window.addEventListener('scroll',onScroll,{passive:true});onScroll();
  top?.addEventListener('click',()=>window.scrollTo({top:0,behavior:reduce()?'instant':'smooth'}));
  if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{
    if(!entry.isIntersecting)return;const active=nav.find(a=>a.hash==='#'+entry.target.id);
    if(active){nav.forEach(a=>a.removeAttribute('aria-current'));active.setAttribute('aria-current','location')}
  })},{rootMargin:'-70px 0px -65% 0px',threshold:0});nav.forEach(a=>{const target=document.querySelector(a.hash);if(target)observer.observe(target)})}
  const scene=$('#sceneText');if(scene&&'MutationObserver'in window){const animate=new MutationObserver(()=>{
    if(reduce())return;scene.classList.remove('scene-enter');void scene.offsetWidth;scene.classList.add('scene-enter');
  });animate.observe(scene,{childList:true,characterData:true,subtree:true})}
  $$('#destinationGrid [data-era],#quickPortals [data-era]').forEach(b=>b.addEventListener('click',()=>{const n=$('#a11yAnnouncements');if(n)n.textContent='Opening '+(b.closest('.destination-card')?.querySelector('h3')?.textContent||b.textContent.trim()||'selected portal')}));
  $('#destinationSearch')?.addEventListener('keydown',e=>{if(e.key==='Escape'){e.currentTarget.value='';renderSearch();e.currentTarget.blur()}});
});})();
