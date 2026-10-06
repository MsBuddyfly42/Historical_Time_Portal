/* New proximity-based adventures in the existing playable scenes. */
(() => {
 'use strict';
 const cfg = {"title": "The Tomorrow That Went Missing", "intro": "A clock in the Time Hall has stopped. Three objects have slipped into the wrong century. Track them down before the loop closes.", "reward": "Timeline Mender", "host": "#gameStage", "player": "#traveler", "place": "#gameSceneName", "start": "Time Hall", "key": "htp-timeline-adventure-v1", "steps": [{"place": "Time Hall", "x": 50, "y": 90, "label": "Stopped chronometer", "icon": "◷", "text": "The chronometer shows a steamship, a pyramid, and a sun. A brass tag reads: “The oldest place holds the newest clue.”", "choices": ["Follow the clue to Ancient Egypt"], "correct": 0, "success": "A metal ticket is flickering among the Egyptian artifacts. Visit Ancient Egypt through its portal."}, {"place": "Egypt", "x": 50, "y": 88, "label": "Impossible ticket", "icon": "▱", "text": "A steamship ticket has appeared beside an ancient inscription. Which detail proves it belongs to another era?", "choices": ["Its passenger name", "Its 1912 sailing date", "Its faded ink"], "correct": 1, "hint": "The year is thousands of years later than ancient Egypt.", "success": "The ticket anchors a memory of the Titanic. Take the next clue to the 1912 destination."}, {"place": "Titanic", "x": 50, "y": 88, "label": "Displaced sun seal", "icon": "☀", "text": "An ancient sun seal rests beside a ship’s clock. Its inscription reads: “When night ends, restore what was borrowed.” Which hour should the Time Hall’s clock point toward?", "choices": ["Dawn", "Midnight", "Sunset"], "correct": 0, "hint": "When does night give way to day?", "success": "The sun seal belongs to Egypt. You now know how to repair the loop. Return to the Time Hall."}, {"place": "Time Hall", "x": 50, "y": 90, "label": "Timeline console", "icon": "⌘", "text": "Restore the timeline by returning the clues in order: ancient sun seal, steamship ticket, then the hour that ends the night.", "sequence": ["Sun seal", "Ship ticket", "Dawn"], "options": ["Dawn", "Ship ticket", "Sun seal"], "success": "The clock ticks. The displaced objects return to their eras, and tomorrow reappears in the hall’s windows."}]};
 const q=s=>document.querySelector(s);
 let state={step:0,finished:false,ending:''};
 try { const saved=JSON.parse(localStorage.getItem(cfg.key)); if(saved&&Number.isInteger(saved.step)&&saved.step>=0&&saved.step<=cfg.steps.length)state={...state,...saved}; } catch {}
 const save=()=>{try{localStorage.setItem(cfg.key,JSON.stringify(state));}catch{}};
 function init(){
  const host=q(cfg.host),player=q(cfg.player);if(!host||!player)return;
  const shell=cfg.pixels?q('.ww-viewport'):host.parentElement;
  const bar=document.createElement('div');bar.className='adventure-track';bar.setAttribute('aria-label','New adventure');
  const status=document.createElement('span');const details=document.createElement('button');details.type='button';details.textContent='Adventure';bar.append(status,details);
  if(cfg.pixels){const top=q('.ww-top');top.insertAdjacentElement('afterend',bar);}else host.insertAdjacentElement('afterend',bar);
  const node=document.createElement('button');node.type='button';node.className='adventure-marker';host.append(node);
  const modal=document.createElement('dialog');modal.className='adventure-dialog';modal.setAttribute('aria-label',cfg.title);
  modal.innerHTML='<div class="adventure-dialog-head"><span>NEW ADVENTURE</span><button type="button" aria-label="Close adventure">×</button></div><h2></h2><p class="adventure-story"></p><div class="adventure-choices"></div><p class="adventure-feedback" role="status" aria-live="polite"></p>';
  (cfg.pixels?q('.ww-game'):document.body).append(modal);
  const choices=modal.querySelector('.adventure-choices'),story=modal.querySelector('.adventure-story'),feedback=modal.querySelector('.adventure-feedback');
  modal.querySelector('h2').textContent=cfg.title;modal.querySelector('.adventure-dialog-head button').onclick=()=>modal.close();
  modal.addEventListener('keydown',e=>e.stopPropagation());modal.addEventListener('keyup',e=>e.stopPropagation());
  function button(label,fn){const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=fn;choices.append(b);return b;}
  function open(text){story.textContent=text;choices.replaceChildren();feedback.textContent='';if(!modal.open)modal.showModal();}
  function summary(){
   const s=cfg.steps[state.step];open(state.finished?state.ending+' You earned the title “'+cfg.reward+'”.':cfg.intro+'\n\nNext: '+s.label+(s.place?' in '+s.place:'')+'. Walk toward the glowing marker and select it when you are close.');
   button('Back to the world',()=>modal.close());
   if(state.finished)button('Play this adventure again',()=>{state={step:0,finished:false,ending:''};save();modal.close();render();});
  }
  details.onclick=summary;
  function advance(message){
   state.step++;state.finished=state.step>=cfg.steps.length;state.ending=state.finished?message:'';save();
   open(message+(state.finished?'\n\nAdventure complete. Title earned: '+cfg.reward: ''));
   button(state.finished?'Return to the world':'Follow the next clue',()=>modal.close());render();
  }
  function near(){const a=player.getBoundingClientRect(),b=node.getBoundingClientRect();return Math.hypot(a.x+a.width/2-b.x-b.width/2,a.y+a.height*.75-b.y-b.height/2)<Math.max(65,host.getBoundingClientRect().width*(cfg.pixels?.075:.14));}
  function inPlace(s){return !cfg.place||new RegExp(s.place,'i').test(q(cfg.place)?.textContent||'');}
  function render(){
   const s=cfg.steps[state.step];const statusText=state.finished?'✓ '+cfg.title+' — Complete':cfg.title+' · '+(state.step+1)+'/'+cfg.steps.length;
   if(status.textContent!==statusText)status.textContent=statusText;
   node.hidden=state.finished||!inPlace(s);if(node.hidden)return;
   node.style.left=s.x+(cfg.pixels?'px':'%');node.style.top=s.y+(cfg.pixels?'px':'%');if(node.textContent!==s.icon)node.textContent=s.icon;node.title=s.label;node.setAttribute('aria-label',s.label);
   const close=String(near());if(node.dataset.near!==close)node.dataset.near=close;
  }
  node.addEventListener('pointerdown',e=>{e.stopPropagation();});
  document.addEventListener('keydown',e=>{if((e.key.toLowerCase()==='e'||e.key===' ')&&!node.hidden&&!modal.open&&node.getClientRects().length&&near()&&!document.querySelector('dialog[open]:not(.ww-game)')&&!/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)){e.preventDefault();e.stopImmediatePropagation();node.click();}},true);
  node.onclick=e=>{
   e.stopPropagation();const s=cfg.steps[state.step];if(!s||!inPlace(s))return;
   if(!near()){open('Walk closer to '+s.label+' to examine it. Use the movement controls or arrow keys.');button('Keep walking',()=>modal.close());return;}
   open(s.text);
   if(s.sequence){let entered=[];s.options.forEach(option=>button(option,()=>{
    if(option!==s.sequence[entered.length]){entered=[];feedback.textContent='That order would not work. Start again: '+s.text;return;}
    entered.push(option);feedback.textContent=entered.join(' · ');if(entered.length===s.sequence.length)advance(s.success);
   }));}
   else s.choices.forEach((label,i)=>button(label,()=>{if(s.correct!==null&&i!==s.correct){feedback.textContent=s.hint||'Look at the clue again.';return;}advance(i===1&&s.alternate?s.alternate:s.success);}));
  };
  document.addEventListener('storybook:location',render);
  const timer=setInterval(()=>{if(!node.isConnected){clearInterval(timer);return;}render();},200);
  render();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
