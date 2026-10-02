(()=>{'use strict';
const root=document.getElementById('timeWorld'); if(!root)return;
const $=s=>root.querySelector(s);
const stage=$('#gameStage'), traveler=$('#traveler'), objects=$('#worldObjects'), labels=$('#worldLabels'), collectibles=$('#collectibles');
const exploreBtn=$('#exploreBtn'), nearbyInfo=$('#nearbyInfo'), sceneName=$('#gameSceneName'), journeyTitle=$('#journeyTitle'), journeyText=$('#journeyText');
const discoveryCount=$('#gameDiscoveryCount'), keepsakeCount=$('#gameKeepsakeCount'), passportList=$('#passportList');
const dialog=$('#worldDialog'), dialogContent=$('#worldDialogContent'), mapDialog=$('#timeMapDialog'), mapGrid=$('#timeMapGrid'), journalDialog=$('#gameJournalDialog'), journalEntries=$('#gameJournalEntries');
const hint=$('#interactionHint'), toast=$('#sceneToast'), backdrop=$('#sceneBackdrop'), side=$('.game-side');
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)), distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const store={get(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}};
const hardScenes={};
const o=(id,type,x,y,label,icon,action,title,body,extra={})=>({id,type,x,y,label,icon,action,title,body,...extra});
const item=(id,x,y,icon,name)=>({id,x,y,icon,name});
const S=(name,cls,spawn,title,text,objects,items=[],meta={})=>({name,class:cls,spawn,title,text,objects,items,passport:meta.passport!==false,quest:meta.quest||null});
const returnPortal=(x=91,y=86)=>o('return','portal',x,y,'Return to Time Hall','', 'travel','Return to Time Hall','',{to:'hall',radius:10});

hardScenes.hall=S('Time Hall','hall',{x:50,y:90},'The Hall Between Centuries','Walk to any glowing doorway. Every portal leads to a place where you can move, meet people, enter locations, and collect discoveries.',[
 o('pTitanic','portal',12,26,'1912 • Titanic','', 'travel','','',{to:'titanic',radius:10}),
 o('pWest','portal',31,26,'1880s • West','', 'travel','','',{to:'west',radius:10}),
 o('pEgypt','portal',50,26,'Ancient Egypt','', 'travel','','',{to:'egypt',radius:10}),
 o('pMedieval','portal',69,26,'Medieval Europe','', 'travel','','',{to:'medieval',radius:10}),
 o('pVictorian','portal',88,26,'1890s • Victorian','', 'travel','','',{to:'victorian',radius:10}),
 o('pFifties','portal',18,56,'1950s • Main Street','', 'travel','','',{to:'fifties',radius:10}),
 o('pRoaring','portal',38,56,'1920s • Jazz Age','', 'travel','','',{to:'roaring',radius:10}),
 o('pApollo','portal',59,56,'1969 • Apollo','', 'travel','','',{to:'apollo',radius:10}),
 o('pRome','portal',79,56,'Ancient Rome','', 'travel','','',{to:'rome',radius:10}),
 o('pRenaissance','portal',25,79,'1500s • Renaissance','', 'travel','','',{to:'renaissance',radius:10}),
 o('pRevolution','portal',50,79,'1776 • Revolution','', 'travel','','',{to:'revolution',radius:10}),
 o('keeper','npc',77,79,'Keeper of the Hall','🧙🏽‍♀️','talk','Keeper of the Hall','Every era has ordinary people as well as famous events. Walk slowly, talk to people, enter buildings, and notice the details.',{radius:8})
],[item('chronicleKey',63,88,'🗝️','Chronicle Key')],{passport:false});

hardScenes.titanic=S('RMS Titanic • 1912','titanic',{x:50,y:84},'Aboard RMS Titanic','Explore the exterior decks, speak with crew, then enter the ship to continue your journey.',[
 o('ship','building',50,45,'RMS Titanic','🚢','inspect','RMS Titanic','A vast ocean liner carrying passengers and crew across the North Atlantic in April 1912.',{radius:14}),
 o('steward','npc',24,66,'Deck Steward','🧑🏻‍✈️','talk','Deck Steward','The steward points toward passenger spaces, lifeboats, promenades, and the routines that kept the ship operating.',{radius:8}),
 o('wireless','building',77,60,'Wireless Room','📡','inspect','Wireless Telegraphy','Wireless operators handled passenger messages and navigational traffic, sometimes for very long hours.',{radius:10}),
 o('inside','door',54,61,'Enter the Ship','🚪','travel','Enter Titanic','',{to:'titanicInterior',radius:9}),
 returnPortal()
],[item('ticket',15,39,'🎟️','Replica Passage Ticket'),item('postcard',72,31,'💌','Ship Postcard')],{quest:{title:'Life Aboard',targets:['steward','wireless','ticket'],reward:'Passenger Journal Stamp'}});

hardScenes.titanicInterior=S('Titanic • Interior','titanicInterior',{x:50,y:84},'Inside the Ship','Walk through an interpretation of passenger spaces. This is a respectful educational setting, not a disaster game.',[
 o('stairs','building',50,35,'Grand Staircase','🪜','inspect','Grand Staircase','The famous first-class staircase was one of several vertical circulation spaces aboard the ship.',{radius:13}),
 o('library','building',22,58,'Second-Class Library','📚','inspect','Second-Class Library','A quieter passenger room for reading, writing, and conversation.',{radius:10}),
 o('musician','npc',75,57,'Ship Musician','🎻','talk','Ship Musician','Music was part of passenger life aboard ocean liners, including ensembles that played in public rooms.',{radius:8}),
 o('backDeck','door',90,84,'Return to Deck','🚪','travel','Back to Deck','',{to:'titanic',radius:9})
],[item('menu',36,70,'📜','Dining Menu Keepsake')],{passport:false,quest:{title:'Inside the Ship',targets:['stairs','library','musician'],reward:'Interior Explorer Stamp'}});

