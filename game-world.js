(()=>{'use strict';
const root=document.getElementById('timeWorld'); if(!root)return;
const $=s=>root.querySelector(s);
const stage=$('#gameStage'), traveler=$('#traveler'), objects=$('#worldObjects'), labels=$('#worldLabels'), collectibles=$('#collectibles');
const exploreBtn=$('#exploreBtn'), nearbyInfo=$('#nearbyInfo'), sceneName=$('#gameSceneName'), journeyTitle=$('#journeyTitle'), journeyText=$('#journeyText');
const discoveryCount=$('#gameDiscoveryCount'), keepsakeCount=$('#gameKeepsakeCount'), passportList=$('#passportList'), progressPercent=$('#gameProgressPercent');
const dialog=$('#worldDialog'), dialogContent=$('#worldDialogContent'), mapDialog=$('#timeMapDialog'), mapGrid=$('#timeMapGrid'), journalDialog=$('#gameJournalDialog'), journalEntries=$('#gameJournalEntries'), achievementDialog=$('#achievementDialog'), achievementList=$('#achievementList');
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
 o('diningDoor','door',52,67,'Dining Saloon','🍽️','travel','Enter Dining Saloon','',{to:'titanicDining',radius:9}),
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
 o('workshopDoor','door',84,62,'Craft Workshop','🛠️','travel','Enter Workshop','',{to:'egyptWorkshop',radius:9}),
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
 o('kitchen','door',22,59,'Castle Kitchen','🍲','travel','Enter Castle Kitchen','',{to:'medievalKitchen',radius:10}),
 o('steward','npc',74,58,'Household Steward','🧑🏼‍💼','talk','Household Steward','The steward tracks supplies, workers, visitors, expenses, and the many practical needs of the household.',{radius:8}),
 o('backVillage','door',91,84,'Back to Village','🚪','travel','','',{to:'medieval',radius:9})
],[item('seal',37,70,'🕯️','Wax Seal')],{passport:false,quest:{title:'Castle Household',targets:['greatHall','kitchen','steward'],reward:'Castle Household Stamp'}});

hardScenes.victorian=S('Victorian City • 1890s','victorian',{x:50,y:84},'Gaslight & Newspapers','Walk a busy late-19th-century city street of shops, newspapers, transit, parlors, and public life.',[
 o('newspaper','building',19,47,'Newspaper Office','📰','travel','Enter Newspaper Office','',{to:'victorianNews',radius:11}),
 o('theatre','building',73,43,'Theatre','🎭','travel','Enter Theatre','',{to:'victorianTheatre',radius:11}),
 o('newsboy','npc',47,61,'News Seller','🧑🏻','talk','News Seller','Headlines travel quickly through the street as sellers call out the latest edition.',{radius:8}),
 o('stationDoor','door',88,65,'Railway Station','🚉','travel','Enter Railway Station','',{to:'victorianStation',radius:9}),
 returnPortal()
],[item('penny',80,68,'🪙','Victorian Penny'),item('playbill',30,34,'📃','Theatre Playbill')],{quest:{title:'City Edition',targets:['newspaper','theatre','newsboy'],reward:'Gaslight City Stamp'}});

hardScenes.fifties=S('1950s Main Street','fifties',{x:50,y:84},'Mid-Century Main Street','Explore a stylized American Main Street with a diner, record shop, cinema, and neighborhood life.',[
 o('diner','building',21,48,'Corner Diner','🍔','travel','Enter Corner Diner','',{to:'fiftiesDiner',radius:11}),
 o('records','building',73,46,'Record Shop','🎵','travel','Enter Record Shop','',{to:'fiftiesRecords',radius:11}),
 o('cinemaDoor','door',54,37,'Movie House','🎬','travel','Enter Movie House','',{to:'fiftiesCinema',radius:9}),
 o('student','npc',46,62,'High-School Student','🧑🏽‍🎓','talk','A Local Student','The student is saving for a new record and talking about the Saturday movie matinee.',{radius:8}),
 returnPortal()
],[item('nickel',78,70,'🪙','Jukebox Nickel'),item('ticket50',30,34,'🎫','Movie Ticket Stub')],{quest:{title:'Saturday on Main Street',targets:['diner','records','ticket50'],reward:'Main Street Stamp'}});

hardScenes.roaring=S('Roaring Twenties','roaring',{x:50,y:84},'Jazz-Age City','Explore newspapers, radio, nightlife, fashion, and rapid technological and cultural change.',[
 o('jazz','building',20,47,'Jazz Club','🎷','travel','Enter Jazz Club','',{to:'roaringJazz',radius:11}),
 o('radio','building',72,44,'Radio Studio','📻','travel','Enter Radio Studio','',{to:'roaringRadio',radius:11}),
 o('photographer','npc',48,61,'Street Photographer','📷','talk','Street Photographer','The photographer watches changing clothes, cars, advertisements, and crowds rush through the city.',{radius:8}),
 returnPortal()
],[item('record',78,69,'💿','Shellac Record'),item('pressCard',31,34,'🪪','Press Card')],{quest:{title:'City in Motion',targets:['jazz','radio','photographer'],reward:'Jazz Age Stamp'}});

hardScenes.apollo=S('Apollo Era • 1969','apollo',{x:50,y:84},'Moonshot Summer','Explore mission-control culture, engineering work, television, and the public excitement surrounding Apollo 11.',[
 o('control','building',22,44,'Mission Control','🖥️','travel','Enter Mission Control','',{to:'apolloControl',radius:12}),
 o('tv','building',73,48,'Watch Party','📺','travel','Join Watch Party','',{to:'apolloWatch',radius:10}),
 o('engineer','npc',47,62,'Engineer','🧑🏾‍🔧','talk','Systems Engineer','Spaceflight depended on large teams across engineering, manufacturing, mathematics, computing, logistics, training, and operations.',{radius:8}),
 o('engineeringDoor','door',88,65,'Engineering Annex','🧰','travel','Enter Engineering Annex','',{to:'apolloEngineering',radius:9}),
 returnPortal()
],[item('missionPatch',80,69,'🚀','Mission Patch'),item('slideRule',30,35,'📏','Slide Rule')],{quest:{title:'Mission Ready',targets:['control','engineer','missionPatch'],reward:'Apollo Visitor Stamp'}});

hardScenes.rome=S('Ancient Rome','rome',{x:50,y:84},'Roman City','Explore a forum, food stall, bath complex, apartments, and the movement of people through a dense ancient city.',[
 o('forum','building',22,43,'Forum','🏛️','travel','Enter Forum','',{to:'romeForum',radius:12}),
 o('thermae','building',73,46,'Public Baths','♨️','travel','Enter Public Baths','',{to:'romeBaths',radius:11}),
 o('vendor','npc',47,62,'Food Vendor','🧑🏽‍🍳','talk','Street Food Vendor','Not every urban resident cooked every meal at home; food shops and prepared foods were part of city life.',{radius:8}),
 returnPortal()
],[item('romanCoin',80,69,'🪙','Roman Coin Keepsake'),item('oilLamp',31,34,'🪔','Small Oil Lamp')],{quest:{title:'A Day in the City',targets:['forum','thermae','vendor'],reward:'Roman City Stamp'}});

hardScenes.renaissance=S('Renaissance City • 1500s','renaissance',{x:50,y:84},'Workshop & Piazza','Explore printing, art workshops, markets, music, craft, and urban life in a Renaissance-inspired city.',[
 o('printer','building',21,45,'Print Shop','🖨️','travel','Enter Print Shop','',{to:'renaissancePrint',radius:11}),
 o('atelier','building',73,44,'Artist Workshop','🎨','travel','Enter Artist Workshop','',{to:'renaissanceAtelier',radius:11}),
 o('merchant','npc',47,62,'Cloth Merchant','🧑🏻‍💼','talk','Cloth Merchant','Trade networks connect local markets with textiles, dyes, luxury goods, raw materials, and distant ports.',{radius:8}),
 returnPortal()
],[item('print',80,70,'📜','Printed Broadside'),item('brush',31,34,'🖌️','Workshop Brush')],{quest:{title:'Ideas in the Piazza',targets:['printer','atelier','merchant'],reward:'Renaissance Stamp'}});

hardScenes.revolution=S('Revolution-Era City • 1776','revolution',{x:50,y:84},'Print Shops & Public Debate','Explore a city shaped by war, political argument, trade disruption, newspapers, taverns, households, and messengers.',[
 o('printshop','building',20,44,'Print Shop','📰','travel','Enter Print Shop','',{to:'revolutionPrint',radius:11}),
 o('tavern','building',73,47,'Tavern','🍺','travel','Enter Tavern','',{to:'revolutionTavern',radius:11}),
 o('messenger','npc',47,61,'Messenger','🏇','talk','City Messenger','News travels by horse, post, print, rumor, and personal networks. Wartime information can be late, incomplete, or contradictory.',{radius:8}),
 returnPortal()
],[item('broadside',79,70,'📜','Printed Broadside'),item('quill',30,34,'🪶','Writing Quill')],{quest:{title:'News of 1776',targets:['printshop','messenger','broadside'],reward:'Revolution-Era Stamp'}});


/* --- Connected sub-areas: expansion pass 3 --- */

hardScenes.titanicDining=S('Titanic • Dining Saloon','titanicDining',{x:50,y:84},'Dining Saloon','Move among tables, service stations, and staff preparing a formal meal aboard the ship.',[
 o('tables','building',26,43,'Dining Tables','🍽️','inspect','Dining Tables','Large passenger dining rooms required careful seating, service routines, linens, tableware, food preparation, and coordination between many crew members.',{radius:10}),
 o('service','building',71,43,'Service Station','🥄','inspect','Service Station','Stewards organize dishes, courses, tableware, and timing between the galley and dining room.',{radius:10}),
 o('diningSteward','npc',48,62,'Dining Steward','🧑🏻‍🍳','talk','Dining Steward','The steward is checking place settings and timing before passengers arrive.',{radius:8}),
 o('backTitanicInside','door',91,84,'Back to Ship Interior','🚪','travel','','',{to:'titanicInterior',radius:9})
],[item('napkinRing',36,70,'⭕','Replica Napkin Ring')],{passport:false,quest:{title:'Prepare the Saloon',targets:['tables','service','diningSteward'],reward:'Dining Saloon Stamp'}});

hardScenes.medievalKitchen=S('Medieval Castle Kitchen','medievalKitchen',{x:50,y:84},'Castle Kitchen','Explore hearths, preparation tables, storage, and the household labor behind a large meal.',[
 o('hearthKitchen','building',24,43,'Cooking Hearth','🔥','inspect','Cooking Hearth','Large hearths, spits, pots, ovens, fuel, and constant labor support the preparation of meals for a sizeable household.',{radius:10}),
 o('prepTable','building',70,43,'Preparation Table','🥕','inspect','Preparation Table','Food preparation involves chopping, grinding, mixing, portioning, preserving, and coordinating many dishes.',{radius:10}),
 o('cook','npc',48,62,'Castle Cook','🧑🏼‍🍳','talk','Castle Cook','The cook is organizing bread, pottage, roasted foods, sauces, and servants carrying dishes to the hall.',{radius:8}),
 o('backCastleRoom','door',91,84,'Back to Castle','🚪','travel','','',{to:'medievalCastle',radius:9})
],[item('woodenSpoon',36,70,'🥄','Wooden Kitchen Spoon')],{passport:false,quest:{title:'Feed the Household',targets:['hearthKitchen','prepTable','cook'],reward:'Castle Kitchen Stamp'}});

hardScenes.fiftiesCinema=S('1950s Movie House','cinemaInterior',{x:50,y:84},'At the Movie House','Walk through the lobby, auditorium, and projection booth of a neighborhood cinema.',[
 o('lobby','building',24,43,'Cinema Lobby','🍿','inspect','Cinema Lobby','Ticket sales, concessions, posters, ushers, and crowds all converge in the lobby before a screening.',{radius:10}),
 o('projection','building',70,43,'Projection Booth','🎞️','inspect','Projection Booth','Projectionists manage film reels, changeovers, focus, sound, and equipment throughout the program.',{radius:10}),
 o('usher','npc',48,62,'Usher','🧑🏾‍💼','talk','Cinema Usher','The usher checks tickets, helps seat patrons, tidies the auditorium, and watches the lobby between shows.',{radius:8}),
 o('backFiftiesStreet','door',91,84,'Back to Main Street','🚪','travel','','',{to:'fifties',radius:9})
],[item('cinemaProgram',36,70,'🎟️','Cinema Program')],{passport:false,quest:{title:'Before the Feature',targets:['lobby','projection','usher'],reward:'Movie House Stamp'}});

