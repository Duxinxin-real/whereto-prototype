'use strict';
const pages={location:'实时定位',activity:'自动动态',overview:'手机概览',history:'历史轨迹',emergency:'收到 SOS',setup:'SOS 设置',countdown:'SOS 倒计时',active:'SOS 进行中'};
let page=Object.hasOwn(pages,location.hash.slice(1))?location.hash.slice(1):(document.body.dataset.page||'location');
document.body.dataset.page=page;
const params=new URLSearchParams(location.search),freeze=params.has('freeze');
const screen=document.getElementById('screen');
let timer=null;
const A='assets/';
function element(tag,cls,x,y,w,h,content){const e=document.createElement(tag);e.className=cls||'';if(x!==null){e.classList.add('pos');Object.assign(e.style,{left:x+'px',top:y+'px',width:w==null?'auto':w+'px',height:h==null?'auto':h+'px'});}if(content!==undefined)e.textContent=content;screen.append(e);return e;}
function text(s,x,y,w,size=30,cls='',h){let e=element('p','text '+cls,x,y,w,h,s);e.style.fontSize=size+'px';return e;}
function avatar(name,x,y,w,h,rounded=false){const person=/emma/i.test(name)?'Emma':/alex/i.test(name)?'Alex':/john|overview/i.test(name)?'John Smith':name;const size=Math.min(w,h);const e=element('div','emoji-avatar',x+(w-size)/2,y+(h-size)/2,size,size);e.style.background='url('+memberAvatarSource(person)+') center / contain no-repeat';e.style.borderRadius='50%';e.style.aspectRatio='1';e.setAttribute('role','img');e.setAttribute('aria-label',person+' avatar');return e;}