hardScenes.west=S('Frontier West • 1880s','west',{x:50,y:84},'Dusty Trail Territory','Walk Main Street, enter the saloon, meet townspeople, and explore a fictional frontier settlement based on period patterns.',[
 o('saloon','building',20,49,'Golden Spur Saloon','🏚️','travel','Enter the Saloon','',{to:'westSaloon',radius:11}),
 o('sheriff','building',76,47,'Sheriff’s Office','⭐','inspect','Sheriff’s Office','A small office where reports, warrants, disputes, and town concerns are handled.',{radius:11}),
 o('reporter','npc',46,62,'Town Reporter','🧑🏽‍📰','talk','Town Reporter','The reporter is chasing three stories today: a delayed stagecoach, a missing payroll box, and a ranch dispute.',{radius:8}),
 returnPortal()
],[item('badge',79,71,'🌟','Tin Deputy Badge'),item('gazette',31,34,'📰','Frontier Gazette')],{quest:{title:'Front Page Story',targets:['reporter','sheriff','gazette'],reward:'Reporter Stamp'}});

hardScenes.westSaloon=S('Golden Spur Saloon','westInterior',{x:50,y:84},'Inside the Golden Spur','Talk to the pianist and barkeep, then look around the room for clues about local life.',[
 o('piano','building',24,42,'Upright Piano','🎹','inspect','Saloon Piano','Music, dancing, meals, lodging, and social gatherings could all be part of saloon life, depending on the place.',{radius:10}),
 o('barkeep','npc',70,43,'Barkeep','🧔🏽','talk','Barkeep','Travelers bring news from distant towns. The barkeep knows which stagecoaches arrived and which ones did not.',{radius:8}),
 o('board','building',48,64,'Notice Board','📌','inspect','Town Notice Board','Job notices, lost-property messages, public announcements, and advertisements share wall space.',{radius:9}),
 o('backStreet','door',91,84,'Back to Main Street','🚪','travel','','',{to:'west',radius:9})
],[item('pokerChip',37,70,'🔴','Wooden Gaming Token')],{passport:false,quest:{title:'Saloon Stories',targets:['piano','barkeep','board'],reward:'Golden Spur Stamp'}});

hardScenes.egypt=S('Ancient Egypt','egypt',{x:50,y:83},'Along the Nile','Explore a riverside settlement of workshops, scribes, markets, temples, and household life.',[
 o('monuments','building',22,42,'Monument District','🔺','inspect','Monument District','Monumental building required planning, skilled labor, food supply, tools, transport, and administration.',{radius:12}),
 o('market','building',70,58,'Riverside Market','🧺','inspect','Riverside Market','Grain, linen, pottery, produce, tools, and household goods move through a busy market.',{radius:11}),
 o('scribe','npc',47,48,'Working Scribe','🧑🏾‍🏫','talk','A Working Scribe','Writing supported taxation, trade, legal records, religion, administration, and private communication.',{radius:8}),
 returnPortal()
],[item('scarab',81,35,'🪲','Blue Scarab Keepsake'),item('papyrus',34,69,'📜','Papyrus Fragment')],{quest:{title:'River Settlement',targets:['market','scribe','papyrus'],reward:'Nile Visitor Stamp'}});

hardScenes.medieval=S('Medieval Europe','medieval',{x:50,y:83},'Castle & Village','Walk between workshops, village homes, the castle gate, and people who keep the settlement running.',[
 o('castle','building',50,34,'Castle Gate','🏰','travel','Enter the Castle','',{to:'medievalCastle',radius:13}),
 o('smith','building',22,61,'Smithy','⚒️','inspect','Village Smithy','Metalworkers repair tools, fittings, household objects, tack, and equipment used throughout the settlement.',{radius:10}),
 o('herbalist','npc',72,60,'Herbalist','🧑🏻‍🌾','talk','Village Herbalist','The herbalist keeps a practical garden and shares local knowledge about food, remedies, and seasonal work.',{radius:8}),
 returnPortal()
],[item('coin',17,37,'🪙','Market Coin'),item('ribbon',77,36,'🎗️','Festival Ribbon')],{quest:{title:'Village Day',targets:['smith','herbalist','coin'],reward:'Village Life Stamp'}});

hardScenes.medievalCastle=S('Medieval Castle','castleInterior',{x:50,y:84},'Inside the Castle','Explore working castle spaces rather than only royal rooms.',[
 o('greatHall','building',50,34,'Great Hall','🕯️','inspect','Great Hall','A large multipurpose room for dining, administration, hospitality, ceremonies, and household activity.',{radius:12}),
 o('kitchen','building',22,59,'Castle Kitchen','🍲','inspect','Castle Kitchen','Large households required cooks, fuel, storage, water, food preparation, and careful coordination.',{radius:10}),
 o('steward','npc',74,58,'Household Steward','🧑🏼‍💼','talk','Household Steward','The steward tracks supplies, workers, visitors, expenses, and the many practical needs of the household.',{radius:8}),
 o('backVillage','door',91,84,'Back to Village','🚪','travel','','',{to:'medieval',radius:9})
],[item('seal',37,70,'🕯️','Wax Seal')],{passport:false,quest:{title:'Castle Household',targets:['greatHall','kitchen','steward'],reward:'Castle Household Stamp'}});