hardScenes.egyptWorkshop=S('Ancient Egyptian Workshop','egyptWorkshop',{x:50,y:84},'Craft Workshop','Explore pottery, textile work, tools, storage, and skilled labor in a riverside settlement.',[
 o('pottery','building',24,43,'Pottery Area','🏺','inspect','Pottery Area','Clay vessels are formed, dried, decorated, fired, stored, traded, and used throughout daily life.',{radius:10}),
 o('loom','building',70,43,'Loom','🧵','inspect','Loom','Textile production involves spinning fibers, preparing thread, weaving cloth, and finishing fabric for household and trade use.',{radius:10}),
 o('artisan','npc',48,62,'Workshop Artisan','🧑🏾‍🎨','talk','Workshop Artisan','The artisan divides the day between customer orders, repairs, teaching a younger worker, and preparing goods for market.',{radius:8}),
 o('backEgypt','door',91,84,'Back to Riverside Settlement','🚪','travel','','',{to:'egypt',radius:9})
],[item('clayToken',36,70,'🔸','Small Clay Token')],{passport:false,quest:{title:'Workshop Day',targets:['pottery','loom','artisan'],reward:'Artisan Workshop Stamp'}});

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
 o('stagehand','npc',73,59,'Stagehand','🧑🏻‍🔧','talk','Stagehand','The stagehand checks ropes, scenery, props, entrances, and dozens of practical details before the curtain rises.',{radius:8,choices:[{label:'Ask about the missing railway message',requires:'victorianMessageLead',flag:'victorianMessageSolved',reply:'The stagehand remembers a messenger leaving the note at the stage door by mistake. The theater manager forwarded it late; you can now tell the newspaper what happened.'}]}),
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
   {label:'Ask about emergencies',flag:'apolloEmergency',reply:'Teams rehearse abnormal situations so they can respond with procedures instead of panic.'},
   {label:'Ask about the odd telemetry reading',flag:'apolloSignalLead',reply:'A controller points out a small telemetry fluctuation and asks the engineering annex to reproduce the reading on the ground.'}
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



hardScenes.victorianStation=S('Victorian Railway Station','stationInterior',{x:50,y:84},'At the Railway Station','Explore platforms, luggage handling, telegraph messages, and the confusion around a delayed arrival.',[
 o('platformClock','building',22,40,'Platform Clock','🕰️','inspect','Platform Clock','Railway timetables depend on coordinated clocks, schedules, signaling, and communication across the network.',{radius:10}),
 o('telegraphDesk','building',72,42,'Telegraph Desk','⚡','inspect','Telegraph Desk','Telegraph messages help stations share operational information across distance much faster than physical mail.',{radius:10}),
 o('stationMaster','npc',47,62,'Station Master','🧑🏻‍✈️','talk','Station Master','The station master is juggling passengers, luggage, messages, platform assignments, and a train that is overdue.',{radius:8,choices:[
  {label:'Mention the reporter’s delayed-train story',requires:'victorianRail',flag:'victorianStationLead',reply:'The station master says a damaged signal line delayed the train outside the city, but one message never reached the newspaper.'},
  {label:'Ask where the missing message went',requires:'victorianStationLead',flag:'victorianMessageLead',reply:'A copy was handed to a messenger who left toward the theater district before the train arrived.'}
 ]}),
 o('backVictorian','door',91,84,'Back to City Street','🚪','travel','','',{to:'victorian',radius:9})
],[item('railTicket',35,70,'🎫','Railway Platform Ticket')],{passport:false,quest:{title:'Delayed Arrival',targets:['platformClock','telegraphDesk','stationMaster'],reward:'Railway Station Stamp'}});

hardScenes.apolloEngineering=S('Apollo Engineering Annex','engineeringInterior',{x:50,y:84},'Engineering Annex','Trace spacecraft systems through diagrams, test benches, and troubleshooting discussions.',[
 o('schematics','building',22,42,'System Schematics','📐','inspect','System Schematics','Detailed diagrams help teams understand how electrical, communications, propulsion, guidance, and life-support systems connect.',{radius:10}),
 o('testBench','building',71,43,'Test Bench','🔧','inspect','Test Bench','Engineers reproduce faults and test components on the ground so flight teams have better information in real time.',{radius:10}),
 o('systemsTech','npc',48,62,'Systems Technician','🧑🏽‍🔧','talk','Systems Technician','The technician is investigating a telemetry fluctuation reported by Mission Control.',{radius:8,choices:[
  {label:'Ask about the telemetry fluctuation',requires:'apolloSignalLead',flag:'apolloBenchLead',reply:'The technician isolated the fluctuation to a sensor circuit and sends a test result back to Mission Control.'},
  {label:'Ask what the test proves',requires:'apolloBenchLead',flag:'apolloSignalSolved',reply:'The bench test confirms the sensor—not the spacecraft system itself—is producing the odd reading. The team can update its interpretation safely.'}
 ]}),
 o('backApolloEngineering','door',91,84,'Back Outside','🚪','travel','','',{to:'apollo',radius:9})
],[item('wiringTag',35,70,'🏷️','Engineering Wiring Tag')],{passport:false,quest:{title:'Trace the Signal',targets:['schematics','testBench','systemsTech'],reward:'Engineering Annex Stamp'}});


hardScenes.homefront=S('1940s Home Front','homefront',{x:50,y:84},'Home Front • 1940s','Explore rationing, radio news, factory work, household routines, and community life during wartime.',[
 o('rationOffice','building',22,44,'Ration Office','📒','inspect','Ration Office','Ration systems regulated access to selected goods and required households to plan purchases carefully.',{radius:10}),
 o('radioHome','building',72,44,'Family Radio','📻','inspect','Family Radio','Radio carried news, entertainment, government messages, and wartime information into homes.',{radius:10}),
 o('factoryWorker','npc',48,62,'Factory Worker','🧑🏽‍🏭','talk','Factory Worker','The worker describes long shifts, production targets, transportation challenges, and changing roles in wartime industry.',{radius:8}),
 o('returnHomefront','portal',91,84,'Return to East Gallery','', 'travel','','',{to:'hallEast',radius:10})
],[item('rationBook',36,70,'📘','Ration Book Keepsake'),item('victoryPin',78,34,'📍','Home Front Pin')],{quest:{title:'A Wartime Day',targets:['rationOffice','radioHome','factoryWorker'],reward:'Home Front Stamp'}});

hardScenes.goldrush=S('Gold Rush Town • 1850s','goldrush',{x:50,y:84},'Gold Rush Settlement','Explore a boomtown of supply stores, claims, transport, newspapers, and people chasing uncertain opportunity.',[
 o('assay','building',22,44,'Assay Office','⚖️','inspect','Assay Office','Assayers evaluate ore and gold samples, helping determine value and purity.',{radius:10}),
 o('supply','building',72,44,'Supply Store','⛏️','inspect','Supply Store','Tools, food, clothing, rope, pans, boots, and basic supplies could cost dearly in a remote boomtown.',{radius:10}),
 o('prospector','npc',48,62,'Prospector','🧔🏻','talk','Prospector','The prospector has learned that finding gold is only one challenge; transport, food, weather, prices, and luck matter too.',{radius:8}),
 o('returnGold','portal',91,84,'Return to East Gallery','', 'travel','','',{to:'hallEast',radius:10})
],[item('goldPan',36,70,'🥣','Gold Pan'),item('claimTag',78,34,'🏷️','Claim Tag')],{quest:{title:'Boomtown Basics',targets:['assay','supply','prospector'],reward:'Gold Rush Stamp'}});

hardScenes.depression=S('Depression-Era America • 1930s','depression',{x:50,y:84},'Hard Times • 1930s','Explore relief offices, neighborhood kitchens, job boards, radio, and the ways families adapted during economic crisis.',[
 o('jobBoard','building',22,44,'Job Board','📋','inspect','Job Board','Job notices could draw many applicants during a period of severe unemployment.',{radius:10}),
 o('communityKitchen','building',72,44,'Community Kitchen','🍲','inspect','Community Kitchen','Relief organizations, charities, churches, governments, and neighbors provided food assistance in different forms.',{radius:10}),
 o('parent','npc',48,62,'Local Parent','🧑🏿','talk','Local Parent','The parent describes stretching meals, sharing resources, looking for work, and trying to protect children from constant worry.',{radius:8}),
 o('returnDepression','portal',91,84,'Return to East Gallery','', 'travel','','',{to:'hallEast',radius:10})
],[item('radioCard',36,70,'📻','Radio Program Card'),item('mealToken',78,34,'🎟️','Meal Token')],{quest:{title:'Making Do',targets:['jobBoard','communityKitchen','parent'],reward:'1930s Community Stamp'}});

hardScenes.paris1900=S('Paris • 1900','paris1900',{x:50,y:84},'Paris at the Turn of the Century','Explore boulevards, cafés, posters, transit, department stores, artists, and the excitement of a rapidly changing city.',[
 o('cafeParis','building',22,44,'Boulevard Café','☕','inspect','Boulevard Café','Cafés provided places to eat, meet, read newspapers, conduct business, and observe urban life.',{radius:10}),
 o('metro','building',72,44,'Métro Entrance','🚇','inspect','Paris Métro','The first line of the Paris Métro opened in 1900, transforming movement through the growing city.',{radius:10}),
 o('posterArtist','npc',48,62,'Poster Artist','🧑🏻‍🎨','talk','Poster Artist','The artist studies bold lettering, color, printing limits, and crowded streets where every poster competes for attention.',{radius:8}),
 o('returnParis','portal',91,84,'Return to East Gallery','', 'travel','','',{to:'hallEast',radius:10})
],[item('metroTicket',36,70,'🎫','Métro Ticket'),item('posterPrint',78,34,'🖼️','Poster Print')],{quest:{title:'Modern City',targets:['cafeParis','metro','posterArtist'],reward:'Paris 1900 Stamp'}});

hardScenes.ageOfSail=S('Age of Sail','ageOfSail',{x:50,y:84},'Harbor Under Sail','Explore docks, ship chandlers, navigation, cargo, sailors, and the labor required to send a sailing vessel to sea.',[
 o('chandler','building',22,44,'Ship Chandler','⚓','inspect','Ship Chandler','Chandlers supplied rope, canvas, tools, food, lamps, hardware, and other necessities for ships.',{radius:10}),
 o('chartTable','building',72,44,'Navigation Table','🧭','inspect','Navigation Table','Sailors combine charts, observations, instruments, experience, weather, and careful recordkeeping to navigate.',{radius:10}),
 o('sailor','npc',48,62,'Sailor','🧑🏼‍✈️','talk','Sailor','The sailor explains watches, rigging work, weather, maintenance, cramped quarters, and the constant discipline of shipboard life.',{radius:8}),
 o('returnSail','portal',91,84,'Return to West Gallery','', 'travel','','',{to:'hallWest',radius:10})
],[item('ropeKnot',36,70,'🪢','Practice Rope Knot'),item('compassToken',78,34,'🧭','Compass Token')],{quest:{title:'Ready the Ship',targets:['chandler','chartTable','sailor'],reward:'Age of Sail Stamp'}});

