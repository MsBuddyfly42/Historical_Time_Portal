(()=>{'use strict';
const root=document.getElementById('timeWorld'); if(!root)return;
const stage=document.getElementById('gameStage'), traveler=document.getElementById('traveler'), objects=document.getElementById('worldObjects'), labels=document.getElementById('worldLabels'), collectibles=document.getElementById('collectibles');
const exploreBtn=document.getElementById('exploreBtn'), nearbyInfo=document.getElementById('nearbyInfo'), sceneName=document.getElementById('gameSceneName'), journeyTitle=document.getElementById('journeyTitle'), journeyText=document.getElementById('journeyText');
const discoveryCount=document.getElementById('gameDiscoveryCount'), keepsakeCount=document.getElementById('gameKeepsakeCount'), passportList=document.getElementById('passportList'), dialog=document.getElementById('worldDialog'), dialogContent=document.getElementById('worldDialogContent'), mapDialog=document.getElementById('timeMapDialog'), mapGrid=document.getElementById('timeMapGrid'), journalDialog=document.getElementById('gameJournalDialog'), journalEntries=document.getElementById('gameJournalEntries'), hint=document.getElementById('interactionHint'), toast=document.getElementById('sceneToast'), backdrop=document.getElementById('sceneBackdrop');
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)); const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const safeStore={get(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}};
const state=safeStore.get('htp-playable-v1',{scene:'hall',x:50,y:78,visited:['hall'],discoveries:[],keepsakes:[],journal:[]});
const scenes={
 hall:{name:'Time Hall',class:'hall',spawn:{x:50,y:78},title:'The Hall Between Centuries',text:'Walk toward a glowing portal. Get close and explore to step into another era.',objects:[
  {id:'titanicPortal',type:'portal',x:18,y:34,label:'1912 • Titanic',icon:'',action:'travel',to:'titanic',radius:12},
  {id:'westPortal',type:'portal',x:40,y:32,label:'1880s • Frontier West',action:'travel',to:'west',radius:12},
  {id:'egyptPortal',type:'portal',x:62,y:32,label:'Ancient Egypt',action:'travel',to:'egypt',radius:12},
  {id:'medievalPortal',type:'portal',x:84,y:34,label:'Medieval Europe',action:'travel',to:'medieval',radius:12},
  {id:'keeper',type:'npc',x:50,y:58,label:'Keeper of the Hall',icon:'🧙🏽‍♀️',action:'talk',title:'Keeper of the Hall',body:'Every doorway here leads to a different human story. Walk close to a portal and step through when you are ready.',radius:9}
 ],items:[{id:'hallKey',x:50,y:24,icon:'🗝️',name:'Chronicle Key'}]},
 titanic:{name:'RMS Titanic • 1912',class:'titanic',spawn:{x:50,y:82},title:'Aboard RMS Titanic',text:'Explore the decks before the voyage turns tragic. Meet people, notice details, and learn how the ship worked.',objects:[
  {id:'ship',type:'building',x:50,y:48,label:'RMS Titanic',icon:'🚢',action:'inspect',title:'RMS Titanic',body:'A vast ocean liner carrying passengers and crew across the North Atlantic in April 1912.',radius:15},
  {id:'steward',type:'npc',x:25,y:66,label:'Steward',icon:'🧑🏻‍✈️',action:'talk',title:'Ship Steward',body:'The steward points out the promenade, dining rooms, cabins, and the routines that kept a floating city running.',radius:8},
  {id:'wireless',type:'building',x:78,y:62,label:'Wireless Room',icon:'📡',action:'inspect',title:'Wireless Room',body:'Operators sent passengers’ messages and received navigational traffic through wireless telegraphy.',radius:10},
  {id:'return',type:'portal',x:91,y:84,label:'Return to Time Hall',action:'travel',to:'hall',radius:10}
 ],items:[{id:'ticket',x:17,y:41,icon:'🎟️',name:'Replica Passage Ticket'},{id:'postcard',x:71,y:31,icon:'💌',name:'Ship Postcard'}]},
 west:{name:'Frontier West • 1880s',class:'west',spawn:{x:50,y:84},title:'Dusty Trail Territory',text:'Walk Main Street, meet townspeople, and explore the everyday life of a fictional frontier settlement based on period patterns.',objects:[
  {id:'saloon',type:'building',x:20,y:53,label:'Golden Spur Saloon',icon:'🏚️',action:'inspect',title:'Golden Spur Saloon',body:'Music, meals, lodging arrangements, news, and arguments all meet under one roof.',radius:11},
  {id:'sheriff',type:'building',x:76,y:48,label:'Sheriff’s Office',icon:'⭐',action:'inspect',title:'Sheriff’s Office',body:'A small office where local disputes, warrants, reports, and town concerns are handled.',radius:11},
  {id:'reporter',type:'npc',x:46,y:59,label:'Town Reporter',icon:'🧑🏽‍📰',action:'talk',title:'Town Reporter',body:'The reporter is chasing three stories today: a missing payroll box, a delayed stagecoach, and a ranch dispute.',radius:8},
  {id:'return',type:'portal',x:91,y:84,label:'Return to Time Hall',action:'travel',to:'hall',radius:10}
 ],items:[{id:'badge',x:78,y:72,icon:'🌟',name:'Tin Deputy Badge'},{id:'gazette',x:32,y:32,icon:'📰',name:'Frontier Gazette'}]},
 egypt:{name:'Ancient Egypt',class:'egypt',spawn:{x:50,y:83},title:'Along the Nile',text:'Explore a riverside settlement of workshops, scribes, markets, temples, and household life.',objects:[
  {id:'pyramid',type:'building',x:23,y:43,label:'Monument District',icon:'🔺',action:'inspect',title:'Monument District',body:'Monumental architecture required planning, stone work, transport, skilled labor, food supply, and administration.',radius:12},
  {id:'market',type:'building',x:68,y:58,label:'Market',icon:'🧺',action:'inspect',title:'Riverside Market',body:'Grain, linen, pottery, produce, tools, and household goods move through a busy market.',radius:11},
  {id:'scribe',type:'npc',x:48,y:48,label:'Scribe',icon:'🧑🏾‍🏫',action:'talk',title:'A Working Scribe',body:'The scribe explains that writing supported taxation, trade, records, religious life, and administration.',radius:8},
  {id:'return',type:'portal',x:91,y:84,label:'Return to Time Hall',action:'travel',to:'hall',radius:10}
 ],items:[{id:'scarab',x:81,y:36,icon:'🪲',name:'Blue Scarab Keepsake'},{id:'papyrus',x:36,y:68,icon:'📜',name:'Papyrus Fragment'}]},
 medieval:{name:'Medieval Europe',class:'medieval',spawn:{x:50,y:83},title:'Castle & Village',text:'Walk between the castle gate, workshops, village homes, market stalls, and the people who keep the settlement running.',objects:[
  {id:'castle',type:'building',x:50,y:34,label:'Castle Gate',icon:'🏰',action:'inspect',title:'Castle Gate',body:'The castle is a fortified residence and administrative center, not simply a fairy-tale palace.',radius:14},
  {id:'smith',type:'building',x:23,y:62,label:'Smithy',icon:'⚒️',action:'inspect',title:'Village Smithy',body:'Metalworkers repair tools, fittings, household objects, tack, and equipment used throughout the settlement.',radius:10},
  {id:'herbalist',type:'npc',x:72,y:60,label:'Herbalist',icon:'🧑🏻‍🌾',action:'talk',title:'Village Herbalist',body:'The herbalist keeps a practical garden and shares local knowledge about food, remedies, and seasonal work.',radius:8},
  {id:'return',type:'portal',x:91,y:84,label:'Return to Time Hall',action:'travel',to:'hall',radius:10}
 ],items:[{id:'coin',x:18,y:37,icon:'🪙',name:'Market Coin'},{id:'ribbon',x:76,y:35,icon:'🎗️',name:'Festival Ribbon'}]}
};
function save(){safeStore.set('htp-playable-v1',state)}
function showToast(msg){toast.textContent=msg;toast.classList.add('show');clearTimeout(showToast.t);showToast.t=setTimeout(()=>toast.classList.remove('show'),1600)}
function addJournal(title,text){if(!state.journal.some(e=>e.title===title)){state.journal.unshift({title,text,date:new Date().toLocaleDateString()});state.journal=state.journal.slice(0,40);save()}}
function renderScene(){
 const s=scenes[state.scene]||scenes.hall; sceneName.textContent=s.name; backdrop.className='scene-backdrop '+s.class; journeyTitle.textContent=s.title;journeyText.textContent=s.text;
 objects.innerHTML='';labels.innerHTML='';collectibles.innerHTML='';
 s.objects.forEach(o=>{const el=document.createElement('div');el.className='world-object '+o.type;el.style.left=o.x+'%';el.style.top=o.y+'%';if(o.icon)el.textContent=o.icon;objects.appendChild(el);const lab=document.createElement('div');lab.className='world-label';lab.style.left=o.x+'%';lab.style.top=(o.y-(o.type==='portal'?15:10))+'%';lab.textContent=o.label;labels.appendChild(lab)});
 s.items.forEach(i=>{if(state.keepsakes.includes(i.id))return;const el=document.createElement('div');el.className='collectible';el.style.left=i.x+'%';el.style.top=i.y+'%';el.textContent=i.icon;el.setAttribute('aria-label',i.name);collectibles.appendChild(el)});
 if(!state.visited.includes(state.scene)){state.visited.push(state.scene);addJournal('Arrived: '+s.name,'You entered '+s.name+'.');save()}
 renderStatus();moveTo(state.x??s.spawn.x,state.y??s.spawn.y,false);showToast('Entered '+s.name);
}
function renderStatus(){discoveryCount.textContent=state.discoveries.length;keepsakeCount.textContent=state.keepsakes.length;passportList.innerHTML=Object.entries(scenes).map(([k,s])=>'<span class="passport-stamp '+(state.visited.includes(k)?'visited':'')+'">'+(state.visited.includes(k)?'✓ ':'')+s.name.split('•')[0].trim()+'</span>').join('');renderMap()}
function nearest(){const s=scenes[state.scene];let best=null,bestD=999;for(const o of s.objects){const d=dist({x:state.x,y:state.y},o);if(d<bestD){best=o;bestD=d}}return best&&bestD<=(best.radius||9)?best:null}
function collectNearby(){const s=scenes[state.scene];for(const i of s.items){if(state.keepsakes.includes(i.id))continue;if(dist({x:state.x,y:state.y},i)<6){state.keepsakes.push(i.id);addJournal('Keepsake: '+i.name,'Found while exploring '+s.name+'.');save();showToast('Collected '+i.name+' ✨');renderScene();return}}}
function updateNearby(){const n=nearest();if(n){nearbyInfo.innerHTML='<b>'+n.label+'</b><br>Walk a little closer and explore.';exploreBtn.disabled=false;hint.classList.remove('hidden');hint.textContent=n.action==='travel'?'Step through portal':'Press E or tap Explore'}else{nearbyInfo.textContent='Keep walking. Look for people, buildings, glowing portals, and keepsakes.';exploreBtn.disabled=true;hint.classList.add('hidden')}}
function moveTo(x,y,check=true){state.x=clamp(x,5,95);state.y=clamp(y,15,92);traveler.style.left=state.x+'%';traveler.style.top=state.y+'%';if(check){collectNearby();updateNearby();save()}}
function move(dx,dy){moveTo(state.x+dx,state.y+dy)}
function interact(){const o=nearest();if(!o)return;if(o.action==='travel'){const target=scenes[o.to];state.scene=o.to;state.x=target.spawn.x;state.y=target.spawn.y;save();renderScene();return}
 if(!state.discoveries.includes(o.id)){state.discoveries.push(o.id);addJournal(o.title||o.label,o.body||'Discovered while exploring.');save()}
 dialogContent.innerHTML='<p class="mini-kicker">'+scenes[state.scene].name+'</p><h2>'+o.title+'</h2><p>'+o.body+'</p><div class="dialog-actions"><button type="button" id="rememberBtn">Add to Journal ✓</button></div>';dialog.showModal();dialogContent.querySelector('#rememberBtn').addEventListener('click',()=>{addJournal(o.title,o.body);showToast('Added to journal')});renderStatus()}