hardScenes.victorian=S('Victorian City • 1890s','victorian',{x:50,y:84},'Gaslight & Newspapers','Walk a busy late-19th-century city street of shops, newspapers, transit, parlors, and public life.',[
 o('newspaper','building',19,47,'Newspaper Office','📰','travel','Enter Newspaper Office','Editors, typesetters, reporters, printers, delivery workers, and advertisers keep a city paper moving.',{radius:11}),
 o('theatre','building',73,43,'Theatre','🎭','inspect','City Theatre','Theatres offered drama, music, comedy, variety performances, and public spectacle.',{radius:11}),
 o('newsboy','npc',47,61,'News Seller','🧑🏻','talk','News Seller','Headlines travel quickly through the street as sellers call out the latest edition.',{radius:8}),
 returnPortal()
],[item('penny',80,68,'🪙','Victorian Penny'),item('playbill',30,34,'📃','Theatre Playbill')],{quest:{title:'City Edition',targets:['newspaper','theatre','newsboy'],reward:'Gaslight City Stamp'}});

hardScenes.fifties=S('1950s Main Street','fifties',{x:50,y:84},'Mid-Century Main Street','Explore a stylized American Main Street with a diner, record shop, cinema, and neighborhood life.',[
 o('diner','building',21,48,'Corner Diner','🍔','travel','Enter Corner Diner','Diners and lunch counters could be social gathering places, though access and treatment varied greatly by location and segregation laws.',{radius:11}),
 o('records','building',73,46,'Record Shop','🎵','inspect','Record Shop','Popular music formats, radio, jukeboxes, and record stores helped shape youth culture and entertainment.',{radius:11}),
 o('student','npc',46,62,'High-School Student','🧑🏽‍🎓','talk','A Local Student','The student is saving for a new record and talking about the Saturday movie matinee.',{radius:8}),
 returnPortal()
],[item('nickel',78,70,'🪙','Jukebox Nickel'),item('ticket50',30,34,'🎫','Movie Ticket Stub')],{quest:{title:'Saturday on Main Street',targets:['diner','records','ticket50'],reward:'Main Street Stamp'}});

hardScenes.roaring=S('Roaring Twenties','roaring',{x:50,y:84},'Jazz-Age City','Explore newspapers, radio, nightlife, fashion, and rapid technological and cultural change.',[
 o('jazz','building',20,47,'Jazz Club','🎷','travel','Enter Jazz Club','Jazz flourished through Black musical innovation and spread through clubs, recordings, radio, touring musicians, and dance culture.',{radius:11}),
 o('radio','building',72,44,'Radio Studio','📻','inspect','Radio Studio','Commercial radio expanded quickly in the 1920s, changing entertainment, advertising, politics, and shared public culture.',{radius:11}),
 o('photographer','npc',48,61,'Street Photographer','📷','talk','Street Photographer','The photographer watches changing clothes, cars, advertisements, and crowds rush through the city.',{radius:8}),
 returnPortal()
],[item('record',78,69,'💿','Shellac Record'),item('pressCard',31,34,'🪪','Press Card')],{quest:{title:'City in Motion',targets:['jazz','radio','photographer'],reward:'Jazz Age Stamp'}});

hardScenes.apollo=S('Apollo Era • 1969','apollo',{x:50,y:84},'Moonshot Summer','Explore mission-control culture, engineering work, television, and the public excitement surrounding Apollo 11.',[
 o('control','building',22,44,'Mission Control','🖥️','travel','Enter Mission Control','Teams of flight controllers monitored systems, trajectories, communications, procedures, and rapidly changing conditions.',{radius:12}),
 o('tv','building',73,48,'Watch Party','📺','inspect','Television Watch Party','Millions followed the mission through television and radio, experiencing the moon landing as a shared public event.',{radius:10}),
 o('engineer','npc',47,62,'Engineer','🧑🏾‍🔧','talk','Systems Engineer','Spaceflight depended on large teams across engineering, manufacturing, mathematics, computing, logistics, training, and operations.',{radius:8}),
 returnPortal()
],[item('missionPatch',80,69,'🚀','Mission Patch'),item('slideRule',30,35,'📏','Slide Rule')],{quest:{title:'Mission Ready',targets:['control','engineer','missionPatch'],reward:'Apollo Visitor Stamp'}});

hardScenes.rome=S('Ancient Rome','rome',{x:50,y:84},'Roman City','Explore a forum, food stall, bath complex, apartments, and the movement of people through a dense ancient city.',[
 o('forum','building',22,43,'Forum','🏛️','travel','Enter Forum','Public squares could host commerce, administration, law, religious activity, monuments, and political communication.',{radius:12}),
 o('thermae','building',73,46,'Public Baths','♨️','inspect','Public Baths','Bath complexes could include bathing rooms, exercise spaces, social activity, services, and elaborate water systems.',{radius:11}),
 o('vendor','npc',47,62,'Food Vendor','🧑🏽‍🍳','talk','Street Food Vendor','Not every urban resident cooked every meal at home; food shops and prepared foods were part of city life.',{radius:8}),
 returnPortal()
],[item('romanCoin',80,69,'🪙','Roman Coin Keepsake'),item('oilLamp',31,34,'🪔','Small Oil Lamp')],{quest:{title:'A Day in the City',targets:['forum','thermae','vendor'],reward:'Roman City Stamp'}});

hardScenes.renaissance=S('Renaissance City • 1500s','renaissance',{x:50,y:84},'Workshop & Piazza','Explore printing, art workshops, markets, music, craft, and urban life in a Renaissance-inspired city.',[
 o('printer','building',21,45,'Print Shop','🖨️','travel','Enter Print Shop','Movable-type printing transformed the production and circulation of books, pamphlets, images, arguments, and news.',{radius:11}),
 o('atelier','building',73,44,'Artist Workshop','🎨','inspect','Artist Workshop','Workshops trained apprentices and produced paintings, sculpture, decorative work, designs, and commissions.',{radius:11}),
 o('merchant','npc',47,62,'Cloth Merchant','🧑🏻‍💼','talk','Cloth Merchant','Trade networks connect local markets with textiles, dyes, luxury goods, raw materials, and distant ports.',{radius:8}),
 returnPortal()
],[item('print',80,70,'📜','Printed Broadside'),item('brush',31,34,'🖌️','Workshop Brush')],{quest:{title:'Ideas in the Piazza',targets:['printer','atelier','merchant'],reward:'Renaissance Stamp'}});