hardScenes.pompeii=S('Pompeii • 79 CE','pompeii',{x:50,y:84},'A Roman Town Before Vesuvius','Explore streets, food shops, homes, fountains, workshops, and everyday life before the eruption.',[
 o('bakeryPompeii','building',22,44,'Bakery','🍞','inspect','Pompeii Bakery','Bakeries used mills and ovens to produce bread for a dense urban population.',{radius:10}),
 o('fountainPompeii','building',72,44,'Street Fountain','⛲','inspect','Street Fountain','Public fountains distributed water through the town and served as everyday gathering points.',{radius:10}),
 o('residentPompeii','npc',48,62,'Town Resident','🧑🏽','talk','Town Resident','The resident is concerned with ordinary errands, prices, neighbors, work, and the day ahead—without knowing what history will remember.',{radius:8}),
 o('returnPompeii','portal',91,84,'Return to West Gallery','', 'travel','','',{to:'hallWest',radius:10})
],[item('breadStamp',36,70,'🍞','Bread Stamp Replica'),item('mosaicTile',78,34,'🟦','Mosaic Tile')],{quest:{title:'Ordinary Pompeii',targets:['bakeryPompeii','fountainPompeii','residentPompeii'],reward:'Pompeii Life Stamp'}});

hardScenes.viking=S('Viking-Age Harbor','viking',{x:50,y:84},'Northern Harbor','Explore boats, workshops, trade goods, homes, navigation, and seasonal travel in a Viking-Age settlement.',[
 o('longship','building',22,44,'Longship','⛵','inspect','Longship','Long, shallow-draft vessels could move along coasts, rivers, and open water, supporting trade, travel, warfare, and settlement.',{radius:10}),
 o('smithViking','building',72,44,'Smithy','⚒️','inspect','Harbor Smithy','Metalworkers produced and repaired tools, fittings, weapons, fasteners, and household objects.',{radius:10}),
 o('traderViking','npc',48,62,'Trader','🧔🏼','talk','Harbor Trader','The trader carries goods from distant places and depends on weather, ships, trusted contacts, and seasonal routes.',{radius:8}),
 o('returnViking','portal',91,84,'Return to West Gallery','', 'travel','','',{to:'hallWest',radius:10})
],[item('beadViking',36,70,'🔵','Trade Bead'),item('runeToken',78,34,'🪵','Carved Rune Token')],{quest:{title:'Harbor Trade',targets:['longship','smithViking','traderViking'],reward:'Viking Harbor Stamp'}});

hardScenes.silkroad=S('Silk Road Oasis','silkroad',{x:50,y:84},'Oasis Caravan Stop','Explore caravan trade, water management, inns, languages, animals, and goods moving across long-distance networks.',[
 o('caravanserai','building',22,44,'Caravanserai','🏨','inspect','Caravanserai','Roadside inns offered shelter, storage, food, water, information, and space for people and animals on long journeys.',{radius:10}),
 o('oasisWell','building',72,44,'Oasis Well','💧','inspect','Oasis Water','Reliable water sources shaped routes, settlement, agriculture, and the timing of caravan travel.',{radius:10}),
 o('caravanTrader','npc',48,62,'Caravan Trader','🧑🏾‍💼','talk','Caravan Trader','The trader carries textiles, spices, metal goods, stories, languages, and news across overlapping trade networks.',{radius:8}),
 o('returnSilk','portal',91,84,'Return to West Gallery','', 'travel','','',{to:'hallWest',radius:10})
],[item('silkSample',36,70,'🧣','Silk Sample'),item('tradeSeal',78,34,'🔖','Caravan Trade Seal')],{quest:{title:'Caravan Stop',targets:['caravanserai','oasisWell','caravanTrader'],reward:'Silk Road Stamp'}});

hardScenes.seaside=S('Edwardian Seaside • 1900s','seaside',{x:50,y:84},'Edwardian Seaside Resort','Explore a pier, bathing machines, promenade entertainment, hotels, postcards, and holiday routines.',[
 o('pier','building',22,44,'Seaside Pier','🎡','inspect','Seaside Pier','Piers could combine promenading, music, entertainment, refreshments, boats, and scenic views.',{radius:10}),
 o('postcardShop','building',72,44,'Postcard Shop','💌','inspect','Postcard Shop','Picture postcards became a hugely popular way for travelers to share short messages and holiday images.',{radius:10}),
 o('holidaymaker','npc',48,62,'Holidaymaker','🧑🏻‍🎩','talk','Holidaymaker','The visitor plans a promenade, sea air, photographs, refreshments, and an evening performance.',{radius:8}),
 o('returnSeaside','portal',91,84,'Return to West Gallery','', 'travel','','',{to:'hallWest',radius:10})
],[item('seasidePostcard',36,70,'💌','Seaside Postcard'),item('pierTicket',78,34,'🎫','Pier Admission Ticket')],{quest:{title:'Day by the Sea',targets:['pier','postcardShop','holidaymaker'],reward:'Seaside Resort Stamp'}});

hardScenes.hallEast=S('Time Hall • East Gallery','hall',{x:50,y:86},'East Gallery','A quieter wing of the Time Hall holds portals to modern and industrial-era worlds.',[
 o('peHomefront','portal',13,35,'1940s Home Front','', 'travel','','',{to:'homefront',radius:10}),
 o('peGold','portal',32,35,'1850s Gold Rush','', 'travel','','',{to:'goldrush',radius:10}),
 o('peDepression','portal',51,35,'1930s Depression Era','', 'travel','','',{to:'depression',radius:10}),
 o('peParis','portal',70,35,'Paris • 1900','', 'travel','','',{to:'paris1900',radius:10}),
 o('eastKeeper','npc',50,64,'Gallery Curator','🧑🏽‍🏫','talk','East Gallery Curator','These portals focus on rapid social, technological, and economic change in the modern era.',{radius:8}),
 o('eastBack','door',91,86,'Central Time Hall','🚪','travel','','',{to:'hall',radius:9})
],[],{passport:false});

hardScenes.hallWest=S('Time Hall • West Gallery','hall',{x:50,y:86},'West Gallery','This wing opens onto maritime, ancient, trade-route, and travel worlds.',[
 o('pwSail','portal',12,35,'Age of Sail','', 'travel','','',{to:'ageOfSail',radius:10}),
 o('pwPompeii','portal',31,35,'Pompeii • 79 CE','', 'travel','','',{to:'pompeii',radius:10}),
 o('pwViking','portal',50,35,'Viking Harbor','', 'travel','','',{to:'viking',radius:10}),
 o('pwSilk','portal',69,35,'Silk Road Oasis','', 'travel','','',{to:'silkroad',radius:10}),
 o('pwSeaside','portal',88,35,'Edwardian Seaside','', 'travel','','',{to:'seaside',radius:10}),
 o('westKeeper','npc',50,64,'Gallery Curator','🧑🏻‍🏫','talk','West Gallery Curator','These portals connect worlds shaped by travel, trade, coastlines, ancient cities, and long-distance exchange.',{radius:8}),
 o('westBack','door',91,86,'Central Time Hall','🚪','travel','','',{to:'hall',radius:9})
],[],{passport:false});

hardScenes.archive=S('Chronicle Archive','archiveInterior',{x:50,y:84},'The Chronicle Archive','A reward space for travelers who have completed multiple era objectives. Examine curated cases and speak with the archivist.',[
 o('caseOne','building',23,42,'Everyday Life Case','🗄️','inspect','Everyday Life Collection','Tickets, tools, menus, advertisements, receipts, letters, and ordinary objects can reveal how people actually lived.',{radius:10}),
 o('caseTwo','building',72,42,'Communication Case','📚','inspect','Communication Collection','From handwritten messages to print, wireless, radio, and television, communication technologies reshape how communities share information.',{radius:10}),
 o('archivist','npc',49,61,'Chronicle Archivist','🧑🏽‍🏫','talk','Chronicle Archivist','The archivist studies your passport and says the strongest historical understanding comes from comparing ordinary life across different periods.',{radius:8,choices:[
   {label:'Ask how to compare eras',flag:'archiveCompare',reply:'Start with the same human questions: How did people eat, work, travel, communicate, learn, celebrate, care for family, and respond to danger?'},
   {label:'Ask what objects can reveal',flag:'archiveObjects',reply:'Even a small object can carry evidence about technology, trade, class, taste, labor, or everyday routines.'}
 ]}),
 o('backHallArchive','door',91,84,'Return to Time Hall','🚪','travel','','',{to:'hall',radius:9})
],[item('archiveSeal',36,70,'🏅','Chronicle Archive Seal')],{passport:false,quest:{title:'Read the Archive',targets:['caseOne','caseTwo','archivist'],reward:'Chronicle Scholar Stamp'}});

hardScenes.hall.objects.push(o('eastGalleryDoor','door',7,85,'East Gallery','🚪','travel','East Gallery','',{to:'hallEast',radius:9}),o('westGalleryDoor','door',93,85,'West Gallery','🚪','travel','West Gallery','',{to:'hallWest',radius:9}));
const scenes=hardScenes;

/* --- PAYROLL MYSTERY CHAIN + LOCKED PROGRESSION --- */
const findObj=(scene,id)=>scenes[scene]?.objects.find(x=>x.id===id);
scenes.hall.objects.push(o('archivePortal','portal',91,79,'Chronicle Archive','', 'travel','Chronicle Archive','',{to:'archive',radius:10,unlockCount:3,lockedLabel:'🔒 Chronicle Archive'}));
const westReporter=findObj('west','reporter');
if(westReporter)westReporter.choices=[
 {label:'Ask about the missing payroll box',flag:'westPayrollLead',reply:'The reporter says the payroll box was last seen near the sheriff’s office just before the delayed stagecoach arrived.'},
 {label:'Ask about the delayed stagecoach',flag:'westStagecoach',reply:'The stagecoach arrived late, dusty, and missing one piece of freight paperwork.'}
];
const westSheriff=findObj('west','sheriff');
if(westSheriff)westSheriff.choices=[
 {label:'Mention the payroll box',requires:'westPayrollLead',flag:'westSheriffClue',reply:'The sheriff remembers a witness seeing someone carry a heavy wooden box toward the saloon alley.'}
];
const westBarkeep=findObj('westSaloon','barkeep');
if(westBarkeep)westBarkeep.choices=[
 {label:'Ask about the saloon alley',requires:'westSheriffClue',flag:'westSaloonClue',reply:'The barkeep saw a stagehand hide something behind the notice board, then leave before sunset.'}
];

/* --- LIVING WORLD ROUTINES + SPECIAL EVENTS --- */
const npcRoutines={
 'victorian:newsboy':[{x:34,y:58},{x:47,y:61},{x:61,y:64},{x:27,y:66}],
 'fifties:student':[{x:30,y:60},{x:46,y:62},{x:67,y:60},{x:72,y:70}],
 'roaring:photographer':[{x:31,y:60},{x:48,y:61},{x:66,y:58},{x:39,y:68}],
 'apollo:engineer':[{x:33,y:61},{x:47,y:62},{x:65,y:59},{x:56,y:67}],
 'west:reporter':[{x:30,y:60},{x:46,y:62},{x:61,y:59},{x:70,y:67}],
 'rome:vendor':[{x:30,y:62},{x:47,y:62},{x:62,y:60},{x:37,y:69}]
};
const timedExtras={
 'west:1':[o('stagecoachEvent','prop',60,43,'Stagecoach Arrival','🚌','inspect','Stagecoach Arrival','A late stagecoach rolls into town, bringing passengers, freight, and fresh news from the road.',{radius:8})],
 'west:2':[o('saloonMusicEvent','prop',27,34,'Evening Music','🎶','inspect','Evening Music','Music begins drifting onto Main Street as the evening crowd gathers.',{radius:7})],
 'victorian:2':[o('gaslampsEvent','prop',61,35,'Gas Lamps Lit','🏮','inspect','Gas Lamps','Lamp lighting changes the street after sunset, extending evening business and entertainment.',{radius:7})],
 'victorian:3':[o('nightCabEvent','prop',34,66,'Late Cab','🚕','inspect','Late Cab','A horse-drawn cab waits for theater patrons and late travelers.',{radius:7})],
 'roaring:3':[o('nightCrowdEvent','prop',60,67,'Night Crowd','💃🏽','inspect','Night Crowd','The nightlife district grows louder as music, taxis, performers, and patrons converge.',{radius:7})],
 'apollo:3':[o('nightShiftEvent','prop',65,38,'Night Shift','🌙','inspect','Night Shift','Mission operations continue through the night; spaceflight does not follow ordinary office hours.',{radius:7})],
 'fifties:2':[o('movieCrowdEvent','prop',61,66,'Movie Crowd','🎬','inspect','Evening Movie Crowd','Families and teenagers gather near the cinema before the evening show.',{radius:7})]
};
function sceneObjectsForTime(sceneKey,s){
 const base=s.objects.map(obj=>({...obj}));
 for(const obj of base){
   const routine=npcRoutines[sceneKey+':'+obj.id];
   if(routine&&routine[state.timeIndex]){obj.x=routine[state.timeIndex].x;obj.y=routine[state.timeIndex].y}
 }
 return base.concat(timedExtras[sceneKey+':'+state.timeIndex]||[]);
}