function image(name,x,y,w,h,blend=true,alt=''){
 if(name.startsWith('avatar-'))return avatar(name,x,y,w,h,name==='avatar-john');
 let e=element('img','asset '+(blend?'blend':''),x,y,w,h);if(name==='map-location')e.style.objectFit='fill';e.src=A+name+'.png';e.alt=alt;
 // Replace portraits embedded in the original map and alert artwork.
 if(name==='map-location')e.src=A+'map-location-members-clean.png';
 if(name==='map-history')avatar('john',649,300,82,82);
 if(name==='sos-halo')avatar('emma',312,459,222,222);
 return e;
}
function box(x,y,w,h,cls='panel',radius){let e=element('div',cls,x,y,w,h);if(radius)e.style.borderRadius=radius+'px';return e;}
function button(label,x,y,w,h,fn,cls='flat',size=30){let e=element('button',cls,x,y,w,h,label);e.style.fontSize=size+'px';if(fn)e.onclick=fn;return e;}
function hit(label,x,y,w,h,fn){let e=button('',x,y,w,h,fn,'overlay-hit');e.setAttribute('aria-label',label);return e;}
function go(p){if(timer)clearInterval(timer);location.href=p+'.html'+(freeze?'?freeze=1':'');}
function readSettings(){try{return JSON.parse(localStorage.getItem('sosSettings'))}catch{return null}}
function enterSOS(){try{localStorage.setItem('sosReturn',page)}catch{}go(readSettings()?'countdown':'setup')}
function returnPage(){let p='location';try{p=localStorage.getItem('sosReturn')||p}catch{}go(pages[p]&&!['setup','countdown','active'].includes(p)?p:'location')}
function toast(s){document.querySelector('.toast')?.remove();const t=element('div','toast',null,null,null,null,s);setTimeout(()=>t.remove(),2600)}
function dialog(title,choices){const shade=element('div','dialog-shade',null,null,null,null);const panel=document.createElement('section');panel.className='dialog';const h=document.createElement('h2');h.textContent=title;panel.append(h);for(const [label,fn] of choices){const b=document.createElement('button');b.textContent=label;b.onclick=()=>{shade.remove();fn?.()};panel.append(b)}const close=document.createElement('button');close.textContent='Close';close.onclick=()=>shade.remove();panel.append(close);shade.append(panel);shade.onclick=e=>{if(e.target===shade)shade.remove()};close.focus();}
function chooseUser(){dialog('Switch user',['John Smith','Emma','Alex'].map(name=>[name,()=>{document.querySelectorAll('[data-user]').forEach(e=>e.textContent=name);toast(name+' selected')}]))}
function datePicker(){dialog('Choose date',[['Oct 18',()=>setDate('Oct 18')],['Yesterday',()=>setDate('Yesterday')],['Today',()=>setDate('Today')]])}
function setDate(s){document.querySelectorAll('[data-date]').forEach(e=>e.textContent=s);toast(s+' selected')}
function status(dark=false){const e=text('4:02',dark?60:48,36,110,32,dark?'strong':'');if(dark)e.style.color='#fff';image(dark?'system-dark':'system-light',646,38,156,34,false);if(!dark)image('system-arrow',119,39,28,31,false)}
function nav(active,y=1670){const n=box(0,y,848,185,'tabbar');for(const key of ['overview','activity','location','history']){const a=document.createElement('a');a.className='tab'+(key===active?' selected':'');a.href=key+'.html';a.setAttribute('aria-label',pages[key]);a.setAttribute('aria-current',key===active?'page':'false');const img=document.createElement('img');img.src=A+'nav-'+key+(key===active?'-active':'')+'.png';img.alt='';a.append(img);n.append(a)}const b=document.createElement('button');b.className='tab sos flat';b.setAttribute('aria-label','SOS');b.onclick=enterSOS;const im=document.createElement('img');im.src=A+'sos-button.png';im.alt='SOS';b.append(im);n.append(b)}
function indicator(){box(275,1818,298,14,'home-indicator',20)}
function back(fn=returnPage){image('back',44,135,96,96,false);hit('Back',44,135,96,96,fn)}
function locationPage(){
 status();image('map-location',0,253,848,783,false,'Map showing Emma, John Smith and Alex');const cleanMap=image('map-location-no-tools',0,253,848,783,false);cleanMap.style.objectFit='fill';cleanMap.style.clipPath='inset(0 0 72% 80%)';cleanMap.style.pointerEvents='none';
 const me=button('',43,135,97,98,()=>settingsPage(),'soft-button profile-icon-button');me.setAttribute('aria-label','My profile');const meIcon=document.createElement('img');meIcon.src=A+'user-round.svg';meIcon.alt='';me.append(meIcon);
 const searchForm=element('form','phone-search',174,135,630,98);searchForm.setAttribute('role','search');const phone=document.createElement('input');phone.type='tel';phone.inputMode='tel';phone.placeholder='Find by phone number';phone.setAttribute('aria-label','Find by phone number');const search=document.createElement('button');search.type='submit';search.setAttribute('aria-label','Search by phone number');const searchIcon=document.createElement('img');searchIcon.src=A+'search.svg';searchIcon.alt='';search.append(searchIcon);searchForm.append(phone,search);initPhoneSearch(searchForm,phone);
 hit('Emma location',0,538,212,90,()=>toast('Emma · At home'));hit('John Smith location',211,659,330,100,()=>toast('John Smith · Updated now'));hit('Alex location',613,714,213,91,()=>toast('Alex · At work'));
 const controls=box(253,892,350,125,'map-control-shell');
 for(const [kind,label,x,fn] of [['center','Center on John',379,()=>toast('Centered on John Smith')],['refresh','Refresh location',491,()=>toast('Location updated just now')]]){const control=button('',x,907,96,96,fn,'map-control-circle');control.setAttribute('aria-label',label);const icon=document.createElement('img');icon.src=A+'map-control-'+kind+'.png';icon.alt='';control.append(icon)}

 for(const [x,align] of [[0,'left'],[788,'right']]){const edge=box(x,1036,60,64,'');edge.style.background='url(assets/map-location.png) '+align+' bottom / 848px 783px no-repeat';edge.style.pointerEvents='none';}
 box(0,1036,848,685,'white',57);box(368,1051,113,18,'',15).style.background='#454545';
 const listHeader=box(43,1104,762,94,'location-list-header');
 const tabs=document.createElement('div');tabs.className='location-list-tabs';tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','Map lists');listHeader.append(tabs);
 for(const [key,label] of [['members','Member'],['places','Places']]){const tab=document.createElement('button');tab.textContent=label;tab.className=locationListTab===key?'is-active':'';tab.setAttribute('role','tab');tab.setAttribute('aria-selected',String(locationListTab===key));tab.onclick=()=>{locationListTab=key;redraw()};tabs.append(tab)}
 const list=box(43,1220,765,435,'member-scroll');list.setAttribute('aria-label',locationListTab==='members'?'Members':'Places');
 if(locationListTab==='places'){renderPlaces(list);appendListAdd(list);nav('location');return}
 const members=locationMembers().map(name=>{const info=memberInfo(name);return [name,name.toLowerCase(),info?.address||'Location unavailable',info?.network||'—',info?.updated||'—',info?.battery||'—']});
 members.forEach(([name,person,address,network,updated,battery])=>{
 const row=document.createElement('div');row.className='member-card';list.append(row);const inner=document.createElement('div');inner.className='member-card-inner';row.append(inner);
 const capture=fn=>{const before=new Set(screen.children);fn();for(const el of [...screen.children])if(!before.has(el))inner.append(el)};
 capture(()=>{box(0,0,765,190,'panel',36).style.border='none';avatar(name,24,22,142,146,true);text(memberDisplayName(name),198,22,510,33,'strong');image('pin',198,77,31,34);text(address,245,81,480,25);const meta=element('div','member-meta',198,128,535,40);for(const [icon,label] of [[network==='Wi-Fi'?'wifi':'signal',network],['refresh',updated],['battery',battery]]){const group=document.createElement('span');const im=document.createElement('img');im.src=A+icon+'.png';im.alt='';const value=document.createElement('span');value.textContent=label;group.append(im,value);meta.append(group)}hit('View '+name,0,0,765,190,()=>friendDetails(name))});
 });
 appendListAdd(list);
 nav('location');
}
function activityPage(){
 status();image('avatar-john-small',38,113,91,95,false,'John emoji');text('John Smith',151,119,310,39,'strong').dataset.user='';const onlineDot=box(350,132,18.875,17.9819,'',20);onlineDot.style.background='#31d133';onlineDot.style.translate='11.9034px 3.14437px';image('device',151,166,28,34);text('In use',196,172,100,26);text('·',272,171,20,26);image('battery-small',296,170,42,28);text('95%',352,171,70,27);text('·',409,171,18,26);image('signal',439,169,34,31);text('Mobile data',490,172,195,26);image('dots',734,124,78,74,false);hit('Member options',734,124,78,74,chooseUser);
 box(0,233,848,1330,'panel',50).style.border='none';box(343,269,162,54,'',32).style.background='#eae9ec';text('Today',391,279,100,28);
 box(621,331,198,85,'pink',50);text('I’m home',660,357,155,30);screen.lastChild.style.color='#fff';text('9:20 PM',732,430,103,23,'muted');
 const events=[['event-unlock','Phone unlocked','1:34 AM',224,482,505,112],['event-battery','Charging complete · 100%','1:36 AM',224,622,505,111],['event-call','Call ended · 4 min 17 sec','1:42 AM',224,762,505,109],['event-pin','Left Chicago Cultural Center','9:21 AM',43,905,543,111],['event-car','Started driving','9:25 AM',43,1049,543,111]];
 for(const [icon,title,time,x,y,w,h]of events){box(x,y,w,h,'white',40);image(icon,x+14,y+13,90,89,false);text(title,x+122,y+23,w-132,29);text(time,x+122,y+63,w-132,23,'muted')}
 image('avatar-john-small',43,1193,76,77,false);image('typing',142,1195,135,74);text('John is typing…',144,1272,290,23,'muted');
 box(0,1530,848,175,'white',60);image('composer-smile',35,1550,112,108,false);box(160,1552,528,102,'panel',60).style.border='none';const input=element('input','inline-edit',192,1580,458,50);input.placeholder='Type a message';input.setAttribute('aria-label','Type a message');input.style.fontSize='30px';image('composer-send',703,1546,110,113,false);const send=()=>{if(!input.value.trim())return;const s=input.value;input.value='';box(360,1370,440,94,'pink',40);text(s,387,1394,383,28).style.color='#fff'};hit('Send message',703,1546,110,113,send);input.onkeydown=e=>{if(e.key==='Enter')send()};nav('activity',1687);
}
function overviewPage(){
 const header=box(0,0,848,350,'',80);header.style.background='linear-gradient(130deg,#232323,#1f1f1f)';
 image('dark-texture',0,0,848,350,false);status(true);image('avatar-overview',59,122,96,96,false);
 const user=button('',177,125,null,90,chooseUser,'overview-user-trigger');user.setAttribute('aria-label','Switch user');user.setAttribute('aria-haspopup','listbox');const userName=document.createElement('span');userName.dataset.user='';userName.textContent=memberDisplayName(model.pickerSelected||model.selfKey||'John Smith');const arrow=document.createElement('img');arrow.src=A+'chevron.png';arrow.alt='';user.append(userName,arrow);
 text('15',59,260,58,35,'strong').style.color='#fff';text('unlocks',114,266,132,30).style.color='#b8b8bb';box(233,258,2,39,'').style.background='#666';text('Last unlock',267,265,174,30).style.color='#b8b8bb';text('2h ago',445,264,130,30,'strong').style.color='#fff';button('Oct 20',641,239,152,76,datePicker,'primary',29).dataset.date='';
 const overviewTop=new Set(screen.children);
 renderOverviewCards();
 const content=[...screen.children].filter(e=>!overviewTop.has(e));const scroll=box(0,370,848,1300,'overview-scroll');const inner=document.createElement('div');inner.className='overview-scroll-inner';scroll.append(inner);for(const e of content){e.style.top=(parseFloat(e.style.top)-540)+'px';inner.append(e)}
 nav('overview',1693);
}
function renderOverviewCards(){
 const card=box(41,558,766,279,'',38);card.style.background='linear-gradient(115deg,#ed68aa,#ef6bb1)';text('Screen time',89,605,450,36).style.color='#fff';const screenTime=text('8h 45m',90,658,600,80,'strong');screenTime.style.color='#fff';screenTime.dataset.screenTime='';text('Today’s phone usage',89,763,600,30).style.color='#fff';image('screen-phone',713,596,47,59,false);
 box(41,866,766,509,'panel white',40);text('Network record',85,915,600,36);
 const networks=[['record-wifi','Home Wi-Fi','2:32 – 5:29 PM'],['record-signal','Mobile data','1:08 – 2:32 PM'],['record-wifi','Office Wi-Fi','9:15 AM – 1:08 PM'],['record-signal','Mobile data','8:40 – 9:15 AM']];
 networks.forEach(([icon,name,time],i)=>{const y=1003+i*92;image(icon,89,y,44,42);text(name,185,y+7,380,31);const timeLabel=text(time,509,y+9,258,28);timeLabel.style.whiteSpace='nowrap';timeLabel.style.textAlign='right'});
 box(41,1401,766,384,'panel',40);text('Call record',85,1440,500,36);
 [['5 min 12 sec','5:23 PM'],['2 min 48 sec','1:16 PM'],['8 min 05 sec','10:42 AM']].forEach(([duration,time],i)=>{const y=1511+i*92;image('record-call',88,y,50,52);text(duration,185,y+14,400,31);text(time,654,y+15,150,29)});
}
function historyPage(){
 status();text('Location history',41,157,640,45,'strong');image('calendar',709,134,99,101,false);hit('Choose history date',709,134,99,101,datePicker);image('map-history',0,253,848,637,false,'History map with Home, Market and Office markers');
 for(const [x,align] of [[0,'left'],[788,'right']]){const edge=box(x,884,60,64,'');edge.style.background='url(assets/map-history.png) '+align+' bottom / 848px 637px no-repeat';}
 box(0,884,848,830,'white',58);box(368,902,113,19,'',15).style.background='#515151';box(41,957,766,114,'panel',40).style.border='none';box(561,969,236,86,'pink',27);text('Oct 18',129,993,180,30);text('Yesterday',373,993,230,30);text('Today',633,993,150,30).style.color='#fff';for(const [v,x]of [['Oct 18',41],['Yesterday',300],['Today',560]])hit(v,x,969,238,86,()=>setDate(v));
 text('John’s route',43,1101,540,47,'strong');box(612,1098,197,81,'',35).style.background='#fff0f7';image('play',631,1108,54,59,false);text('Replay',697,1120,110,30).style.color='#ff278b';hit('Replay history',612,1098,197,81,()=>{toast('Playing saved route');const marker=box(676,384,25,25,'',30);marker.style.background='#ff2994';marker.animate([{transform:'translate(-540px,410px)'},{transform:'translate(-290px,180px)'},{transform:'translate(0,0)'}],{duration:3000,fill:'forwards'})});
 const rows=[{y:1198,time:'11:17 AM',name:'Office',icon:'history-office',sub:'Walked for 6 min',small:'walk'},{y:1363,time:'11:11 AM',name:'Market',icon:'history-market',sub:'Stayed for 48 min',small:'clock'},{y:1527,time:'10:23 AM',name:'Home',icon:'history-home'}];
 for(const r of rows){box(44,r.y,760,153,'panel',38).style.border='none';text(r.time,76,r.y+56,160,26);image(r.icon,262,r.y+22,96,100,false);text(r.name,386,r.y+35,370,33,'strong');if(r.sub){image(r.small,390,r.y+88,34,36);text(r.sub,443,r.y+91,340,29,'muted')}}
 box(219,1265,5,333,'').style.background='#ffb9d7';for(const y of [1269,1436,1597]){box(202,y-19,39,39,'',24).style.cssText+=';background:#fff;border:5px solid #ffd6e8';box(211,y-10,21,21,'',24).style.background='#ff2994'}nav('history');
}
function emergencyPage(){
 status();back(()=>returnIncomingSOS());text('Emergency contact',250,145,555,43,'strong');image('sos-halo',104,255,640,624,false,'Emma emergency alert');text('Emma needs you',192,890,650,59,'strong');text('Emergency alert',257,970,500,38,'muted');
 box(44,1043,760,225,'panel',42);image('avatar-emma-tiny',75,1089,96,102,false);box(192,1089,426,100,'white',38);text('Please reply to me ASAP!',229,1118,540,31);text('2 minutes ago',205,1198,320,25,'muted');
 button('Got it',44,1299,760,107,()=>{returnIncomingSOS();toast('Acknowledgement recorded in this demo')},'primary',43);button('Call Emma',44,1431,760,103,()=>toast('Demo only — no phone call is placed'),'secondary',41);image('call-pink',298,1458,49,55);text('123 Oak Street, Seattle',315,1588,490,31,'muted');image('location-gray',255,1583,39,45);nav(null);
}
let chosen=new Set();
function setupPage(){
 const settings=readSettings();const users=[...new Set(model.friends)];chosen=new Set((settings?.recipients||[]).filter(n=>users.includes(n)));status();back();text('SOS setup',329,151,420,43,'strong');
 text('Who should receive your SOS?',44,295,760,51,'strong').style.textAlign='center';text('Choose one or more people.',44,367,760,35,'muted').style.textAlign='center';
 const selectionCount=text('',68,432,712,28,'muted');selectionCount.setAttribute('aria-live','polite');
 const listHeight=users.length?Math.min(432,users.length*128+2):300;const list=box(45,484,758,listHeight,'panel white sos-recipient-list',40);list.setAttribute('aria-label','SOS recipients');
 const updateSelection=()=>{selectionCount.textContent=chosen.size+' selected · '+users.length+' friends';const save=screen.querySelector('[data-save-sos]');if(save)save.disabled=!chosen.size};
 users.forEach(name=>{const row=document.createElement('button');row.className='sos-recipient-row';row.setAttribute('aria-label','Select '+name);row.setAttribute('aria-pressed',String(chosen.has(name)));const portrait=document.createElement('img');portrait.className='sos-recipient-avatar';portrait.src=memberAvatarSource(name);portrait.alt='';const label=document.createElement('span');label.textContent=name;const check=document.createElement('img');check.className='sos-recipient-check';check.alt='';const update=()=>{check.src=A+(chosen.has(name)?'setup-check':'setup-unchecked')+'.png';row.setAttribute('aria-pressed',String(chosen.has(name)));updateSelection()};row.append(portrait,label,check);list.append(row);row.onclick=()=>{chosen.has(name)?chosen.delete(name):chosen.add(name);update()};update()});
 if(!users.length){const empty=document.createElement('div');empty.className='sos-empty';empty.textContent='No friends yet';const add=document.createElement('button');add.textContent='Add friend';add.onclick=addFriend;empty.append(add);list.append(empty)}
 const beforeAlert=new Set(screen.children);
 text('Your alert',49,973,650,45,'strong');box(45,1046,759,143,'panel',39);const msg=element('textarea','inline-edit',84,1095,624,74);msg.value=settings?.message||'I need help. Please contact me.';msg.style.fontSize='35px';msg.setAttribute('aria-label','Your alert message');msg.maxLength=100;image('setup-edit',711,1093,50,48);hit('Edit alert message',711,1093,50,48,()=>msg.focus());
 box(45,1220,759,148,'panel white',38);image('setup-pin',76,1241,104,104,false);text('Your current location will be shared.',208,1273,570,31);
 box(45,1384,759,147,'panel white',38);image('setup-clock',76,1402,104,104,false);text('5-second countdown',209,1414,520,34);text('You can cancel before your alert is sent.',209,1460,570,25,'muted');
 for(const node of screen.children){if(!beforeAlert.has(node)&&node.classList.contains('pos'))node.style.top=(parseFloat(node.style.top)-(432-listHeight))+'px'}
 const save=button('Save settings',44,1564,760,107,()=>{if(!chosen.size){toast('Choose at least one recipient');return}const message=msg.value.trim();if(!message){toast('Add an alert message');return}try{localStorage.setItem('sosSettings',JSON.stringify({recipients:[...chosen],message}));localStorage.removeItem('sosActive')}catch{}returnPage()},'primary',43);save.dataset.saveSos='';updateSelection();text('Saving will not send an SOS.',44,1730,760,28,'muted').style.textAlign='center';indicator();
}
function countdownPage(){
 const settings=readSettings()||{recipients:['Emma','Alex'],message:'I need help. Please contact me.'};status();text('Sending SOS soon',230,163,550,44,'strong');image('countdown-close',44,145,95,95,false);hit('Cancel countdown',44,145,95,95,returnPage);image('countdown-settings',709,145,99,98,false);hit('SOS settings',709,145,99,98,()=>go('setup'));text('Your alert will be sent in',44,247,760,36,'muted').style.textAlign='center';
 image('countdown-ring',159,340,529,538,false);text('seconds',274,692,300,34,'muted').style.textAlign='center';let count=freeze?3:5;const num=text(String(count),274,474,300,210,'big-num');num.style.textAlign='center';num.setAttribute('aria-live','polite');
 box(44,920,760,573,'panel',40);text('Sending to',86,965,560,35,'muted');
 const recipientStrip=box(83,1027,680,200,'sos-recipient-strip');recipientStrip.setAttribute('aria-label','Selected recipients');settings.recipients.forEach(name=>{const item=document.createElement('div');const im=document.createElement('img');im.src=memberAvatarSource(name);im.alt='';const label=document.createElement('span');label.textContent=name;item.append(im,label);recipientStrip.append(item)});box(86,1254,672,2,'divider');box(83,1286,680,93,'white',30);text(settings.message,112,1314,630,31);image('location-gray',92,1400,39,45);text('Current location included',155,1404,570,30,'muted');
 button('Cancel SOS',44,1529,760,109,returnPage,'primary',47);text('Nothing has been sent yet.',44,1673,760,28,'muted').style.textAlign='center';indicator();
 if(!freeze)timer=setInterval(()=>{count--;num.textContent=String(count);if(count<=0){clearInterval(timer);try{localStorage.setItem('sosActive','true')}catch{}go('active')}},1000);
}
function activePage(){
 const settings=readSettings()||{recipients:['Emma','Alex'],message:'I need help. Please contact me.'};
 status();text('SOS active',44,146,760,43,'strong').style.textAlign='center';
 image('sos-bell',314,230,220,220,false);
 text('Your SOS has been sent',44,477,760,46,'strong').style.textAlign='center';
 text('Waiting for a response.',44,541,760,33,'muted').style.textAlign='center';
 const content=box(44,620,760,900,'active-content');
 const card=document.createElement('section');card.className='active-card';content.append(card);
 const title=document.createElement('h2');title.textContent='Recipients · '+settings.recipients.length;card.append(title);
 const recipients=document.createElement('div');recipients.className='sos-active-recipients';recipients.setAttribute('aria-label','SOS delivery status');card.append(recipients);
 settings.recipients.forEach(name=>{const row=document.createElement('div');row.className='sos-delivery-row';const im=document.createElement('img');im.src=memberAvatarSource(name);im.alt='';const details=document.createElement('div');const label=document.createElement('span');label.textContent=name;const delivery=document.createElement('small');delivery.textContent=freeze?'Delivered':(localStorage.getItem('receipt-'+name)||'Sent');details.append(label,delivery);row.append(im,details);recipients.append(row)});
 const message=document.createElement('section');message.className='active-card active-message';const portrait=document.createElement('img');portrait.src=memberAvatarSource(model.selfKey||'Emma');portrait.alt='Your avatar';const bubble=document.createElement('p');bubble.textContent=settings.message;message.append(portrait,bubble);content.append(message);
 const place=document.createElement('section');place.className='active-card active-location-card';const pin=document.createElement('img');pin.src=A+'active-location.png';pin.alt='';const copy=document.createElement('div');const label=document.createElement('strong');label.textContent='Location shared';const address=document.createElement('span');address.textContent='123 Oak Street, Seattle';copy.append(label,address);place.append(pin,copy);content.append(place);
 button('End SOS',44,1570,760,104,()=>{try{localStorage.removeItem('sosActive')}catch{}returnPage()},'secondary active-end-button',36);
 text('Ending SOS will notify your recipients.',44,1704,760,27,'muted').style.textAlign='center';indicator();
}