hardScenes.revolution=S('Revolution-Era City • 1776','revolution',{x:50,y:84},'Print Shops & Public Debate','Explore a city shaped by war, political argument, trade disruption, newspapers, taverns, households, and messengers.',[
 o('printshop','building',20,44,'Print Shop','📰','travel','Enter Print Shop','Printers produced newspapers, pamphlets, notices, political arguments, advertisements, and official information.',{radius:11}),
 o('tavern','building',73,47,'Tavern','🍺','inspect','Tavern','Taverns could function as places for meals, lodging, business, mail, meetings, political discussion, and news.',{radius:11}),
 o('messenger','npc',47,61,'Messenger','🏇','talk','City Messenger','News travels by horse, post, print, rumor, and personal networks. Wartime information can be late, incomplete, or contradictory.',{radius:8}),
 returnPortal()
],[item('broadside',79,70,'📜','Printed Broadside'),item('quill',30,34,'🪶','Writing Quill')],{quest:{title:'News of 1776',targets:['printshop','messenger','broadside'],reward:'Revolution-Era Stamp'}});


/* --- Connected sub-areas: expansion pass 3 --- */
hardScenes.victorianNews=S('Victorian Newspaper Office','victorianInterior',{x:50,y:84},'Inside the Newspaper Office','Move among desks, type cases, proofs, and a busy press room.',[
 o('editorDesk','building',25,45,'Editor’s Desk','✒️','inspect','Editor’s Desk','Editors assign stories, review copy, choose headlines, and coordinate the daily edition.',{radius:10}),
 o('press','building',70,43,'Printing Press','⚙️','inspect','Printing Press','Typesetting, inking, paper handling, and press work turn written copy into thousands of printed sheets.',{radius:11}),
 o('reporterDesk','npc',47,62,'City Reporter','🧑🏽‍💼','talk','City Reporter','The reporter is deciding whether to follow a court story, a theater opening, or trouble at the railway station.',{radius:8,choices:[
   {label:'Ask about the railway story',flag:'victorianRail',reply:'The reporter lowers their voice: a delayed train has brought a crowd of anxious relatives to the station.'},
   {label:'Ask about the theater',flag:'victorianTheatre',reply:'Tonight’s premiere has drawn actors, critics, stagehands, and curious crowds from across the city.'}
 ]}),
 o('backCity','door',91,84,'Back to City Street','🚪','travel','','',{to:'victorian',radius:9})
],[item('proofSheet',36,69,'📄','Printer’s Proof Sheet')],{passport:false,quest:{title:'Make the Edition',targets:['editorDesk','press','reporterDesk'],reward:'Pressroom Stamp'}});

hardScenes.victorianTheatre=S('Victorian Theatre','theatreInterior',{x:50,y:84},'Behind the Curtain','Explore the stage, dressing area, and the people preparing for an evening performance.',[
 o('stage','building',50,35,'Main Stage','🎭','inspect','Main Stage','Scenery, lighting, props, music, and carefully rehearsed movement create the illusion seen by the audience.',{radius:12}),
 o('dressing','building',23,61,'Dressing Room','🪞','inspect','Dressing Room','Costumes, makeup, hair, quick changes, and personal preparation happen away from the audience.',{radius:10}),
 o('stagehand','npc',73,59,'Stagehand','🧑🏻‍🔧','talk','Stagehand','The stagehand checks ropes, scenery, props, entrances, and dozens of practical details before the curtain rises.',{radius:8}),
 o('backCity2','door',91,84,'Back to City Street','🚪','travel','','',{to:'victorian',radius:9})
],[item('theatreRibbon',37,70,'🎟️','Theatre Admission Ribbon')],{passport:false,quest:{title:'Before Curtain',targets:['stage','dressing','stagehand'],reward:'Backstage Stamp'}});

hardScenes.fiftiesDiner=S('Corner Diner','dinerInterior',{x:50,y:84},'Inside the Diner','Walk between the counter, jukebox, kitchen pass, and neighborhood regulars.',[
 o('counter','building',28,42,'Lunch Counter','🥤','inspect','Lunch Counter','Counters served quick meals and became important social spaces; in many U.S. places, segregation also made them sites of exclusion and later civil-rights protest.',{radius:11}),
 o('jukebox','building',72,43,'Jukebox','🎶','inspect','Jukebox','Coin-operated jukeboxes made popular records part of everyday social life in diners, bars, and youth hangouts.',{radius:10}),
 o('server','npc',50,62,'Diner Server','🧑🏾‍🍳','talk','Diner Server','The server remembers everyone’s usual order and knows which customers are headed to the Saturday matinee.',{radius:8}),
 o('backMain','door',91,84,'Back to Main Street','🚪','travel','','',{to:'fifties',radius:9})
],[item('dinerMenu',37,70,'📋','Diner Menu')],{passport:false,quest:{title:'Lunch Rush',targets:['counter','jukebox','server'],reward:'Diner Stamp'}});