const romeVendor=findObj('rome','vendor');
if(romeVendor)romeVendor.choices=[
 {label:'Ask why the fountain line is so long',flag:'romeWaterLead',reply:'The vendor says water pressure seems weaker than usual and sends you toward the baths, where attendants noticed the same change.'}
];
const bathAttendant=findObj('romeBaths','attendant');
if(bathAttendant)bathAttendant.choices=[
 {label:'Ask about the weak water flow',requires:'romeWaterLead',flag:'romeBathLead',reply:'The attendant says one heated room is receiving water normally, but a nearby channel is running low. The forum has a public notice about maintenance.'}
];
const forumCitizen=findObj('romeForum','citizen');
if(forumCitizen)forumCitizen.choices=[
 {label:'Ask about the water notice',requires:'romeBathLead',flag:'romeWaterSolved',reply:'The resident points to a maintenance notice explaining that workers are diverting flow while repairing part of the local distribution system. Mystery solved.'}
];

const renMerchant=findObj('renaissance','merchant');
if(renMerchant)renMerchant.choices=[
 {label:'Ask why two broadsides disagree',flag:'renPrintLead',reply:'The merchant has seen two printed notices with different dates and asks which one is correct.'}
];
const renApprentice=findObj('renaissancePrint','apprentice');
if(renApprentice)renApprentice.choices=[
 {label:'Ask about the mismatched broadsides',requires:'renPrintLead',flag:'renTypeLead',reply:'The apprentice admits an old line of type was reused by mistake before the correction reached the press.'}
];
const renMaster=findObj('renaissanceAtelier','master');
if(renMaster)renMaster.choices=[
 {label:'Ask how the corrected notice was identified',requires:'renTypeLead',flag:'renPrintSolved',reply:'The workshop master recognizes the newer printer’s mark and paper stock, confirming which broadside is the corrected edition.'}
];

const westBoard=findObj('westSaloon','board');
if(westBoard)westBoard.choices=[
 {label:'Search behind the notice board',requires:'westSaloonClue',flag:'westPayrollSolved',reply:'Behind the board you find the missing payroll box wrapped in canvas. Mystery solved.'}
];

let state=store.get('htp-playable-v2',null)||store.get('htp-playable-v1',null)||{scene:'hall',x:50,y:90,visited:['hall'],discoveries:[],keepsakes:[],journal:[],quests:{},flags:{},timeIndex:1,events:[]};
state.dialogues=state.dialogues||{};state.visited=Array.isArray(state.visited)?state.visited:['hall'];state.discoveries=Array.isArray(state.discoveries)?state.discoveries:[];state.keepsakes=Array.isArray(state.keepsakes)?state.keepsakes:[];state.journal=Array.isArray(state.journal)?state.journal:[];state.quests=state.quests||{};state.flags=state.flags||{};state.events=Array.isArray(state.events)?state.events:[];state.timeIndex=Number.isInteger(state.timeIndex)?state.timeIndex:1;
if(!scenes[state.scene]){state.scene='hall';state.x=50;state.y=90}
const questCard=document.createElement('div');questCard.className='quest-card';questCard.innerHTML='<p class="mini-kicker">ERA OBJECTIVE</p><h2 id="questTitle">Explore freely</h2><div id="questProgress">No required objective in the Time Hall.</div><div class="quest-meter"><i id="questFill"></i></div>';side.insertBefore(questCard,side.children[1]||null);
const questTitle=$('#questTitle'),questProgress=$('#questProgress'),questFill=$('#questFill');

const chainCard=document.createElement('div');chainCard.className='chain-card';chainCard.innerHTML='<p class="mini-kicker">STORY THREAD</p><h2 id="chainTitle">No active thread</h2><div id="chainProgress">Explore and talk to people to uncover longer stories.</div>';side.insertBefore(chainCard,side.children[2]||null);
const chainTitle=$('#chainTitle'),chainProgress=$('#chainProgress');
const eventBanner=document.createElement('div');eventBanner.className='world-event';eventBanner.setAttribute('role','status');stage.appendChild(eventBanner);
const timeLabel=$('#gameTimeOfDay'),timeBtn=$('#timeShiftBtn');


const sceneryLayer=document.createElement('div');sceneryLayer.className='scenery-layer';backdrop.insertAdjacentElement('afterend',sceneryLayer);
const fxLayer=document.createElement('div');fxLayer.className='fx-layer';sceneryLayer.insertAdjacentElement('afterend',fxLayer);
function renderScenery(cls){
 const templates={
  hall:'<div class="arch a1"></div><div class="arch a2"></div><div class="arch a3"></div><div class="floor-lines"></div>',
  homefront:'<div class="homefront-scene"><i class="rowhouse h1"></i><i class="rowhouse h2"></i><i class="factory"></i><i class="radio-tower"></i></div>',
  goldrush:'<div class="goldrush-scene"><i class="shop s1"></i><i class="shop s2"></i><i class="mountain"></i><i class="sluice"></i></div>',
  depression:'<div class="depression-scene"><i class="store"></i><i class="job-board"></i><i class="kitchen-sign"></i></div>',
  paris1900:'<div class="paris-scene"><i class="facade f1"></i><i class="facade f2"></i><i class="metro-sign"></i><i class="lamp"></i></div>',
  ageOfSail:'<div class="sail-scene"><i class="ship"></i><i class="mast m1"></i><i class="mast m2"></i><i class="dock"></i></div>',
  pompeii:'<div class="pompeii-scene"><i class="vesuvius"></i><i class="villa v1"></i><i class="villa v2"></i><i class="road"></i></div>',
  viking:'<div class="viking-scene"><i class="longhouse"></i><i class="ship"></i><i class="water"></i></div>',
  silkroad:'<div class="silkroad-scene"><i class="caravanserai"></i><i class="dune d1"></i><i class="dune d2"></i><i class="palms"></i></div>',
  seaside:'<div class="seaside-scene"><i class="pier"></i><i class="sea"></i><i class="wheel"></i><i class="hotel"></i></div>',
  titanic:'<div class="ship-deck"><i class="rail r1"></i><i class="rail r2"></i><i class="funnel"></i><i class="deckhouse"></i></div>',
  titanicDining:'<div class="dining-room"><i class="table dt1"></i><i class="table dt2"></i><i class="table dt3"></i><i class="chandelier"></i><i class="service-board"></i></div>',
  titanicInterior:'<div class="grand-interior"><i class="panel p1"></i><i class="panel p2"></i><i class="stairs s1"></i><i class="stairs s2"></i><i class="lamp l1"></i><i class="lamp l2"></i></div>',
  west:'<div class="western-row"><i class="facade f1"></i><i class="facade f2"></i><i class="facade f3"></i><i class="awning aw1"></i><i class="hitch"></i></div>',
  westInterior:'<div class="saloon-room"><i class="bar"></i><i class="mirror"></i><i class="table t1"></i><i class="table t2"></i><i class="lamp"></i></div>',
  egyptWorkshop:'<div class="egypt-workshop"><i class="loom"></i><i class="pottery"></i><i class="shelf"></i><i class="window"></i></div>',
  egypt:'<div class="egypt-scene"><i class="pyramid py1"></i><i class="pyramid py2"></i><i class="river"></i><i class="palm pm1"></i><i class="palm pm2"></i></div>',
  medieval:'<div class="medieval-scene"><i class="wall"></i><i class="tower tw1"></i><i class="tower tw2"></i><i class="gatehouse"></i><i class="cottage c1"></i><i class="cottage c2"></i></div>',
  medievalKitchen:'<div class="medieval-kitchen"><i class="hearth"></i><i class="prep"></i><i class="shelf"></i><i class="pot p1"></i><i class="pot p2"></i></div>',
  castleInterior:'<div class="castle-room"><i class="column c1"></i><i class="column c2"></i><i class="banner b1"></i><i class="banner b2"></i><i class="hearth"></i></div>',
  victorian:'<div class="victorian-row"><i class="building b1"></i><i class="building b2"></i><i class="building b3"></i><i class="lamp-post lp1"></i><i class="lamp-post lp2"></i></div>',
  victorianInterior:'<div class="press-room"><i class="desk d1"></i><i class="desk d2"></i><i class="press"></i><i class="paper-stack"></i></div>',
  theatreInterior:'<div class="theatre-room"><i class="curtain left"></i><i class="curtain right"></i><i class="stage-floor"></i><i class="footlights"></i></div>',
  stationInterior:'<div class="station-room"><i class="platform"></i><i class="clock"></i><i class="window w1"></i><i class="window w2"></i><i class="track"></i></div>',
  fifties:'<div class="mainstreet50"><i class="store s1"></i><i class="store s2"></i><i class="store s3"></i><i class="neon n1"></i><i class="neon n2"></i></div>',
  cinemaInterior:'<div class="cinema-room"><i class="screen"></i><i class="seatrow r1"></i><i class="seatrow r2"></i><i class="curtain c1"></i><i class="curtain c2"></i></div>',
  dinerInterior:'<div class="diner-room"><i class="counter"></i><i class="stool st1"></i><i class="stool st2"></i><i class="stool st3"></i><i class="neon"></i></div>',
  recordInterior:'<div class="record-room"><i class="shelf sh1"></i><i class="shelf sh2"></i><i class="booth"></i><i class="record-display"></i></div>',
  roaring:'<div class="city20"><i class="building b1"></i><i class="building b2"></i><i class="marquee"></i><i class="streetlamp"></i></div>',
  jazzInterior:'<div class="jazz-room"><i class="stage"></i><i class="spotlight"></i><i class="table t1"></i><i class="table t2"></i></div>',
  radioInterior:'<div class="radio-room"><i class="booth"></i><i class="console"></i><i class="onair"></i><i class="mic-stand"></i></div>',
  apollo:'<div class="apollo-yard"><i class="hangar"></i><i class="antenna"></i><i class="tower"></i></div>',
  apolloInterior:'<div class="mission-room"><i class="console c1"></i><i class="console c2"></i><i class="console c3"></i><i class="screen s1"></i><i class="screen s2"></i></div>',
  engineeringInterior:'<div class="engineering-room"><i class="bench"></i><i class="rack r1"></i><i class="rack r2"></i><i class="schematic"></i></div>',
  watchInterior:'<div class="living-room69"><i class="sofa"></i><i class="tv"></i><i class="lamp"></i><i class="rug"></i></div>',
  rome:'<div class="roman-street"><i class="column c1"></i><i class="column c2"></i><i class="arch"></i><i class="stall"></i></div>',
  romeForum:'<div class="forum-scene"><i class="temple"></i><i class="column c1"></i><i class="column c2"></i><i class="column c3"></i><i class="steps"></i></div>',
  romeBaths:'<div class="bath-scene"><i class="pool"></i><i class="arch a1"></i><i class="arch a2"></i><i class="steam st1"></i><i class="steam st2"></i></div>',
  renaissance:'<div class="renaissance-street"><i class="palazzo p1"></i><i class="palazzo p2"></i><i class="archway"></i><i class="fountain"></i></div>',
  printInterior:'<div class="print-room"><i class="press"></i><i class="case c1"></i><i class="case c2"></i><i class="paper"></i></div>',
  atelierInterior:'<div class="atelier-room"><i class="easel"></i><i class="canvas"></i><i class="table"></i><i class="window"></i></div>',
  revolution:'<div class="colonial-street"><i class="house h1"></i><i class="house h2"></i><i class="shop"></i><i class="sign"></i></div>',
  revPrintInterior:'<div class="colonial-print"><i class="press"></i><i class="typecase"></i><i class="broadsides"></i></div>',
  revTavernInterior:'<div class="tavern-room"><i class="hearth"></i><i class="table t1"></i><i class="table t2"></i><i class="beam"></i></div>',
  archiveInterior:'<div class="archive-room"><i class="shelf s1"></i><i class="shelf s2"></i><i class="case c1"></i><i class="case c2"></i><i class="desk"></i></div>'
 };
 sceneryLayer.innerHTML=templates[cls]||'<div class="generic-scenery"><i></i><i></i><i></i></div>';
}
function renderFx(){
 fxLayer.innerHTML='';const t=times[state.timeIndex%times.length];
 const count=t==='Night'?16:8;
 for(let i=0;i<count;i++){const p=document.createElement('i');p.className='world-particle p'+(i%4);p.style.left=((i*37+13)%97)+'%';p.style.top=(12+((i*29)%72))+'%';p.style.animationDelay=(-i*.7)+'s';fxLayer.appendChild(p)}
}