function renderMap(){mapGrid.innerHTML=Object.entries(scenes).map(([k,s])=>'<button type="button" data-scene="'+k+'" '+(!state.visited.includes(k)?'disabled':'')+'>'+(state.visited.includes(k)?'✓ ':'🔒 ')+s.name+'</button>').join('');mapGrid.querySelectorAll('button:not(:disabled)').forEach(b=>b.addEventListener('click',()=>{const k=b.dataset.scene;state.scene=k;state.x=scenes[k].spawn.x;state.y=scenes[k].spawn.y;save();mapDialog.close();renderScene()}))}
function openJournal(){journalEntries.innerHTML=state.journal.length?state.journal.map(e=>'<div class="journal-entry"><b>'+e.title+'</b><div>'+e.text+'</div><small>'+e.date+'</small></div>').join(''):'<p>Your journal is empty. Walk around and discover something.</p>';journalDialog.showModal()}
const keys=new Set();let raf=0,last=0;function tick(t){if(!keys.size){raf=0;return}if(t-last>45){let dx=0,dy=0;if(keys.has('arrowleft')||keys.has('a'))dx-=1.8;if(keys.has('arrowright')||keys.has('d'))dx+=1.8;if(keys.has('arrowup')||keys.has('w'))dy-=1.8;if(keys.has('arrowdown')||keys.has('s'))dy+=1.8;if(dx||dy)move(dx,dy);last=t}raf=requestAnimationFrame(tick)}
root.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(['arrowleft','arrowright','arrowup','arrowdown','w','a','s','d'].includes(k)){e.preventDefault();keys.add(k);if(!raf)raf=requestAnimationFrame(tick)}else if(k==='e'){e.preventDefault();interact()}else if(k==='m'){e.preventDefault();mapDialog.showModal()}});
root.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
root.querySelectorAll('[data-move]').forEach(btn=>{let timer;const run=()=>{const d=btn.dataset.move;move(d==='left'?-2:d==='right'?2:0,d==='up'?-2:d==='down'?2:0)};btn.addEventListener('pointerdown',e=>{e.preventDefault();run();timer=setInterval(run,85)});['pointerup','pointercancel','pointerleave'].forEach(ev=>btn.addEventListener(ev,()=>clearInterval(timer)))});
exploreBtn.addEventListener('click',interact);document.getElementById('mapBtn').addEventListener('click',()=>mapDialog.showModal());document.getElementById('journalGameBtn').addEventListener('click',openJournal);
stage.addEventListener('pointerdown',()=>stage.focus());
renderScene();stage.focus({preventScroll:true});
})();