hardScenes.fiftiesRecords=S('Record Shop','recordInterior',{x:50,y:84},'Inside the Record Shop','Browse listening booths, new releases, and the local music scene.',[
 o('bins','building',25,45,'Record Bins','💿','inspect','Record Bins','Singles and albums are sorted by artist, label, style, and popularity for customers to browse.',{radius:10}),
 o('booth','building',70,43,'Listening Booth','🎧','inspect','Listening Booth','Customers can sample records before buying, turning the shop into both a store and a social space.',{radius:10}),
 o('clerk','npc',48,62,'Record Clerk','🧑🏻‍🎤','talk','Record Clerk','The clerk is tracking which songs teenagers keep requesting and which records adults call too loud.',{radius:8,choices:[
   {label:'Ask what’s popular',flag:'fiftiesPop',reply:'The clerk points to a stack of fast-selling singles and says radio requests are pushing demand.'},
   {label:'Ask about local musicians',flag:'fiftiesLocal',reply:'A handwritten flyer advertises a small local dance band playing at the community hall.'}
 ]}),
 o('backMain2','door',91,84,'Back to Main Street','🚪','travel','','',{to:'fifties',radius:9})
],[item('single45',35,70,'🎵','45 RPM Single')],{passport:false,quest:{title:'New Release Day',targets:['bins','booth','clerk'],reward:'Record Shop Stamp'}});

hardScenes.roaringJazz=S('Jazz Club','jazzInterior',{x:50,y:84},'Inside the Jazz Club','Move between the bandstand, tables, and backstage corridor.',[
 o('bandstand','building',50,34,'Bandstand','🎷','inspect','Bandstand','Ensembles build performances around rhythm, arrangement, individual style, improvisation, and close listening.',{radius:12}),
 o('pianoJazz','building',24,58,'Club Piano','🎹','inspect','Club Piano','The piano anchors harmony and rhythm while interacting with the rest of the band.',{radius:10}),
 o('bandleader','npc',74,59,'Bandleader','🧑🏾‍🎼','talk','Bandleader','The bandleader balances rehearsal, personalities, arrangements, bookings, and the energy of the room.',{radius:8}),
 o('backJazz','door',91,84,'Back to City','🚪','travel','','',{to:'roaring',radius:9})
],[item('setList',37,70,'📝','Band Set List')],{passport:false,quest:{title:'Tonight’s Set',targets:['bandstand','pianoJazz','bandleader'],reward:'Jazz Club Stamp'}});

hardScenes.roaringRadio=S('Radio Studio','radioInterior',{x:50,y:84},'On the Air','Explore microphones, control equipment, scripts, and live broadcasting routines.',[
 o('mic','building',26,44,'Broadcast Microphone','🎙️','inspect','Broadcast Microphone','Performers, announcers, musicians, and speakers gather around sensitive microphones for live programs.',{radius:10}),
 o('controlRoom','building',70,43,'Control Room','🎛️','inspect','Control Room','Technicians manage levels, cues, timing, and the practical flow of a live broadcast.',{radius:10}),
 o('announcer','npc',48,62,'Radio Announcer','🧑🏼‍💼','talk','Radio Announcer','The announcer watches the clock closely; every sponsor message, song, and news item must fit the schedule.',{radius:8}),
 o('backRadio','door',91,84,'Back to City','🚪','travel','','',{to:'roaring',radius:9})
],[item('radioScript',36,70,'📄','Broadcast Script')],{passport:false,quest:{title:'Live Broadcast',targets:['mic','controlRoom','announcer'],reward:'On-Air Stamp'}});

hardScenes.apolloControl=S('Mission Control','apolloInterior',{x:50,y:84},'Inside Mission Control','Walk the control room floor and meet the teams watching spacecraft systems.',[
 o('consoles','building',30,42,'Flight Consoles','🖥️','inspect','Flight Consoles','Specialized controllers monitor different systems while sharing information through tightly coordinated procedures.',{radius:12}),
 o('bigBoard','building',70,39,'Status Displays','📊','inspect','Status Displays','Large displays give teams a shared picture of timing, trajectory, communications, and mission status.',{radius:11}),
 o('controller','npc',50,62,'Flight Controller','🧑🏽‍🚀','talk','Flight Controller','The controller explains that success depends on disciplined teamwork, precise communication, and preparation for failures as well as normal operations.',{radius:8,choices:[
   {label:'Ask about teamwork',flag:'apolloTeam',reply:'No single console can understand the entire spacecraft alone. Controllers rely on each other’s expertise.'},
   {label:'Ask about emergencies',flag:'apolloEmergency',reply:'Teams rehearse abnormal situations so they can respond with procedures instead of panic.'}
 ]}),
 o('backApollo','door',91,84,'Back Outside','🚪','travel','','',{to:'apollo',radius:9})
],[item('consoleCard',36,70,'🗂️','Controller Reference Card')],{passport:false,quest:{title:'Flight Control',targets:['consoles','bigBoard','controller'],reward:'Mission Control Stamp'}});

hardScenes.apolloWatch=S('1969 Watch Party','watchInterior',{x:50,y:84},'Living-Room Watch Party','Join a household gathered around a television as the moon landing unfolds.',[
 o('television','building',50,34,'Television','📺','inspect','Television','Broadcast images and commentary brought the mission into homes around the world.',{radius:12}),
 o('newspaperPile','building',24,60,'Newspapers','📰','inspect','Newspapers','Special editions, diagrams, photographs, and headlines helped readers follow the mission in detail.',{radius:10}),
 o('neighbor','npc',74,60,'Neighbor','🧑🏿','talk','Neighbor','The neighbor says the whole block seems unusually quiet because so many families are gathered around television sets.',{radius:8}),
 o('backApollo2','door',91,84,'Back Outside','🚪','travel','','',{to:'apollo',radius:9})
],[item('moonHeadline',36,70,'🗞️','Moon-Landing Headline')],{passport:false,quest:{title:'Watching History',targets:['television','newspaperPile','neighbor'],reward:'Watch Party Stamp'}});