const transitionCurtain=document.createElement('div');transitionCurtain.className='scene-transition';transitionCurtain.setAttribute('aria-hidden','true');stage.appendChild(transitionCurtain);
let walkRaf=0,walkTarget=null;
function stopAutoWalk(){walkTarget=null;if(walkRaf){cancelAnimationFrame(walkRaf);walkRaf=0}traveler.classList.remove('walking')}
function autoWalkTick(){
 if(!walkTarget){walkRaf=0;traveler.classList.remove('walking');return}
 const dx=walkTarget.x-state.x,dy=walkTarget.y-state.y,d=Math.hypot(dx,dy);
 if(d<1.2){moveTo(walkTarget.x,walkTarget.y);stopAutoWalk();return}
 const speed=1.15;moveTo(state.x+dx/d*speed,state.y+dy/d*speed);traveler.classList.add('walking');walkRaf=requestAnimationFrame(autoWalkTick)
}
function walkTo(x,y){stopAutoWalk();const tx=clamp(x,4,96),ty=clamp(y,14,93);traveler.dataset.dir=Math.abs(tx-state.x)>Math.abs(ty-state.y)?(tx<state.x?'left':'right'):(ty<state.y?'up':'down');walkTarget={x:tx,y:ty};walkRaf=requestAnimationFrame(autoWalkTick)}
function playSceneTransition(){
 transitionCurtain.classList.remove('active');void transitionCurtain.offsetWidth;transitionCurtain.classList.add('active');setTimeout(()=>transitionCurtain.classList.remove('active'),620)
}

const times=['Morning','Afternoon','Evening','Night'];



const npcGreetingMap={
 reporter:'I may have a story worth following.',steward:'Good day. Mind the passageways.',diningSteward:'We are preparing for service.',
 herbalist:'The garden changes with every season.',cook:'Careful near the hearth.',newsboy:'Latest edition! Fresh headlines!',student:'I’m headed downtown after school.',
 photographer:'Hold still—this street changes every minute.',engineer:'We are checking a systems report.',controller:'Keep your questions concise; the room is busy.',
 vendor:'Fresh food—while it lasts!',merchant:'Trade brings the whole city through this square.',messenger:'News travels slower than rumor.',
 artisan:'Mind the tools. We are working today.',usher:'Tickets ready, please.',archivist:'Your passport tells quite a story.'
};
const patrolNpcIds=new Set(['reporter','newsboy','student','photographer','engineer','vendor','messenger','artisan','usher']);
function greetingFor(obj){return npcGreetingMap[obj.id]||('Hello from '+obj.label+'.')}
function faceNpcTowardTraveler(obj){
 const el=objects.querySelector('[data-object-id="'+obj.id+'"] .npc-figure');if(!el)return;
 el.classList.toggle('face-left',state.x<obj.x);el.classList.toggle('face-right',state.x>=obj.x)
}
function showNpcBubble(obj){
 const host=objects.querySelector('[data-object-id="'+obj.id+'"]');if(!host||host.querySelector('.npc-speech'))return;
 const b=document.createElement('span');b.className='npc-speech';b.textContent=greetingFor(obj);host.appendChild(b)
}
function clearNpcBubbles(){objects.querySelectorAll('.npc-speech').forEach(el=>el.remove())}


const npcConversationProfiles={
 steward:{
  intro:{Morning:'Morning. We are already well into the day’s preparations.',Afternoon:'Good afternoon. The deck is busy, but I can spare a moment.',Evening:'Evening. Dinner and passenger service keep everyone moving.',Night:'It is quieter now, though the ship never truly sleeps.'},
  topics:[
   {id:'work',label:'What does your job involve?',reply:'More than carrying messages. We help passengers find their way, prepare rooms, answer requests, move luggage, coordinate meals, and keep routines running on time.',
    follow:[{label:'What is hardest about it?',reply:'The ship is enormous, passengers expect quick answers, and every class of accommodation has its own routines. You learn the corridors very quickly.'},{label:'Do you ever get a quiet moment?',reply:'A few. Usually between rushes, and never for very long.'}]},
   {id:'shipLife',label:'What is daily life like aboard?',reply:'For passengers it can feel elegant or exciting. For crew it is schedules, service, cleaning, food, watches, messages, maintenance, and thousands of small jobs that must happen whether anyone notices or not.',
    follow:[{label:'Where should I look next?',reply:'Walk the promenade, look at the lifeboat stations, visit the wireless room, and notice how different spaces serve different groups aboard.'}]}
  ]
 },
 reporter:{
  intro:{Morning:'You are early. Good. The best stories start before everyone else notices them.',Afternoon:'I have three leads and only one pair of feet.',Evening:'If I do not file something soon, the editor will have my hide.',Night:'The street is quieter, but rumors usually get louder after dark.'},
  topics:[
   {id:'reporting',label:'How do you decide what is news?',reply:'I look for what changed, who is affected, whether the story can be checked, and whether anyone is trying too hard to make me believe one version.',
    follow:[{label:'How do you check a rumor?',reply:'Find another source who did not hear it from the first one. Then look for records, witnesses, times, places, and details that agree.'},{label:'What makes a bad source?',reply:'Someone who cannot say how they know, changes the story when pressed, or benefits from you printing it without checking.'}]},
   {id:'town',label:'What is happening around town?',reply:'The stagecoach was late, the payroll box is missing, and two ranchers are arguing over a fence line. Any one of those could become tomorrow’s headline.'}
  ]
 },
 herbalist:{
  intro:{Morning:'Morning is the best time to see what survived the night.',Afternoon:'The garden smells strongest in the sun.',Evening:'I am bringing the tender plants in before the air cools.',Night:'At night I listen more than I harvest.'},
  topics:[
   {id:'garden',label:'What do you grow here?',reply:'Kitchen herbs, useful plants, flowers, and whatever the soil agrees to support. Some are for food, some for scent, some for household use.',
    follow:[{label:'How do you know what is useful?',reply:'Observation, habit, local knowledge, and experience passed from one person to another. That does not mean every old remedy worked.'}]},
   {id:'village',label:'What does the village need most?',reply:'Reliable food, clean water, fuel, healthy animals, repaired tools, and people willing to help each other when one household has a bad season.'}
  ]
 },
 newsboy:{
  intro:{Morning:'Morning edition! You are just in time.',Afternoon:'Afternoon extra! New headline!',Evening:'Last crowd before the theater doors open.',Night:'Not many papers left now. Just the late edition.'},
  topics:[
   {id:'headlines',label:'Which story is everyone talking about?',reply:'The delayed train. Half the street has a different explanation for why it is late.',
    follow:[{label:'Which explanation do you believe?',reply:'I sell papers. Believing comes after the reporter checks it.'}]},
   {id:'job',label:'What is it like selling papers?',reply:'You need a strong voice, quick change, good shoes, and a sense for which corner has the biggest crowd.'}
  ]
 },
 student:{
  intro:{Morning:'I should probably be in class soon.',Afternoon:'School is out. Now the whole street feels different.',Evening:'We are deciding between the diner and the movie house.',Night:'My family expects me home before too much longer.'},
  topics:[
   {id:'music',label:'What music are people your age listening to?',reply:'Whatever the radio plays that our parents complain about—and plenty they like too. The record shop is where everyone argues about favorites.',
    follow:[{label:'Do records matter that much?',reply:'They are something you can own, replay, trade, lend, and talk about. A song becomes part of your room instead of disappearing after the radio broadcast.'}]},
   {id:'weekend',label:'What do you do on weekends?',reply:'Movies, records, school events, church, sports, visiting friends, helping at home. Depends on the family and the neighborhood.'}
  ]
 },
 photographer:{
  intro:{Morning:'The light is soft. Best hour for storefronts.',Afternoon:'The street will not hold still for me today.',Evening:'Electric signs make a different city after sunset.',Night:'Long exposures. Fewer people willing to stand still.'},
  topics:[
   {id:'camera',label:'What are you photographing?',reply:'The city changing—cars, clothes, signs, shop windows, crowds. Ordinary scenes become historical evidence before anyone realizes it.',
    follow:[{label:'What makes a good photograph?',reply:'Timing, light, framing, and knowing what story is hiding inside an ordinary moment.'}]},
   {id:'change',label:'What has changed fastest?',reply:'The pace. Radio, cars, advertising, recorded music, new buildings—everything seems to be competing to move faster.'}
  ]
 },
 engineer:{
  intro:{Morning:'We are reviewing the overnight reports.',Afternoon:'The consoles have been busy all day.',Evening:'The public sees a broadcast. We see hundreds of systems that must agree.',Night:'Night shift. Spaceflight does not care what time it is.'},
  topics:[
   {id:'systems',label:'How do you keep track of so many systems?',reply:'Specialization and communication. Nobody knows every detail alone. Each team watches its area and reports clearly when something changes.',
    follow:[{label:'What happens if two readings disagree?',reply:'You compare sensors, trends, procedures, and independent evidence before deciding whether the spacecraft changed or the measurement did.'}]},
   {id:'pressure',label:'How do people stay calm here?',reply:'Training. Procedures. Rehearsal. Clear roles. You prepare for trouble before trouble arrives.'}
  ]
 },
 controller:{
  intro:{Morning:'Morning shift. Procedures are already open.',Afternoon:'Keep it concise; several loops are active.',Evening:'We are watching the mission and the clock.',Night:'The room is still bright. Outside barely matters in here.'},
  topics:[
   {id:'control',label:'What does a flight controller actually do?',reply:'Monitor one part of the mission, recognize changes, communicate them, recommend action, and coordinate with the rest of the room.',
    follow:[{label:'Can one controller stop a mission?',reply:'Critical decisions follow defined authority and team procedures. Good information moves upward quickly; nobody should hide a dangerous reading.'}]}
  ]
 },
 vendor:{
  intro:{Morning:'Fresh food. Best selection of the day.',Afternoon:'Busy hour. Keep to the side of the stall.',Evening:'I am counting what is left before closing.',Night:'No stall tonight. Tomorrow begins early.'},
  topics:[
   {id:'food',label:'What do people eat in this city?',reply:'Bread, grains, legumes, vegetables, fruit, sauces, wine, fish or meat when available—different households eat very differently depending on money and circumstance.',
    follow:[{label:'Do most people cook at home?',reply:'Some do, but cramped housing and fire risk make prepared food shops important for many urban residents.'}]},
   {id:'prices',label:'What makes prices change?',reply:'Supply, harvests, transport, demand, taxes, shortages, distance, and sometimes simple opportunism.'}
  ]
 },
 merchant:{
  intro:{Morning:'Morning brings the serious buyers.',Afternoon:'Now the square is noisy enough to hide a bargain.',Evening:'Time to count cloth and coin.',Night:'Trade sleeps eventually. Ledgers do not.'},
  topics:[
   {id:'trade',label:'Where do your goods come from?',reply:'Not one place. Cloth, dyes, fibers, metal goods, paper, spices, and luxury items move through overlapping networks of merchants and ports.',
    follow:[{label:'How do you trust distant sellers?',reply:'Reputation, letters, family connections, agents, contracts, repeated business—and sometimes expensive mistakes.'}]},
   {id:'customers',label:'Who buys fine cloth?',reply:'Households with money, institutions, guilds, courts, clergy, merchants, and craftspeople. Clothing can advertise status before anyone speaks.'}
  ]
 },
 messenger:{
  intro:{Morning:'Morning roads are best if the weather holds.',Afternoon:'I have already crossed half the city twice.',Evening:'One more delivery before I stop.',Night:'At night every rumor seems urgent.'},
  topics:[
   {id:'news',label:'How does news travel?',reply:'Letters, riders, ships, newspapers, travelers, taverns, official notices, merchants, soldiers, and gossip—all at different speeds.',
    follow:[{label:'How do you know what is true?',reply:'You often do not at first. Time, independent reports, named sources, and written records help separate news from rumor.'}]}
  ]
 },
 artisan:{
  intro:{Morning:'Morning is for the work that needs steady hands.',Afternoon:'We are in the middle of several orders.',Evening:'I am cleaning tools before dark.',Night:'The workshop rests. Tomorrow the orders remain.'},
  topics:[
   {id:'craft',label:'How did you learn this craft?',reply:'Watching, copying, correcting mistakes, repeating the same motions, learning materials, and working beside people who know more than I do.',
    follow:[{label:'How long does that take?',reply:'Long enough that you stop counting. Skill grows through thousands of small corrections.'}]},
   {id:'customers',label:'What do customers ask for?',reply:'Useful things first: containers, cloth, repairs, tools, household goods. Fine decoration comes after function for most people.'}
  ]
 },
 usher:{
  intro:{Morning:'No show yet. We are cleaning and checking the house.',Afternoon:'The matinee crowd will arrive soon.',Evening:'Tickets ready, please. The feature starts shortly.',Night:'Last show is nearly over.'},
  topics:[
   {id:'cinema',label:'What happens before a movie starts?',reply:'Ticket sales, lobby cleanup, concessions, projector checks, film handling, seating, lights, doors, and making sure the audience ends up in the right auditorium.',
    follow:[{label:'What if the film breaks?',reply:'The projectionist stops, repairs or resplices the film, and everyone waits—usually not very patiently.'}]}
  ]
 },
 archivist:{
  intro:{Morning:'A quiet hour. Good for careful reading.',Afternoon:'Your passport is becoming interesting.',Evening:'The archive feels different when the hall grows quiet.',Night:'Only serious travelers reach the archive this late.'},
  topics:[
   {id:'history',label:'How should I think about all these eras?',reply:'Do not memorize a parade of dates. Compare human problems across time: food, work, family, belief, communication, travel, power, danger, leisure, and change.',
    follow:[{label:'What should I pay attention to?',reply:'Who had choices, who did the work, who was excluded, what technology made possible, and what ordinary people considered normal.'}]},
   {id:'evidence',label:'What counts as historical evidence?',reply:'Objects, buildings, letters, newspapers, photographs, government records, oral accounts, art, archaeology, financial records, and much more—each with limits.',
    follow:[{label:'Can evidence disagree?',reply:'Frequently. Historians compare sources, context, authorship, purpose, timing, and independent corroboration rather than expecting every source to match.'}]}
  ]
 }
};
const genericConversationTopics=[
 {id:'daily',label:'What is your day like?',reply:(obj)=>'Most of my day is ordinary work: responsibilities, interruptions, meals, errands, conversations, and whatever this place demands. History rarely feels historic while you are living it.',
  follow:[{label:'What takes most of your time?',reply:'Work and practical needs. The exact tasks change by place and era, but ordinary life always takes more effort than later stories usually show.'}]},
 {id:'place',label:'What should I notice around here?',reply:(obj)=>'Notice the tools, buildings, clothing, sounds, transport, food, and who is doing which kind of work. Those details tell you as much as the famous events.',
  follow:[{label:'What do visitors usually miss?',reply:'The background labor. Someone maintains the fire, carries the water, prepares the food, cleans the rooms, moves the goods, keeps the records, or repairs the equipment.'}]},
 {id:'people',label:'What are people talking about today?',reply:(obj)=>'Work, prices, family, weather, local news, travel, illness, entertainment, and rumors. People in the past worried about tomorrow just as much as people do now.'}
];
function conversationKey(obj){return state.scene+':'+obj.id}
function conversationMemory(obj){state.dialogues=state.dialogues||{};return state.dialogues[conversationKey(obj)]||(state.dialogues[conversationKey(obj)]={topics:[],turns:0})}
function profileFor(obj){return npcConversationProfiles[obj.id]||null}
function resolveReply(reply,obj){return typeof reply==='function'?reply(obj):reply}
function conversationIntro(obj){
 const p=profileFor(obj),t=times[state.timeIndex%times.length],mem=conversationMemory(obj);
 if(mem.turns>0)return 'Good to see you again. '+(p?.intro?.[t]||greetingFor(obj));
 return p?.intro?.[t]||greetingFor(obj)
}
function topicPool(obj){
 const p=profileFor(obj);const quest=Array.isArray(obj.choices)?obj.choices.filter(ch=>(!ch.requires||state.flags[ch.requires])&&(!ch.flag||!state.flags[ch.flag])).map((ch,i)=>({id:'quest:'+i,label:ch.label,reply:ch.reply,flag:ch.flag,requires:ch.requires,quest:true})):[];
 return [...quest,...(p?.topics||[]),...genericConversationTopics]
}
function renderConversation(obj,transcript=[],followUps=[]){
 const mem=conversationMemory(obj),topics=topicPool(obj).filter(t=>!mem.topics.includes(t.id)).slice(0,6);
 const options=[...followUps.map((f,i)=>({...f,id:'follow:'+i,follow:true})),...topics].slice(0,7);
 const memoryHtml=mem.turns>0?'<p class="npc-memory">💭 '+obj.label+' remembers '+mem.turns+' earlier exchange'+(mem.turns===1?'':'s')+' with you.</p>':'';
 const transcriptHtml=transcript.length?'<div class="dialogue-transcript">'+transcript.map(t=>'<div class="dialogue-line '+t.who+'"><b>'+(t.who==='you'?'You':obj.label)+'</b><p>'+t.text+'</p></div>').join('')+'</div>':'';
 dialogContent.innerHTML='<p class="mini-kicker">'+scenes[state.scene].name+'</p><h2>'+obj.title+'</h2>'+memoryHtml+transcriptHtml+'<div class="dialogue-prompt">'+(transcript.length?'What would you like to ask next?':conversationIntro(obj))+'</div><div class="dialogue-options">'+options.map((t,i)=>'<button type="button" data-talk-option="'+i+'">'+t.label+'</button>').join('')+'<button type="button" data-talk-leave>End conversation</button></div>';
 dialogContent.querySelectorAll('[data-talk-option]').forEach(btn=>btn.addEventListener('click',()=>{
   const option=options[Number(btn.dataset.talkOption)];if(!option)return;
   if(obj.type==='npc')setNpcState(obj.id,'reacting');
   const reply=resolveReply(option.reply,obj);const nextTranscript=[...transcript,{who:'you',text:option.label},{who:'npc',text:reply}];
   mem.turns++;if(!option.follow&&!mem.topics.includes(option.id))mem.topics.push(option.id);
   if(option.flag)state.flags[option.flag]=true;save();addJournal(obj.title+' — '+option.label,reply);updateChain();renderStatus();
   setTimeout(()=>{if(obj.type==='npc')setNpcState(obj.id,'talking');renderConversation(obj,nextTranscript,option.follow||option.followUps||[])},180)
 }));
 dialogContent.querySelector('[data-talk-leave]')?.addEventListener('click',()=>dialog.close());
}
function openNpcConversation(obj){
 clearNpcBubbles();setNpcState(obj.id,'talking');
 const dKey=discoveryKey(state.scene,obj.id);if(!state.discoveries.includes(dKey)){state.discoveries.push(dKey);addJournal('Met: '+(obj.title||obj.label),obj.body||'Met while exploring.');save();showToast('New person added to your journal ✨')}
 renderConversation(obj,[],[]);dialog.showModal();renderStatus()
}

function makeNpcSprite(obj,index=0){
 const fig=document.createElement('div');fig.className='npc-figure style-'+(index%5);fig.innerHTML='<i class="npc-head"></i><i class="npc-hair"></i><i class="npc-body"></i><i class="npc-arm a1"></i><i class="npc-arm a2"></i><i class="npc-leg l1"></i><i class="npc-leg l2"></i><i class="npc-tool"></i>';
 fig.dataset.npcId=obj.id;return fig
}
function setNpcState(id,stateName){
 const el=objects.querySelector('[data-object-id="'+id+'"] .npc-figure');if(!el)return;
 el.classList.remove('talking','working','reacting');if(stateName)el.classList.add(stateName);
}
function animateDoor(id,done){
 const el=objects.querySelector('[data-object-id="'+id+'"]');if(!el){done();return}
 el.classList.add('door-opening');setTimeout(done,420)
}

function save(){store.set('htp-playable-v2',state)}
function showToast(msg){toast.textContent=msg;toast.classList.add('show');clearTimeout(showToast.t);showToast.t=setTimeout(()=>toast.classList.remove('show'),1700)}
function addJournal(title,text){if(!state.journal.some(e=>e.title===title)){state.journal.unshift({title,text,date:new Date().toLocaleDateString()});state.journal=state.journal.slice(0,60);save()}}


const achievements={
 firstStep:{title:'First Step Through Time',desc:'Visit your first historical era.',test:()=>state.visited.filter(v=>v!=='hall').length>=1},
 collector:{title:'Keeper of Keepsakes',desc:'Collect 10 historical keepsakes.',test:()=>state.keepsakes.length>=10},
 explorer:{title:'Century Hopper',desc:'Visit 12 major eras.',test:()=>state.visited.filter(v=>scenes[v]?.passport).length>=12},
 storyteller:{title:'Story Solver',desc:'Resolve at least 3 multi-step story threads.',test:()=>['westPayrollSolved','victorianMessageSolved','apolloSignalSolved','romeWaterSolved','renPrintSolved'].filter(f=>state.flags[f]).length>=3},
 scholar:{title:'Chronicle Scholar',desc:'Unlock and visit the Chronicle Archive.',test:()=>state.visited.includes('archive')||state.discoveries.some(d=>d.startsWith('archive:'))},
 quester:{title:'Era Specialist',desc:'Complete 10 era objectives.',test:()=>completedQuestCount()>=10},
 master:{title:'Historical Traveler',desc:'Reach 85% overall exploration progress.',test:()=>completionPercent()>=85},
 completionist:{title:'Keeper of the Twenty Eras',desc:'Reach 100% overall exploration progress.',test:()=>completionPercent()>=100}
};
state.achievements=state.achievements||{};
function totalDiscoverables(){return Object.values(scenes).reduce((n,s)=>n+s.objects.filter(o=>o.action!=='travel').length+s.items.length,0)}
function completionPercent(){
 const visitPart=Math.min(1,state.visited.filter(v=>scenes[v]?.passport).length/20);
 const questPart=Math.min(1,completedQuestCount()/14);
 const discoverPart=Math.min(1,(state.discoveries.length+state.keepsakes.length)/Math.max(1,totalDiscoverables()));
 return Math.round((visitPart*.35+questPart*.35+discoverPart*.30)*100)
}
function checkAchievements(){
 for(const [id,a] of Object.entries(achievements)){if(!state.achievements[id]&&a.test()){state.achievements[id]=true;addJournal('Achievement: '+a.title,a.desc);if(id==='completionist'){root.classList.add('world-complete');showToast('All twenty eras completed — Keeper of the Twenty Eras 🏆')}else showToast('Achievement unlocked: '+a.title+' 🏆')}}
 save()
}
function renderAchievements(){
 const pct=completionPercent();achievementList.innerHTML='<div class="completion-panel"><strong>'+pct+'% Complete</strong><div class="completion-bar"><i style="width:'+pct+'%"></i></div><p>'+ (pct>=85?'You have earned the Historical Traveler milestone. Keep exploring for full completion.':'Explore eras, solve stories, complete objectives, and collect keepsakes to raise your progress.') +'</p></div>'+Object.entries(achievements).map(([id,a])=>'<article class="achievement '+(state.achievements[id]?'earned':'')+'"><span>'+(state.achievements[id]?'🏆':'○')+'</span><div><b>'+a.title+'</b><small>'+a.desc+'</small></div></article>').join('')
}
let audioCtx=null,audioMaster=null,audioNodes=[],soundOn=false;
function stopAmbience(){audioNodes.forEach(n=>{try{n.stop?.()}catch{}try{n.disconnect?.()}catch{}});audioNodes=[]}
function noiseBuffer(ctx){const b=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*.22;return b}
function startAmbience(){
 if(!soundOn)return;stopAmbience();
 const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
 audioCtx=audioCtx||new AC();audioMaster=audioMaster||audioCtx.createGain();audioMaster.gain.value=.055;audioMaster.connect(audioCtx.destination);
 const cls=scenes[state.scene]?.class||state.scene;
 const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();osc.type='sine';osc.frequency.value=cls.includes('apollo')?84:cls.includes('jazz')?110:cls.includes('titanic')?72:cls.includes('medieval')?96:cls.includes('egypt')?88:100;gain.gain.value=.16;osc.connect(gain).connect(audioMaster);osc.start();audioNodes.push(osc,gain);
 const src=audioCtx.createBufferSource(),ng=audioCtx.createGain(),filter=audioCtx.createBiquadFilter();src.buffer=noiseBuffer(audioCtx);src.loop=true;filter.type='lowpass';filter.frequency.value=cls.includes('titanic')?900:cls.includes('west')?550:cls.includes('apollo')?1300:700;ng.gain.value=.22;src.connect(filter).connect(ng).connect(audioMaster);src.start();audioNodes.push(src,ng,filter);
}