hardScenes.romeForum=S('Roman Forum','romeForum',{x:50,y:84},'In the Forum','Explore public business, inscriptions, vendors, and civic life.',[
 o('basilica','building',26,42,'Basilica','🏛️','inspect','Basilica','Large public halls could host legal proceedings, business, administration, and social activity.',{radius:11}),
 o('inscription','building',70,42,'Public Inscription','🪨','inspect','Public Inscription','Stone inscriptions preserve official names, honors, dedications, building records, and political messages.',{radius:10}),
 o('citizen','npc',49,62,'City Resident','🧑🏽','talk','City Resident','The resident complains about prices, crowds, and how long it takes to finish business in the forum.',{radius:8}),
 o('backRome','door',91,84,'Back to Roman City','🚪','travel','','',{to:'rome',radius:9})
],[item('forumToken',35,70,'🪙','Forum Token')],{passport:false,quest:{title:'Public Business',targets:['basilica','inscription','citizen'],reward:'Forum Stamp'}});

hardScenes.romeBaths=S('Roman Baths','romeBaths',{x:50,y:84},'Inside the Baths','Explore changing rooms, heated chambers, water systems, and social spaces.',[
 o('changing','building',24,47,'Changing Room','🧺','inspect','Changing Room','Visitors store clothing and belongings before moving through the bathing complex.',{radius:10}),
 o('hotRoom','building',70,43,'Heated Room','♨️','inspect','Heated Room','Underfloor heating systems warm selected spaces using hot air moving beneath raised floors.',{radius:11}),
 o('attendant','npc',48,62,'Bath Attendant','🧑🏻‍🔧','talk','Bath Attendant','The attendant keeps track of cleaning, fuel, visitors, equipment, and the practical work hidden behind the marble.',{radius:8}),
 o('backRome2','door',91,84,'Back to Roman City','🚪','travel','','',{to:'rome',radius:9})
],[item('bathOil',36,70,'🏺','Small Oil Flask')],{passport:false,quest:{title:'How the Baths Work',targets:['changing','hotRoom','attendant'],reward:'Bathhouse Stamp'}});

hardScenes.renaissancePrint=S('Renaissance Print Shop','printInterior',{x:50,y:84},'Inside the Print Shop','Move from type cases to the press and meet the people producing printed pages.',[
 o('typeCase','building',25,45,'Type Cases','🔠','inspect','Type Cases','Individual pieces of movable type must be selected, arranged, inked, printed, redistributed, and reused.',{radius:10}),
 o('handPress','building',70,43,'Hand Press','🖨️','inspect','Hand Press','A screw press transfers ink from arranged type onto sheets of paper with repeated manual work.',{radius:11}),
 o('apprentice','npc',48,62,'Printer’s Apprentice','🧑🏻‍🏭','talk','Printer’s Apprentice','The apprentice sweeps, sorts type, carries paper, mixes ink, learns the trade, and tries not to drop anything expensive.',{radius:8}),
 o('backRen','door',91,84,'Back to Piazza','🚪','travel','','',{to:'renaissance',radius:9})
],[item('typePiece',36,70,'🔡','Piece of Movable Type')],{passport:false,quest:{title:'Make a Page',targets:['typeCase','handPress','apprentice'],reward:'Printer Stamp'}});

hardScenes.renaissanceAtelier=S('Artist Workshop','atelierInterior',{x:50,y:84},'Inside the Workshop','Explore drawings, pigments, commissions, and apprenticeship.',[
 o('drawing','building',24,45,'Drawing Table','✏️','inspect','Drawing Table','Preparatory drawings help artists study figures, composition, perspective, architecture, and details before final work.',{radius:10}),
 o('pigments','building',70,43,'Pigment Shelf','🎨','inspect','Pigments must be sourced, ground, mixed, stored, and combined with suitable binders for different surfaces.',{radius:10}),
 o('master','npc',48,62,'Workshop Master','🧑🏻‍🎨','talk','Workshop Master','The master balances commissions, patrons, materials, apprentices, deadlines, and artistic decisions.',{radius:8}),
 o('backRen2','door',91,84,'Back to Piazza','🚪','travel','','',{to:'renaissance',radius:9})
],[item('charcoal',36,70,'🖍️','Charcoal Study Stick')],{passport:false,quest:{title:'Workshop Practice',targets:['drawing','pigments','master'],reward:'Atelier Stamp'}});

hardScenes.revolutionPrint=S('1776 Print Shop','revPrintInterior',{x:50,y:84},'Inside the Print Shop','Explore type, broadsides, advertisements, and fast-moving wartime information.',[
 o('composing','building',24,44,'Composing Table','🔠','inspect','Composing Table','Printers arrange type by hand, line by line, before pages or broadsides can be printed.',{radius:10}),
 o('broadsideRack','building',70,43,'Broadside Rack','📜','inspect','Broadside Rack','Single-sheet notices can carry news, announcements, advertisements, political arguments, or official orders.',{radius:10}),
 o('printer1776','npc',48,62,'Printer','🧑🏽‍🏭','talk','Printer','The printer says demand is high, paper is expensive, and every new report brings customers asking what has happened.',{radius:8}),
 o('backRev','door',91,84,'Back to Street','🚪','travel','','',{to:'revolution',radius:9})
],[item('inkBall',36,70,'⚫','Printer’s Ink Ball')],{passport:false,quest:{title:'Print the News',targets:['composing','broadsideRack','printer1776'],reward:'1776 Printer Stamp'}});

hardScenes.revolutionTavern=S('1776 Tavern','revTavernInterior',{x:50,y:84},'Inside the Tavern','Listen to travelers, merchants, messengers, and neighbors compare uncertain news.',[
 o('hearth','building',24,44,'Hearth','🔥','inspect','Tavern Hearth','Meals, warmth, and conversation gather around the hearth while travelers come and go.',{radius:10}),
 o('postTable','building',70,43,'Post & Notices','✉️','inspect','Post & Notices','Letters, notices, travel information, and personal messages move through informal local networks.',{radius:10}),
 o('traveler1776','npc',48,62,'Road Traveler','🧑🏼','talk','Road Traveler','The traveler has heard three different versions of the same military rumor and trusts none of them completely.',{radius:8,choices:[
   {label:'Ask how they judge a rumor',flag:'revSource',reply:'They compare who said it, where that person came from, and whether two independent travelers tell the same story.'},
   {label:'Ask about the road',flag:'revRoad',reply:'Travel is slow and uncertain. Weather, checkpoints, damaged roads, and military activity can all change a journey.'}
 ]}),
 o('backRev2','door',91,84,'Back to Street','🚪','travel','','',{to:'revolution',radius:9})
],[item('tavernToken',36,70,'🪙','Tavern Trade Token')],{passport:false,quest:{title:'Rumor & Reliability',targets:['hearth','postTable','traveler1776'],reward:'Tavern Listener Stamp'}});