function exportPlayableBackup(){
 const payload={app:'Historical Time Portal',version:2,exportedAt:new Date().toISOString(),state};
 const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='historical-time-portal-backup.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);showToast('Backup downloaded 💾')
}
function importPlayableBackup(file){
 if(!file)return;const reader=new FileReader();reader.onload=()=>{try{const data=JSON.parse(String(reader.result||''));if(!data||typeof data!=='object'||!data.state)throw new Error('Invalid backup');const s=data.state;if(!s.scene||!Array.isArray(s.visited)||!Array.isArray(s.discoveries)||!Array.isArray(s.keepsakes))throw new Error('Backup is missing required progress data');Object.assign(state,s);state.flags=state.flags||{};state.quests=state.quests||{};state.events=Array.isArray(state.events)?state.events:[];state.achievements=state.achievements||{};if(!scenes[state.scene])state.scene='hall';save();renderScene();showToast('Backup restored ✓')}catch(e){showToast('Could not restore that backup')}};reader.readAsText(file)
}

function toggleSound(){
 soundOn=!soundOn;const btn=$('#soundBtnGame');btn.setAttribute('aria-pressed',String(soundOn));btn.textContent=soundOn?'🔊 Ambience':'🔇 Ambience';if(soundOn){audioCtx?.resume?.();startAmbience()}else stopAmbience()
}

function completedQuestCount(){return Object.values(state.quests).filter(Boolean).length}
function isUnlocked(obj){return !obj.unlockCount||completedQuestCount()>=obj.unlockCount}
function applyTime(){
 const t=times[state.timeIndex%times.length];root.dataset.time=t.toLowerCase();if(timeLabel)timeLabel.textContent=t;
}
function cycleTime(){state.timeIndex=(state.timeIndex+1)%times.length;applyTime();renderFx();save();updateWorldEvent(true);showToast('Time shifted to '+times[state.timeIndex])}
const sceneEvents={
 hall:{Morning:'The Time Hall is quiet; new portals hum softly.',Afternoon:'Travelers cross the hall between centuries.',Evening:'The portal rings glow brighter as the hall darkens.',Night:'Only the portals and archive lamps illuminate the hall.'},
 titanic:{Morning:'Stewards prepare passenger spaces for the day.',Afternoon:'Passengers gather along the promenade.',Evening:'Dinner preparations and music animate the ship.',Night:'The deck is colder and quieter beneath the stars.'},
 west:{Morning:'Wagons arrive and storefronts open along Main Street.',Afternoon:'Dust hangs in the road as business reaches its busiest hour.',Evening:'Music begins to drift from the saloon.',Night:'Lanterns glow along the street and the town grows quieter.'},
 victorian:{Morning:'Delivery carts and newspaper sellers fill the street.',Afternoon:'Shops, offices, and theaters bustle with traffic.',Evening:'Gas lamps flicker on and theater crowds gather.',Night:'The street settles under pools of gaslight.'},
 fifties:{Morning:'Main Street opens with delivery trucks and breakfast crowds.',Afternoon:'Students, shoppers, and music spill onto the sidewalk.',Evening:'Neon signs and the cinema marquee brighten the street.',Night:'The diner and record shop remain the liveliest corners.'},
 roaring:{Morning:'Newspapers and delivery traffic take over the avenues.',Afternoon:'Radio studios, offices, and shops hum with activity.',Evening:'Jazz clubs prepare for the night crowd.',Night:'Music and electric signs transform the city after dark.'},
 apollo:{Morning:'Engineers review procedures and overnight reports.',Afternoon:'Mission teams monitor a steady stream of data.',Evening:'Families gather around televisions for updates.',Night:'Control rooms remain bright while much of the city sleeps.'}
};
function updateWorldEvent(force=false){
 const t=times[state.timeIndex%times.length],group=scenes[state.scene]?.class||state.scene,key=sceneEvents[group]?group:(sceneEvents[state.scene]?state.scene:null);
 const msg=key?sceneEvents[key][t]:t+' settles over '+scenes[state.scene].name+'.';
 eventBanner.textContent='✦ '+msg;eventBanner.classList.remove('show');void eventBanner.offsetWidth;eventBanner.classList.add('show');
 const eventKey=state.scene+':'+t;if(force||!state.events.includes(eventKey)){if(!state.events.includes(eventKey))state.events.push(eventKey);save()}
}
function updateChain(){
 if(state.scene==='west'||state.scene==='westSaloon'){
  chainTitle.textContent='The Missing Payroll Box';
  const steps=[
   ['westPayrollLead','Ask the reporter about the missing payroll box.'],
   ['westSheriffClue','Take the reporter’s lead to the sheriff.'],
   ['westSaloonClue','Question the barkeep about the alley.'],
   ['westPayrollSolved','Search behind the saloon notice board.']
  ];
  const next=steps.find(([flag])=>!state.flags[flag]);
  if(!next){chainProgress.textContent='Solved ✓ You recovered the missing payroll box.';chainCard.classList.add('complete')}
  else{const done=steps.filter(([flag])=>state.flags[flag]).length;chainProgress.textContent='Step '+(done+1)+' of '+steps.length+': '+next[1];chainCard.classList.remove('complete')}
 }else if(state.scene==='victorian'||state.scene==='victorianNews'||state.scene==='victorianStation'){
  chainTitle.textContent='The Missing Railway Message';
  const steps=[
   ['victorianRail','Ask the newspaper reporter about the delayed train.'],
   ['victorianStationLead','Take the story to the station master.'],
   ['victorianMessageLead','Trace the message into the theater district.'],
   ['victorianMessageSolved','Find who received the misplaced railway message.']
  ];
  const next=steps.find(([flag])=>!state.flags[flag]);
  if(!next){chainProgress.textContent='Solved ✓ You discovered why the railway message reached the newspaper late.';chainCard.classList.add('complete')}
  else{const done=steps.filter(([flag])=>state.flags[flag]).length;chainProgress.textContent='Step '+(done+1)+' of '+steps.length+': '+next[1];chainCard.classList.remove('complete')}
 }else if(state.scene==='apollo'||state.scene==='apolloControl'||state.scene==='apolloEngineering'){
  chainTitle.textContent='The Telemetry Question';
  const steps=[
   ['apolloSignalLead','Ask Mission Control about the odd telemetry reading.'],
   ['apolloBenchLead','Take the signal question to the engineering annex.'],
   ['apolloSignalSolved','Use the bench test to determine what the reading means.']
  ];
  const next=steps.find(([flag])=>!state.flags[flag]);
  if(!next){chainProgress.textContent='Solved ✓ The team traced the unusual reading to a sensor circuit.';chainCard.classList.add('complete')}
  else{const done=steps.filter(([flag])=>state.flags[flag]).length;chainProgress.textContent='Step '+(done+1)+' of '+steps.length+': '+next[1];chainCard.classList.remove('complete')}
 }else if(state.scene==='rome'||state.scene==='romeBaths'||state.scene==='romeForum'){
  chainTitle.textContent='The Weak Water Flow';
  const steps=[
   ['romeWaterLead','Ask the food vendor about the long fountain line.'],
   ['romeBathLead','Follow the water clue to the bath attendant.'],
   ['romeWaterSolved','Check the forum for the maintenance notice.']
  ];
  const next=steps.find(([flag])=>!state.flags[flag]);
  if(!next){chainProgress.textContent='Solved ✓ You traced the weak flow to a temporary maintenance diversion.';chainCard.classList.add('complete')}
  else{const done=steps.filter(([flag])=>state.flags[flag]).length;chainProgress.textContent='Step '+(done+1)+' of '+steps.length+': '+next[1];chainCard.classList.remove('complete')}
 }else if(state.scene==='renaissance'||state.scene==='renaissancePrint'||state.scene==='renaissanceAtelier'){
  chainTitle.textContent='The Conflicting Broadside';
  const steps=[
   ['renPrintLead','Ask the cloth merchant about the conflicting notices.'],
   ['renTypeLead','Investigate the print shop for a typesetting mistake.'],
   ['renPrintSolved','Confirm the corrected edition with the workshop master.']
  ];
  const next=steps.find(([flag])=>!state.flags[flag]);
  if(!next){chainProgress.textContent='Solved ✓ You identified which broadside carried the corrected information.';chainCard.classList.add('complete')}
  else{const done=steps.filter(([flag])=>state.flags[flag]).length;chainProgress.textContent='Step '+(done+1)+' of '+steps.length+': '+next[1];chainCard.classList.remove('complete')}
 }else{
  chainTitle.textContent='No active story thread';chainProgress.textContent='Explore and talk to people. Some eras contain longer stories that remember your choices.';chainCard.classList.remove('complete')
 }
}

function discoveryKey(scene,id){return scene+':'+id}
function targetDone(id){return state.discoveries.includes(discoveryKey(state.scene,id))||state.keepsakes.includes(id)}
function updateQuest(){
 const q=scenes[state.scene].quest;if(!q){questTitle.textContent='Explore freely';questProgress.textContent='No required objective here. Wander wherever you like.';questFill.style.width='0%';return}
 const done=q.targets.filter(targetDone).length,pct=Math.round(done/q.targets.length*100);questTitle.textContent=q.title;questProgress.textContent=done+' of '+q.targets.length+' discoveries complete';questFill.style.width=pct+'%';
 if(done===q.targets.length&&!state.quests[state.scene]){state.quests[state.scene]=true;addJournal('Completed: '+q.title,'Reward earned: '+q.reward+'.');save();showToast('Objective complete — '+q.reward+' ✨')}
}
function renderScene(){if(state.achievements?.completionist)root.classList.add('world-complete');
 const s=scenes[state.scene];sceneName.textContent=s.name;backdrop.className='scene-backdrop '+s.class;renderScenery(s.class);renderFx();journeyTitle.textContent=s.title;journeyText.textContent=s.text;objects.innerHTML='';labels.innerHTML='';collectibles.innerHTML='';
 const activeObjects=sceneObjectsForTime(state.scene,s);activeObjects.forEach((obj,index)=>{const unlocked=isUnlocked(obj);const el=document.createElement('div');el.className='world-object '+obj.type+(unlocked?'':' locked');el.dataset.objectId=obj.id;el.style.left=obj.x+'%';el.style.top=obj.y+'%';if(obj.type==='npc'){const fig=makeNpcSprite(obj,index);if(patrolNpcIds.has(obj.id))fig.classList.add('patrolling');el.appendChild(fig)}else if(obj.type==='door'){el.innerHTML='<span class="door-frame"><i class="door-panel"></i><i class="door-knob"></i></span>'}else if(obj.icon)el.textContent=obj.icon;objects.appendChild(el);const lab=document.createElement('div');lab.className='world-label'+(unlocked?'':' locked-label');lab.style.left=obj.x+'%';lab.style.top=(obj.y-(obj.type==='portal'?13:9))+'%';lab.textContent=unlocked?obj.label:(obj.lockedLabel||'🔒 '+obj.label);labels.appendChild(lab)});
 for(let i=0;i<3;i++){const walker=document.createElement('div');walker.className='ambient-walker w'+i;walker.style.top=(46+i*14)+'%';const fig=makeNpcSprite({id:'ambient'+i},i+2);fig.classList.add('walking');walker.appendChild(fig);objects.appendChild(walker)}
 s.items.forEach(it=>{if(state.keepsakes.includes(it.id))return;const el=document.createElement('div');el.className='collectible';el.style.left=it.x+'%';el.style.top=it.y+'%';el.textContent=it.icon;el.title=it.name;collectibles.appendChild(el)});
 if(s.passport&&!state.visited.includes(state.scene)){state.visited.push(state.scene);addJournal('Arrived: '+s.name,'You entered '+s.name+'.');save()}
 const spawn=s.spawn;moveTo(Number.isFinite(state.x)?state.x:spawn.x,Number.isFinite(state.y)?state.y:spawn.y,false);applyTime();applyNpcWorkStates();renderStatus();if(soundOn)startAmbience();updateNearby();updateChain();updateWorldEvent();showToast('Entered '+s.name)
}

const workersByScene={
 west:['reporter'],victorianNews:['reporterDesk'],victorianTheatre:['stagehand'],fiftiesDiner:['server'],fiftiesRecords:['clerk'],roaringJazz:['bandleader'],roaringRadio:['announcer'],apolloControl:['controller'],apolloEngineering:['systemsTech'],romeBaths:['attendant'],renaissancePrint:['apprentice'],renaissanceAtelier:['master'],revolutionPrint:['printer1776'],titanicDining:['diningSteward'],medievalKitchen:['cook'],egyptWorkshop:['artisan'],fiftiesCinema:['usher']
};
function applyNpcWorkStates(){
 const ids=workersByScene[state.scene]||[];ids.forEach(id=>setNpcState(id,state.timeIndex===3?'idle':'working'))
}

function renderStatus(){discoveryCount.textContent=state.discoveries.length;keepsakeCount.textContent=state.keepsakes.length;if(progressPercent)progressPercent.textContent=completionPercent()+'%';checkAchievements();passportList.innerHTML=Object.entries(scenes).filter(([,s])=>s.passport).map(([k,s])=>'<span class="passport-stamp '+(state.visited.includes(k)?'visited':'')+'">'+(state.visited.includes(k)?'✓ ':'')+s.name.split('•')[0].trim()+'</span>').join('');renderMap();updateQuest()}
function nearest(){const s=scenes[state.scene];let best=null,bestD=999;for(const obj of sceneObjectsForTime(state.scene,s)){const d=distance({x:state.x,y:state.y},obj);if(d<bestD){best=obj;bestD=d}}return best&&bestD<=(best.radius||9)?best:null}
function collectNearby(){const s=scenes[state.scene];for(const it of s.items){if(state.keepsakes.includes(it.id))continue;if(distance({x:state.x,y:state.y},it)<6){state.keepsakes.push(it.id);addJournal('Keepsake: '+it.name,'Found while exploring '+s.name+'.');save();showToast('Collected '+it.name+' ✨');renderScene();return true}}return false}
function updateNearby(){objects.querySelectorAll('.world-object.nearby').forEach(el=>el.classList.remove('nearby'));labels.querySelectorAll('.world-label.nearby').forEach(el=>el.classList.remove('nearby'));const n=nearest();if(n){clearNpcBubbles();const objEl=objects.querySelector('[data-object-id="'+n.id+'"]');if(objEl)objEl.classList.add('nearby');if(n.type==='npc'){faceNpcTowardTraveler(n);showNpcBubble(n)}const labEls=[...labels.querySelectorAll('.world-label')];const labEl=labEls.find(el=>el.textContent.includes(n.label));if(labEl)labEl.classList.add('nearby');const unlocked=isUnlocked(n);nearbyInfo.innerHTML='<b>'+(unlocked?n.label:(n.lockedLabel||'🔒 '+n.label))+'</b><br>'+(!unlocked?'Complete '+n.unlockCount+' era objectives to unlock this doorway.':(n.action==='travel'?'A doorway is within reach.':'Move close and explore.'));exploreBtn.disabled=false;hint.classList.remove('hidden');hint.textContent=!unlocked?'Locked — explore more':(n.action==='travel'?'Step through':'Press E or tap Explore')}else{clearNpcBubbles();nearbyInfo.textContent='Keep walking. Look for people, buildings, glowing portals, doors, and keepsakes.';exploreBtn.disabled=true;hint.classList.add('hidden')}}
function moveTo(x,y,check=true){state.x=clamp(x,4,96);state.y=clamp(y,14,93);traveler.style.left=state.x+'%';traveler.style.top=state.y+'%';stage.style.setProperty('--cam-x',((state.x-50)/50).toFixed(3));stage.style.setProperty('--cam-y',((state.y-54)/46).toFixed(3));if(check){if(!collectNearby()){updateNearby();updateQuest();save()}}}
function move(dx,dy){if(dx<0)traveler.dataset.dir='left';else if(dx>0)traveler.dataset.dir='right';else if(dy<0)traveler.dataset.dir='up';else if(dy>0)traveler.dataset.dir='down';moveTo(state.x+dx,state.y+dy)}
function travel(to){const target=scenes[to];if(!target)return;stopAutoWalk();playSceneTransition();setTimeout(()=>{state.scene=to;state.x=target.spawn.x;state.y=target.spawn.y;save();renderScene()},180)}
function interact(){const obj=nearest();if(!obj)return;if(!isUnlocked(obj)){showToast('Archive locked — complete '+obj.unlockCount+' era objectives');return}if(obj.action==='travel'){if(obj.type==='door'){animateDoor(obj.id,()=>travel(obj.to))}else{travel(obj.to)}return}
 if(obj.type==='npc'){openNpcConversation(obj);return}const dKey=discoveryKey(state.scene,obj.id);if(!state.discoveries.includes(dKey)){state.discoveries.push(dKey);addJournal(obj.title||obj.label,obj.body||'Discovered while exploring.');save();showToast('New discovery added ✨')}
 const availableChoices=Array.isArray(obj.choices)?obj.choices.filter(ch=>(!ch.requires||state.flags[ch.requires])&&(!ch.flag||!state.flags[ch.flag])):[];const remembered=Array.isArray(obj.choices)&&obj.choices.some(ch=>ch.flag&&state.flags[ch.flag]);const choiceHtml=availableChoices.map((ch,i)=>'<button type="button" data-choice="'+i+'">'+ch.label+'</button>').join('');const memoryHtml=remembered?'<p class="npc-memory">💭 This person remembers your earlier conversation.</p>':'';dialogContent.innerHTML='<p class="mini-kicker">'+scenes[state.scene].name+'</p><h2>'+obj.title+'</h2><p>'+obj.body+'</p>'+memoryHtml+'<div id="choiceReply"></div><div class="dialog-actions">'+choiceHtml+'<button type="button" id="rememberBtn">Journal this discovery ✓</button></div>';dialog.showModal();dialogContent.querySelectorAll('[data-choice]').forEach(btn=>btn.addEventListener('click',()=>{const ch=availableChoices[Number(btn.dataset.choice)];if(obj.type==='npc')setNpcState(obj.id,'reacting');state.flags=state.flags||{};if(ch.flag)state.flags[ch.flag]=true;save();const reply=dialogContent.querySelector('#choiceReply');reply.innerHTML='<p class="choice-reply">'+ch.reply+'</p>';addJournal(obj.title+' — '+ch.label,ch.reply);updateChain();renderStatus();showToast(ch.flag==='westPayrollSolved'?'Payroll mystery solved! ✨':'Conversation remembered')}));const remember=dialogContent.querySelector('#rememberBtn');if(remember)remember.addEventListener('click',()=>{addJournal(obj.title,obj.body);showToast('Added to journal')});renderStatus()
}
function renderMap(){mapGrid.innerHTML=Object.entries(scenes).filter(([,s])=>s.passport||s===scenes.hall).map(([k,s])=>'<button type="button" data-scene="'+k+'" '+(k!=='hall'&&!state.visited.includes(k)?'disabled':'')+'>'+(k==='hall'||state.visited.includes(k)?'✓ ':'🔒 ')+s.name+'</button>').join('');mapGrid.querySelectorAll('button:not(:disabled)').forEach(b=>b.addEventListener('click',()=>{mapDialog.close();travel(b.dataset.scene)}))}
function openJournal(){journalEntries.innerHTML=state.journal.length?state.journal.map(e=>'<div class="journal-entry"><b>'+e.title+'</b><div>'+e.text+'</div><small>'+e.date+'</small></div>').join(''):'<p>Your journal is empty. Walk around and discover something.</p>';journalDialog.showModal()}
const keys=new Set();let raf=0,last=0;function tick(t){if(!keys.size){raf=0;return}if(t-last>43){let dx=0,dy=0;if(keys.has('arrowleft')||keys.has('a'))dx-=1.65;if(keys.has('arrowright')||keys.has('d'))dx+=1.65;if(keys.has('arrowup')||keys.has('w'))dy-=1.65;if(keys.has('arrowdown')||keys.has('s'))dy+=1.65;if(dx||dy)move(dx,dy);last=t}raf=requestAnimationFrame(tick)}
root.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(['arrowleft','arrowright','arrowup','arrowdown','w','a','s','d'].includes(k)){e.preventDefault();stopAutoWalk();keys.add(k);if(!raf)raf=requestAnimationFrame(tick)}else if(k==='e'){e.preventDefault();interact()}else if(k==='m'){e.preventDefault();mapDialog.showModal()}else if(k==='j'){e.preventDefault();openJournal()}else if(k==='t'){e.preventDefault();cycleTime()}});
root.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
root.querySelectorAll('[data-move]').forEach(btn=>{let timer;const run=()=>{const d=btn.dataset.move;move(d==='left'?-2:d==='right'?2:0,d==='up'?-2:d==='down'?2:0)};btn.addEventListener('pointerdown',e=>{e.preventDefault();run();timer=setInterval(run,88)});['pointerup','pointercancel','pointerleave'].forEach(ev=>btn.addEventListener(ev,()=>clearInterval(timer)))});
dialog.addEventListener('close',()=>objects.querySelectorAll('.npc-figure').forEach(el=>el.classList.remove('talking','reacting')));exploreBtn.addEventListener('click',interact);$('#mapBtn').addEventListener('click',()=>mapDialog.showModal());$('#journalGameBtn').addEventListener('click',openJournal);if(timeBtn)timeBtn.addEventListener('click',cycleTime);$('#soundBtnGame')?.addEventListener('click',toggleSound);$('#achievementsBtn')?.addEventListener('click',()=>{renderAchievements();achievementDialog.showModal()});$('#backupGameBtn')?.addEventListener('click',exportPlayableBackup);$('#restoreGameBtn')?.addEventListener('click',()=>$('#restoreGameFile')?.click());$('#restoreGameFile')?.addEventListener('change',e=>{importPlayableBackup(e.target.files?.[0]);e.target.value=''});document.addEventListener('visibilitychange',()=>{if(document.hidden){stopAmbience()}else if(soundOn){startAmbience()}});stage.addEventListener('pointerdown',e=>{stage.focus();if(e.button!==undefined&&e.button!==0)return;if(e.target.closest('.interaction-hint,.world-event'))return;const rect=stage.getBoundingClientRect();const x=(e.clientX-rect.left)/rect.width*100,y=(e.clientY-rect.top)/rect.height*100;if(Number.isFinite(x)&&Number.isFinite(y))walkTo(x,y)});
renderScene();stage.focus({preventScroll:true});
})();