const scenes=hardScenes;
let state=store.get('htp-playable-v2',null)||store.get('htp-playable-v1',null)||{scene:'hall',x:50,y:90,visited:['hall'],discoveries:[],keepsakes:[],journal:[],quests:{}};
state.visited=Array.isArray(state.visited)?state.visited:['hall'];state.discoveries=Array.isArray(state.discoveries)?state.discoveries:[];state.keepsakes=Array.isArray(state.keepsakes)?state.keepsakes:[];state.journal=Array.isArray(state.journal)?state.journal:[];state.quests=state.quests||{};
if(!scenes[state.scene]){state.scene='hall';state.x=50;state.y=90}
const questCard=document.createElement('div');questCard.className='quest-card';questCard.innerHTML='<p class="mini-kicker">ERA OBJECTIVE</p><h2 id="questTitle">Explore freely</h2><div id="questProgress">No required objective in the Time Hall.</div><div class="quest-meter"><i id="questFill"></i></div>';side.insertBefore(questCard,side.children[1]||null);
const questTitle=$('#questTitle'),questProgress=$('#questProgress'),questFill=$('#questFill');
function save(){store.set('htp-playable-v2',state)}
function showToast(msg){toast.textContent=msg;toast.classList.add('show');clearTimeout(showToast.t);showToast.t=setTimeout(()=>toast.classList.remove('show'),1700)}
function addJournal(title,text){if(!state.journal.some(e=>e.title===title)){state.journal.unshift({title,text,date:new Date().toLocaleDateString()});state.journal=state.journal.slice(0,60);save()}}
function discoveryKey(scene,id){return scene+':'+id}\nfunction targetDone(id){return state.discoveries.includes(discoveryKey(state.scene,id))||state.keepsakes.includes(id)}
function updateQuest(){
 const q=scenes[state.scene].quest;if(!q){questTitle.textContent='Explore freely';questProgress.textContent='No required objective here. Wander wherever you like.';questFill.style.width='0%';return}
 const done=q.targets.filter(targetDone).length,pct=Math.round(done/q.targets.length*100);questTitle.textContent=q.title;questProgress.textContent=done+' of '+q.targets.length+' discoveries complete';questFill.style.width=pct+'%';
 if(done===q.targets.length&&!state.quests[state.scene]){state.quests[state.scene]=true;addJournal('Completed: '+q.title,'Reward earned: '+q.reward+'.');save();showToast('Objective complete — '+q.reward+' ✨')}
}
function renderScene(){
 const s=scenes[state.scene];sceneName.textContent=s.name;backdrop.className='scene-backdrop '+s.class;journeyTitle.textContent=s.title;journeyText.textContent=s.text;objects.innerHTML='';labels.innerHTML='';collectibles.innerHTML='';
 s.objects.forEach(obj=>{const el=document.createElement('div');el.className='world-object '+obj.type;el.style.left=obj.x+'%';el.style.top=obj.y+'%';if(obj.icon)el.textContent=obj.icon;objects.appendChild(el);const lab=document.createElement('div');lab.className='world-label';lab.style.left=obj.x+'%';lab.style.top=(obj.y-(obj.type==='portal'?13:9))+'%';lab.textContent=obj.label;labels.appendChild(lab)});
 for(let i=0;i<3;i++){const walker=document.createElement('div');walker.className='ambient-walker w'+i;walker.textContent=['🚶🏽','🚶🏻','🚶🏿'][i];walker.style.top=(46+i*14)+'%';objects.appendChild(walker)}\n s.items.forEach(it=>{if(state.keepsakes.includes(it.id))return;const el=document.createElement('div');el.className='collectible';el.style.left=it.x+'%';el.style.top=it.y+'%';el.textContent=it.icon;el.title=it.name;collectibles.appendChild(el)});
 if(s.passport&&!state.visited.includes(state.scene)){state.visited.push(state.scene);addJournal('Arrived: '+s.name,'You entered '+s.name+'.');save()}
 const spawn=s.spawn;moveTo(Number.isFinite(state.x)?state.x:spawn.x,Number.isFinite(state.y)?state.y:spawn.y,false);renderStatus();updateNearby();showToast('Entered '+s.name)
}
function renderStatus(){discoveryCount.textContent=state.discoveries.length;keepsakeCount.textContent=state.keepsakes.length;passportList.innerHTML=Object.entries(scenes).filter(([,s])=>s.passport).map(([k,s])=>'<span class="passport-stamp '+(state.visited.includes(k)?'visited':'')+'">'+(state.visited.includes(k)?'✓ ':'')+s.name.split('•')[0].trim()+'</span>').join('');renderMap();updateQuest()}
function nearest(){const s=scenes[state.scene];let best=null,bestD=999;for(const obj of s.objects){const d=distance({x:state.x,y:state.y},obj);if(d<bestD){best=obj;bestD=d}}return best&&bestD<=(best.radius||9)?best:null}
function collectNearby(){const s=scenes[state.scene];for(const it of s.items){if(state.keepsakes.includes(it.id))continue;if(distance({x:state.x,y:state.y},it)<6){state.keepsakes.push(it.id);addJournal('Keepsake: '+it.name,'Found while exploring '+s.name+'.');save();showToast('Collected '+it.name+' ✨');renderScene();return true}}return false}
function updateNearby(){const n=nearest();if(n){nearbyInfo.innerHTML='<b>'+n.label+'</b><br>'+(n.action==='travel'?'A doorway is within reach.':'Move close and explore.');exploreBtn.disabled=false;hint.classList.remove('hidden');hint.textContent=n.action==='travel'?'Step through':'Press E or tap Explore'}else{nearbyInfo.textContent='Keep walking. Look for people, buildings, glowing portals, doors, and keepsakes.';exploreBtn.disabled=true;hint.classList.add('hidden')}}
function moveTo(x,y,check=true){state.x=clamp(x,4,96);state.y=clamp(y,14,93);traveler.style.left=state.x+'%';traveler.style.top=state.y+'%';if(check){if(!collectNearby()){updateNearby();updateQuest();save()}}}
function move(dx,dy){moveTo(state.x+dx,state.y+dy)}
function travel(to){const target=scenes[to];if(!target)return;state.scene=to;state.x=target.spawn.x;state.y=target.spawn.y;save();renderScene()}
function interact(){const obj=nearest();if(!obj)return;if(obj.action==='travel'){travel(obj.to);return}
 const dKey=discoveryKey(state.scene,obj.id);if(!state.discoveries.includes(dKey)){state.discoveries.push(dKey);addJournal(obj.title||obj.label,obj.body||'Discovered while exploring.');save();showToast('New discovery added ✨')}
 const choiceHtml=Array.isArray(obj.choices)?obj.choices.map((ch,i)=>'<button type="button" data-choice="'+i+'">'+ch.label+'</button>').join(''):'';dialogContent.innerHTML='<p class="mini-kicker">'+scenes[state.scene].name+'</p><h2>'+obj.title+'</h2><p>'+obj.body+'</p><div id="choiceReply"></div><div class="dialog-actions">'+choiceHtml+'<button type="button" id="rememberBtn">Journal this discovery ✓</button></div>';dialog.showModal();dialogContent.querySelectorAll('[data-choice]').forEach(btn=>btn.addEventListener('click',()=>{const ch=obj.choices[Number(btn.dataset.choice)];state.flags=state.flags||{};state.flags[ch.flag]=true;save();const reply=dialogContent.querySelector('#choiceReply');reply.innerHTML='<p class="choice-reply">'+ch.reply+'</p>';addJournal(obj.title+' — '+ch.label,ch.reply);showToast('Conversation remembered')}));const remember=dialogContent.querySelector('#rememberBtn');if(remember)remember.addEventListener('click',()=>{addJournal(obj.title,obj.body);showToast('Added to journal')});renderStatus()
}
function renderMap(){mapGrid.innerHTML=Object.entries(scenes).filter(([,s])=>s.passport||s===scenes.hall).map(([k,s])=>'<button type="button" data-scene="'+k+'" '+(k!=='hall'&&!state.visited.includes(k)?'disabled':'')+'>'+(k==='hall'||state.visited.includes(k)?'✓ ':'🔒 ')+s.name+'</button>').join('');mapGrid.querySelectorAll('button:not(:disabled)').forEach(b=>b.addEventListener('click',()=>{mapDialog.close();travel(b.dataset.scene)}))}
function openJournal(){journalEntries.innerHTML=state.journal.length?state.journal.map(e=>'<div class="journal-entry"><b>'+e.title+'</b><div>'+e.text+'</div><small>'+e.date+'</small></div>').join(''):'<p>Your journal is empty. Walk around and discover something.</p>';journalDialog.showModal()}
const keys=new Set();let raf=0,last=0;function tick(t){if(!keys.size){raf=0;return}if(t-last>43){let dx=0,dy=0;if(keys.has('arrowleft')||keys.has('a'))dx-=1.65;if(keys.has('arrowright')||keys.has('d'))dx+=1.65;if(keys.has('arrowup')||keys.has('w'))dy-=1.65;if(keys.has('arrowdown')||keys.has('s'))dy+=1.65;if(dx||dy)move(dx,dy);last=t}raf=requestAnimationFrame(tick)}
root.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(['arrowleft','arrowright','arrowup','arrowdown','w','a','s','d'].includes(k)){e.preventDefault();keys.add(k);if(!raf)raf=requestAnimationFrame(tick)}else if(k==='e'){e.preventDefault();interact()}else if(k==='m'){e.preventDefault();mapDialog.showModal()}else if(k==='j'){e.preventDefault();openJournal()}});
root.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
root.querySelectorAll('[data-move]').forEach(btn=>{let timer;const run=()=>{const d=btn.dataset.move;move(d==='left'?-2:d==='right'?2:0,d==='up'?-2:d==='down'?2:0)};btn.addEventListener('pointerdown',e=>{e.preventDefault();run();timer=setInterval(run,88)});['pointerup','pointercancel','pointerleave'].forEach(ev=>btn.addEventListener(ev,()=>clearInterval(timer)))});
exploreBtn.addEventListener('click',interact);$('#mapBtn').addEventListener('click',()=>mapDialog.showModal());$('#journalGameBtn').addEventListener('click',openJournal);stage.addEventListener('pointerdown',()=>stage.focus());
renderScene();stage.focus({preventScroll:true});
})();