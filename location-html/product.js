const placeIconTypes=['home','office','market','school','hospital','restaurant','cafe','gym','park'];
function placeIconSource(type){return ['school','hospital','restaurant','cafe','gym','park'].includes(type)?A+'places/'+type+'.svg':A+'history-'+(['home','office','market'].includes(type)?type:'home')+'.png'}
const defaultAvatars={neutral:{label:'Default',file:'avatars/default-neutral.svg'},emma:{label:'Emma',emoji:'👩🏻'},alex:{label:'Alex',emoji:'👨🏻'},mia:{label:'Mia',emoji:'👩🏽'},ryan:{label:'Ryan',emoji:'👨🏾‍🦱'},taylor:{label:'Taylor',emoji:'🧑🏻‍🦰'},curly:{label:'Curly hair',emoji:'👩🏽‍🦱'},blond:{label:'Blond hair',emoji:'👱🏼‍♀️'},beard:{label:'Beard',emoji:'🧔🏽'},silver:{label:'White hair',emoji:'🧑🏻‍🦳'},olderWoman:{label:'Older woman',emoji:'👵🏼'},olderMan:{label:'Older man',emoji:'👴🏽'},boy:{label:'Boy',emoji:'👦🏻'}};
const defaultAvatarImages={};
function defaultAvatarSource(key){
 const id=defaultAvatars[key]?key:'neutral';
 if(defaultAvatars[id].file)return A+defaultAvatars[id].file;
 if(!defaultAvatarImages[id]){
  const svg='<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><text x="64" y="100" text-anchor="middle" font-size="100" font-family="Apple Color Emoji,Segoe UI Emoji,Noto Color Emoji,sans-serif">'+defaultAvatars[id].emoji+'</text></svg>';
  defaultAvatarImages[id]='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
 }
 return defaultAvatarImages[id];
}
const countryCallingCodes=[["United States / Canada", "+1"], ["United Kingdom", "+44"], ["China", "+86"], ["Hong Kong", "+852"], ["Macao", "+853"], ["Taiwan", "+886"], ["Australia", "+61"], ["New Zealand", "+64"], ["Japan", "+81"], ["South Korea", "+82"], ["Singapore", "+65"], ["Malaysia", "+60"], ["Thailand", "+66"], ["Vietnam", "+84"], ["Indonesia", "+62"], ["Philippines", "+63"], ["India", "+91"], ["Pakistan", "+92"], ["Bangladesh", "+880"], ["Sri Lanka", "+94"], ["Nepal", "+977"], ["Germany", "+49"], ["France", "+33"], ["Italy", "+39"], ["Spain", "+34"], ["Portugal", "+351"], ["Netherlands", "+31"], ["Belgium", "+32"], ["Switzerland", "+41"], ["Austria", "+43"], ["Sweden", "+46"], ["Norway", "+47"], ["Denmark", "+45"], ["Finland", "+358"], ["Ireland", "+353"], ["Poland", "+48"], ["Greece", "+30"], ["Türkiye", "+90"], ["Ukraine", "+380"], ["United Arab Emirates", "+971"], ["Saudi Arabia", "+966"], ["Israel", "+972"], ["Qatar", "+974"], ["Egypt", "+20"], ["South Africa", "+27"], ["Nigeria", "+234"], ["Kenya", "+254"], ["Mexico", "+52"], ["Brazil", "+55"], ["Argentina", "+54"], ["Chile", "+56"], ["Colombia", "+57"], ["Peru", "+51"]];
/* Local prototype state. No phone verification, location or notification service. */
const original={location:locationPage,overview:overviewPage,history:historyPage};
const initial={profile:null,selected:'Emma',friends:['Emma','Alex'],requests:[],epoch:{Emma:0,Alex:0}};
let model;try{model=JSON.parse(localStorage.getItem('locationProduct'))||initial}catch{model=initial}
// Carry local prototype state across file:// pages in the same browser tab.
try{const shared=JSON.parse(window.name||'null');if(shared?.app==='familygo-prototype'&&shared.model){const previous=model;const current=shared.model;if((current.updatedAt||0)>(previous.updatedAt||0))model=current;const places=new Map([...(current.places||[]),...(previous.places||[])].map(p=>[p.id,p]));model.places=[...places.values()]}}catch{}
let locationListTab='members';
function appendListAdd(list){const add=document.createElement('button');add.className='list-end-add';const icon=document.createElement('img');icon.src=A+'add-friend-plus.svg';icon.alt='';const label=document.createElement('span');label.textContent=locationListTab==='members'?'Add friend':'Add place';add.append(icon,label);add.onclick=()=>locationListTab==='members'?addFriend():addPlace();list.append(add)}
function renderPlaces(list){
 const places=model.places||[];
 if(!places.length){const empty=document.createElement('div');empty.className='places-empty';empty.textContent='No saved places yet';list.append(empty);return}
 for(const place of places){const row=document.createElement('div');row.className='place-card';const icon=document.createElement('img');icon.src=placeIconSource(place.type);icon.alt='';const details=document.createElement('div');const name=document.createElement('strong');name.textContent=place.name;const address=document.createElement('span');address.textContent=place.address;details.append(name,address);row.append(icon,details);list.append(row)}
}
const placeSamples=[
 {name:'Home',address:'123 Oak Street, Seattle',x:280,y:660},
 {name:'Office',address:'456 Pine Street, Seattle',x:620,y:420},
 {name:'Market',address:'789 Maple Street, Seattle',x:430,y:930}
];
function addPlace(){
 screen.replaceChildren();screen.classList.remove('profile-screen');
 const map=element('div','place-picker-map',0,0,848,1855);map.setAttribute('aria-label','Select location on map');
 const texture=document.createElement('div');texture.className='place-map-texture';map.append(texture);
 const marker=document.createElement('img');marker.className='place-picker-pin';marker.src=A+'history-home.png';marker.alt='Selected location';marker.hidden=true;map.append(marker);
 status();back(()=>{page='location';locationListTab='places';redraw()});
 const form=element('form','place-address-search',160,135,645,98);const input=document.createElement('input');input.placeholder='Search address';input.setAttribute('aria-label','Search address');const search=document.createElement('button');search.type='submit';search.setAttribute('aria-label','Search address');const searchIcon=document.createElement('img');searchIcon.src=A+'search.svg';searchIcon.alt='';search.append(searchIcon);form.append(input,search);
 const results=element('div','place-search-results',160,249,645,null);results.hidden=true;
 const bottom=element('section','place-selection-card',0,1440,848,415);let selected=null,type='home',customName=false;
 const summary=document.createElement('div');summary.className='place-selection-summary';bottom.append(summary);
 const icon=document.createElement('button');icon.className='place-icon-choice';icon.setAttribute('aria-label','Choose place icon');const iconImage=document.createElement('img');iconImage.src=A+'history-home.png';iconImage.alt='';icon.append(iconImage);
 const badge=document.createElement('span');badge.className='place-icon-edit';const pencil=document.createElement('img');pencil.src=A+'setup-edit.png';pencil.alt='Edit icon';badge.append(pencil);icon.append(badge);const details=document.createElement('div');details.className='place-selection-details';const name=document.createElement('input');name.className='place-name-input';name.setAttribute('aria-label','Place name');name.placeholder='Place name';name.value='Home';name.maxLength=60;name.oninput=()=>{customName=!!name.value.trim();save.disabled=!selected||!name.value.trim()};const address=document.createElement('div');address.className='place-selected-address';address.textContent='Select a location';details.append(name,address);summary.append(icon,details);
 const save=action(bottom,'Save',()=>{if(!selected||!name.value.trim())return;model.places||=[];model.places.push({id:Date.now(),name:name.value.trim(),address:selected.address,type,mapPoint:{x:selected.x,y:selected.y},demo:true});model.showPlaces=true;if(saveModel()){page='location';locationListTab='places';redraw()}});save.disabled=true;
 const select=point=>{selected={...point};marker.hidden=false;marker.style.left=point.x+'px';marker.style.top=point.y+'px';address.textContent=point.address;save.disabled=!name.value.trim();results.hidden=true;input.blur()};
 map.onclick=event=>{const rect=map.getBoundingClientRect();const x=(event.clientX-rect.left)*848/rect.width;const y=(event.clientY-rect.top)*1855/rect.height;if(y<260||y>1400)return;const nearest=placeSamples.reduce((a,b)=>Math.hypot(a.x-x,a.y-y)<Math.hypot(b.x-x,b.y-y)?a:b);select({...nearest,x,y})};

 form.onsubmit=event=>{event.preventDefault();results.replaceChildren();results.hidden=false;const query=input.value.trim().toLowerCase();const matches=placeSamples.filter(p=>!query||(p.name+' '+p.address).toLowerCase().includes(query));if(!matches.length){const empty=document.createElement('p');empty.textContent='No matching demo address';results.append(empty);return}for(const point of matches){const row=document.createElement('button');row.textContent=point.address;row.onclick=()=>{select(point);input.value=point.address;texture.animate([{transform:'scale(1.03)'},{transform:'scale(1)'}],{duration:250})};results.append(row)}};
 input.oninput=()=>{results.hidden=true};input.onkeydown=e=>{if(e.key==='Escape'){results.hidden=true;input.blur()}};
 icon.onclick=()=>sheet('Choose icon',(panel,close)=>{const options=document.createElement('div');options.className='place-icon-options';panel.append(options);for(const option of placeIconTypes){const choice=document.createElement('button');choice.setAttribute('aria-label',option[0].toUpperCase()+option.slice(1)+' icon');choice.setAttribute('aria-pressed',String(type===option));const img=document.createElement('img');img.src=placeIconSource(option);img.alt='';choice.append(img);choice.onclick=()=>{type=option;iconImage.src=img.src;marker.src=img.src;if(!customName){name.value=option[0].toUpperCase()+option.slice(1);save.disabled=!selected}close()};options.append(choice)}});
 indicator();
}
function saveModel(){try{model.updatedAt=Date.now();localStorage.setItem('locationProduct',JSON.stringify(model));window.name=JSON.stringify({app:'familygo-prototype',model});return true}catch{toast('Could not save. Please try again.');return false}}
function redraw(){if(timer)clearInterval(timer);screen.replaceChildren();screen.classList.remove('profile-screen');window[page+'Page']?.()}
function sheet(title,build){document.querySelector('.product-shade')?.remove();const shade=element('div','product-shade',null);const panel=document.createElement('section');panel.className='product-sheet';panel.innerHTML='<div class="sheet-handle"></div>';const close=document.createElement('button');close.className='sheet-close';close.textContent='Close';close.onclick=()=>shade.remove();panel.append(close);const h=document.createElement('h2');h.textContent=title;panel.append(h);build(panel,()=>shade.remove());const cancel=[...panel.querySelectorAll('button')].find(b=>b.textContent.trim()==='Cancel');if(cancel){close.remove();cancel.classList.add('confirmation-cancel')}if(!panel.classList.contains('add-friend-sheet')){panel.classList.add('standard-sheet');const card=document.createElement('div');card.className='standard-sheet-card';for(const child of [...panel.children])if(!child.classList.contains('sheet-handle')&&child!==close)card.append(child);if(!cancel){close.classList.add('product-action','confirmation-cancel');card.append(close)}panel.append(card)}panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label',title);shade.append(panel);shade.onclick=e=>{if(e.target===shade)shade.remove()};shade.onkeydown=e=>{if(e.key==='Escape')shade.remove()};setTimeout(()=>panel.querySelector('input,button')?.focus(),0)}
function field(panel,label,value='',placeholder=''){const l=document.createElement('label');l.textContent=label;const input=document.createElement('input');input.value=value;input.placeholder=placeholder;l.append(input);panel.append(l);return input}
function action(panel,label,fn){const b=document.createElement('button');b.className='product-action';b.textContent=label;b.onclick=fn;panel.append(b);return b}
function paragraph(panel,s){const p=document.createElement('p');p.textContent=s;panel.append(p)}
function memberPicker(){
 const trigger=screen.querySelector('[aria-label="'+(page==='overview'?'Switch user':'Find a member')+'"]');
 if(screen.querySelector('.member-picker-shade')){screen.querySelector('.member-picker-shade').remove();trigger?.setAttribute('aria-expanded','false');return}
 const shade=element('div','member-picker-shade',0,0,848,1855);
 const menu=document.createElement('div');menu.className='compact-member-menu';menu.setAttribute('role','listbox');menu.setAttribute('aria-label','Select member');menu.style.left=(page==='overview'?177:174)+'px';menu.style.top=(page==='overview'?225:249)+'px';if(page==='overview')menu.style.width='400px';shade.append(menu);
 trigger?.setAttribute('aria-expanded','true');trigger?.setAttribute('aria-haspopup','listbox');
 const close=()=>{shade.remove();trigger?.setAttribute('aria-expanded','false');trigger?.focus()};
 const selected=model.pickerSelected||model.selfKey;
 for(const name of locationMembers()){
 const row=document.createElement('button');row.className='compact-member-row'+(name===selected?' is-selected':'');row.setAttribute('role','option');row.setAttribute('aria-selected',String(name===selected));
 const img=document.createElement('img');img.src=memberAvatarSource(name);img.alt='';const label=document.createElement('span');label.textContent=memberDisplayName(name);row.append(img,label);menu.append(row);
 row.onclick=()=>{model.pickerSelected=name;model.selected=name==='John'?'You':name;if(saveModel()){close();if(page==='overview'){screen.querySelectorAll('[data-user]').forEach(e=>e.textContent=memberDisplayName(name));const portrait=screen.querySelector('.emoji-avatar');if(portrait)portrait.style.backgroundImage='url('+img.src+')'}else toast((name==='John'?'John Smith':name)+' selected')}};
 }
 shade.onclick=e=>{if(e.target===shade)close()};shade.onkeydown=e=>{if(e.key==='Escape'){e.preventDefault();close()}if(['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();const rows=[...menu.children];const index=rows.indexOf(document.activeElement);rows[(index+(e.key==='ArrowDown'?1:-1)+rows.length)%rows.length].focus()}if(e.key==='Tab'){e.preventDefault();const rows=[...menu.children];const index=rows.indexOf(document.activeElement);rows[(index+(e.shiftKey?-1:1)+rows.length)%rows.length].focus()}};
 (menu.querySelector('.is-selected')||menu.firstChild)?.focus();
}
chooseUser=()=>memberPicker();
function addFriend(){sheet('Add friend',(p)=>{p.classList.add('add-friend-sheet');p.parentElement?.classList.add('add-friend-shade');const card=document.createElement('div');card.className='add-friend-card';card.append(p.querySelector('h2'));p.append(card);paragraph(card,'Enter their phone number to connect.');const label=document.createElement('label');label.className='add-phone-label';label.textContent='Phone number';card.append(label);const row=document.createElement('div');row.className='add-phone-row';const code=document.createElement('select');code.setAttribute('aria-label','Country code');for(const [name,c] of countryCallingCodes){const o=document.createElement('option');o.value=c;o.textContent=c;o.title=name;code.append(o)}const phone=document.createElement('input');phone.type='tel';phone.placeholder='Enter phone number';phone.setAttribute('aria-label','Phone number');label.htmlFor='add-friend-phone';phone.id='add-friend-phone';row.append(code,phone);card.append(row);action(card,'Search',()=>searchFriend(phone.value,code.value))})}
// Local demo accounts; numbers do not contact real users.
const demoContacts={
 Taylor:{phone:'88888888',avatar:'alex'},
 Mia:{phone:'2025550142',avatar:'emma',info:{address:'Seattle Central Library',network:'Wi-Fi',updated:'Just now',battery:'91%'}},
 Ryan:{phone:'2025550168',avatar:'alex',info:{address:'Pike Place Market, Seattle',network:'Mobile data',updated:'3 min ago',battery:'68%'}}
};
function searchFriend(number,code='+1'){
 const digits=number.replace(/\D/g,'');
 if(!digits){toast('Enter a phone number');return}
 const match=code==='+1'?Object.entries(demoContacts).find(([,contact])=>digits===contact.phone||digits==='1'+contact.phone):null;
 if(match){document.querySelector('.product-shade')?.remove();friendDetails(match[0]);return}
 sheet('User not found',p=>paragraph(p,'Check the country code and phone number.'));
}
function requests(){sheet('Friend requests',(p)=>{if(!model.requests.length)paragraph(p,'No friend requests.');for(const r of model.requests){paragraph(p,r.name+' · '+r.phone+' · '+r.status);if(r.status==='Pending'){action(p,'Preview recipient confirmation',()=>sheet('Friend request',(q)=>{paragraph(q,'This is the receiving side of this local demo.');paragraph(q,'Agree to share location, history and available device status with this person. Your personal screen report is not shared.');action(q,'Agree and bind',()=>{r.status='Accepted';if(!model.friends.includes(r.name))model.friends.push(r.name);model.epoch[r.name]=Date.now();if(saveModel()){redraw();requests()}});action(q,'Decline',()=>{r.status='Declined';if(saveModel())requests()});action(q,'Mark expired (demo)',()=>{r.status='Expired';if(saveModel())requests()})}))}}})}
nav=function(active){const y=1670;const n=box(0,y,848,185,'tabbar');['overview','location','history'].forEach((key,i)=>{const a=document.createElement('a');a.className='tab';a.style.left=[90,340,590][i]+'px';a.href=key+'.html';a.setAttribute('aria-label',pages[key]);a.setAttribute('aria-current',key===active?'page':'false');const im=document.createElement('img');im.src=A+'nav-'+key+(key===active?'-active':'')+'.png';a.append(im);n.append(a)});const b=button('SOS',710,y+40,85,85,enterSOS,'primary',29);b.style.borderRadius='22px';n.children[2].style.left='520px';n.children[1].style.left='305px';n.children[0].style.left='90px'};
function openHistory(name){if(!isSelf(name)&&!model.friends.includes(name)){toast('This friend is no longer bound');return}model.selected=name;if(saveModel())go('history')}
locationPage=function(){ensureSelfIdentity();original.location();renderMapPlaces();renderMemberMarkers()};
overviewPage=function(){ensureSelfIdentity();original.overview();const n=model.pickerSelected||model.selfKey;screen.querySelectorAll('[data-user]').forEach(e=>e.textContent=memberDisplayName(n));const portrait=screen.querySelector('.emoji-avatar');if(portrait)portrait.style.backgroundImage='url('+memberAvatarSource(n)+')';syncOverviewDate()};
let historyDate=new Date().toISOString().slice(0,10);
function calendarDateKey(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function usageMinutes(date){const today=calendarDateKey(new Date());if(date===today)return 525;const seed=[...date+(model.pickerSelected||model.selfKey||'')].reduce((n,c)=>n+c.charCodeAt(0),0);return 150+(seed*37)%510}
function usageDuration(minutes){return Math.floor(minutes/60)+'h '+minutes%60+'m'}
let overviewDate=calendarDateKey(new Date());
function syncOverviewDate(){screen.querySelectorAll('[data-date]').forEach(e=>e.textContent=new Date(overviewDate+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'}));screen.querySelectorAll('[data-screen-time]').forEach(e=>e.textContent=usageDuration(usageMinutes(overviewDate)))}
datePicker=function(){sheet('Choose date',(p,close)=>{
 let selected=overviewDate;let month=new Date(selected+'T12:00:00');month.setDate(1);const today=calendarDateKey(new Date());
 const calendar=document.createElement('div');calendar.className='usage-calendar';p.append(calendar);
 const render=()=>{calendar.replaceChildren();const header=document.createElement('div');header.className='usage-month';calendar.append(header);
 for(const direction of [-1,0,1]){if(!direction){const title=document.createElement('strong');title.textContent=month.toLocaleDateString('en-US',{month:'long',year:'numeric'});header.append(title);continue}const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',direction<0?'Previous month':'Next month');const im=document.createElement('img');im.src=A+'chevron.png';im.alt='';im.style.transform='rotate('+(direction<0?90:-90)+'deg)';b.append(im);b.disabled=direction>0&&month.getFullYear()===new Date().getFullYear()&&month.getMonth()===new Date().getMonth();b.onclick=()=>{month.setMonth(month.getMonth()+direction);render()};header.append(b)}
 const grid=document.createElement('div');grid.className='usage-days';calendar.append(grid);for(const label of ['S','M','T','W','T','F','S']){const day=document.createElement('span');day.className='usage-weekday';day.textContent=label;grid.append(day)}
 for(let i=0;i<month.getDay();i++)grid.append(document.createElement('span'));
 const count=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();for(let n=1;n<=count;n++){const key=calendarDateKey(new Date(month.getFullYear(),month.getMonth(),n));const b=document.createElement('button');b.className='usage-day';b.type='button';b.disabled=key>today;b.setAttribute('aria-pressed',String(key===selected));b.setAttribute('aria-label',key+(b.disabled?'':', '+usageDuration(usageMinutes(key))));b.style.setProperty('--usage',b.disabled?'0deg':usageMinutes(key)/1440*360+'deg');const label=document.createElement('span');label.textContent=n;b.append(label);b.onclick=()=>{selected=key;render()};grid.append(b)}
 const summary=document.createElement('div');summary.className='usage-summary';const strong=document.createElement('strong');strong.textContent=usageDuration(usageMinutes(selected));const caption=document.createElement('span');caption.textContent=Math.round(usageMinutes(selected)/1440*100)+'% of 24 hours';summary.append(strong,caption);calendar.append(summary);
 };render();action(p,'Apply',()=>{overviewDate=selected;close();syncOverviewDate()});action(p,'Cancel',close);
})};
historyPage=function(){renderSelectableHistory()};
activityPage=function(){go('location')};
function profilePage(onboarding=false){
 screen.classList.add('profile-screen');
 text('9:41',77,34,150,34,'strong');image('system-light',650,38,150,34,false);
 const heading=text('Your profile',40,180,768,60,'strong');heading.style.textAlign='center';heading.style.fontWeight='700';
 const subtitle=text('Let your friends recognize you.',45,273,758,34,'muted');subtitle.style.textAlign='center';
 let selectedAvatar=onboarding?'neutral':(model.profile?.avatar||'neutral');
 const a=avatar(selectedAvatar,255,365,338,332);a.style.left='255px';a.style.width='338px';a.style.height='332px';a.style.borderRadius='0';a.style.background='url('+defaultAvatarSource(selectedAvatar)+') center / contain no-repeat';a.dataset.avatar=selectedAvatar;a.dataset.upload=onboarding?'':(model.profile?.avatarImage||'');if(a.dataset.upload)a.style.backgroundImage='url('+a.dataset.upload+')';
 const choose=button('Choose avatar',230,721,388,56,()=>sheet('Choose avatar',(p,close)=>{p.classList.add('avatar-picker-sheet');const upload=document.createElement('input');upload.type='file';upload.accept='image/jpeg,image/png,image/webp';upload.hidden=true;upload.setAttribute('aria-label','Upload avatar');p.append(upload);action(p,'Upload photo',()=>upload.click());upload.onchange=async()=>{const file=upload.files[0];if(!file)return;try{const data=await readAvatarUpload(file);a.dataset.upload=data;a.style.backgroundImage='url('+data+')';close()}catch(error){toast(error.message)}};const grid=document.createElement('div');grid.className='avatar-options-grid';p.append(grid);for(const person of Object.keys(defaultAvatars)){const option=action(grid,'',()=>{selectedAvatar=person;a.dataset.avatar=person;a.dataset.upload='';a.style.background='url('+defaultAvatarSource(person)+') center / contain no-repeat';close()});option.classList.add('avatar-choice');option.setAttribute('aria-pressed',String(a.dataset.avatar===person&&!a.dataset.upload));option.setAttribute('aria-label','Choose '+defaultAvatars[person].label+' avatar');const portrait=document.createElement('img');portrait.src=defaultAvatarSource(person);portrait.alt='';portrait.style.cssText='width:150px;height:150px;object-fit:contain';option.append(portrait)}}),'flat',35);choose.style.color='#fa60ac';choose.style.fontWeight='600';
 a.setAttribute('role','button');a.setAttribute('aria-label','Choose profile avatar');a.setAttribute('tabindex','0');a.style.cursor='pointer';a.onclick=()=>choose.click();a.onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();choose.click()}};
 box(30,818,788,575,'white',54);
 text('Nickname',77,875,680,35,'strong').style.fontWeight='650';
 const name=element('input','profile-input',75,944,698,97);name.placeholder='Your nickname';name.value=model.profile?.name||'Emma';
 text('Your phone number',77,1109,690,35,'strong').style.fontWeight='650';
 box(75,1177,698,99,'profile-phone',35);button('+1',91,1198,105,55,()=>sheet('Country code',(p,close)=>{for(const [name,code] of countryCallingCodes)action(p,name+' '+code,()=>{document.getElementById('profile-code').textContent=code;close()})}),'flat',34).id='profile-code';box(204,1199,2,57,'divider');
 const phone=element('input','profile-phone-input',241,1197,502,61);phone.type='tel';phone.placeholder='Enter phone number';phone.value=model.profile?.phone||'';
 text('Use your own phone number to connect with friends.',77,1298,710,28,'muted');
 const next=button('Continue',45,1524,758,120,()=>{if(!name.value.trim()||phone.value.replace(/\D/g,'').length<7){toast('Enter your nickname and phone number');return}model.profile={name:name.value.trim(),phone:phone.value,avatar:selectedAvatar};if(saveModel())go('location')},'primary',43);next.style.fontWeight='500';
 const foot=text('You can edit your profile later.',80,1681,688,28,'muted');foot.style.textAlign='center';box(274,1818,300,12,'home-indicator',20);
}
pages.profile='Your profile';
const legacySetup=setupPage,legacyActive=activePage;
setupPage=function(){legacySetup();screen.querySelectorAll('[data-check]').forEach(im=>{if(!model.friends.includes(im.dataset.check)){chosen.delete(im.dataset.check)}});screen.querySelectorAll('button[aria-label^="Select "]').forEach(b=>{if(!model.friends.includes(b.getAttribute('aria-label').slice(7)))b.disabled=true});if(!model.friends.length){toast('Bind a friend before setting up SOS');button('Add friend',44,360,760,70,addFriend,'primary',30)}};
activePage=function(){legacyActive();const names=readSettings()?.recipients||[];for(const n of names){const e=Array.from(screen.querySelectorAll('.text')).find(e=>e.textContent===n);if(e&&localStorage.getItem('receipt-'+n))e.nextElementSibling.textContent='Confirmed'}};

// Keep only currently bound SOS recipients, including when opening an old URL.
const previousReadSettings=readSettings;
readSettings=function(){const s=previousReadSettings();if(!s)return null;const recipients=s.recipients.filter(n=>model.friends.includes(n));return recipients.length?{...s,recipients}:null};
const previousEnterSOS=enterSOS;
enterSOS=function(){if(!model.friends.length){addFriend();return}previousEnterSOS()};
const previousCountdown=countdownPage;
countdownPage=function(){if(!readSettings()&&!freeze){setupPage();return}previousCountdown()};
const previousActive=activePage;
activePage=function(){if(!readSettings()&&!freeze){setupPage();return}previousActive()};
// A first visit starts profile completion; completed profiles enter Location.
const previousLocation=locationPage;
locationPage=function(){if(!model.profile){profilePage();return}previousLocation()};

// Personal settings and friend details are separate views.
function detailShell(title){screen.replaceChildren();screen.classList.remove('profile-screen');status();back(()=>{page='location';redraw()});const heading=text(title,160,153,528,42,'strong');heading.style.textAlign='center';indicator()}
function settingsPage(){
 detailShell('Settings');const profile=model.profile||{};
 const content=element('div','settings-content',44,300,760,1380);
 const card=document.createElement('section');card.className='settings-profile-card';content.append(card);
 const portrait=document.createElement('img');portrait.src=profile.avatarImage||defaultAvatarSource(profile.avatar);portrait.alt='Your avatar';card.append(portrait);
 const name=document.createElement('h2');name.textContent=profile.name||'Your name';card.append(name);
 const phone=document.createElement('p');phone.textContent=(profile.country||'+1')+' '+(profile.phone||'Not set');card.append(phone);
 const edit=document.createElement('button');edit.className='settings-edit';edit.textContent='Edit profile';edit.onclick=()=>profilePage();card.append(edit);
 const menu=document.createElement('section');menu.className='settings-menu';content.append(menu);
 for(const label of ['Privacy Policy','Terms of Use','Contact Us']){
 const row=document.createElement('button');row.className='settings-menu-row';const title=document.createElement('span');title.textContent=label;const chevron=document.createElement('img');chevron.src=A+'chevron.png';chevron.alt='';row.append(title,chevron);row.onclick=()=>sheet(label,p=>paragraph(p,label==='Contact Us'?'Contact details will be available here.':'This prototype does not include the final '+label.toLowerCase()+'.'));menu.append(row);
 }
 const version=document.createElement('p');version.className='settings-version';version.textContent='Version 1.0.0';content.append(version);
}
function memberInfo(name){
 return demoContacts[name]?.info||({'John Smith':{address:'Anderson, AK 99744, US',network:'Wi-Fi',updated:'Just now',battery:'87%'},Emma:{address:'At home',network:'Wi-Fi',updated:'2 min ago',battery:'95%'},Alex:{address:'At work',network:'Mobile data',updated:'5 min ago',battery:'72%'}})[name]||null;
}
function friendDetails(name){
 detailShell('Profile');const shellNodes=new Set(screen.children);const own=isSelf(name);const bound=model.friends.includes(name);const info=(own||bound)?memberInfo(name):null;
 const portrait=element('img','friend-profile-avatar',334,300,180,180);portrait.src=memberAvatarSource(name);portrait.alt=name+' avatar';portrait.style.borderRadius='50%';portrait.style.objectFit='cover';
 const title=text(own?(model.profile?.name||name):name,60,518,728,44,'strong');title.style.textAlign='center';
 const number=demoContacts[name]?'+1 '+demoContacts[name].phone:own?(model.profile?.country||'+1')+' '+(model.profile?.phone||'Not set'):'';
 if(number){const phone=text(number,60,581,728,30,'muted');phone.style.textAlign='center'}
 const content=element('div','friend-profile-info',44,700,760,650);
 if(info){
 const location=document.createElement('div');location.className='friend-location';const pin=document.createElement('img');pin.src=A+'pin.png';pin.alt='';const address=document.createElement('strong');address.textContent=info.address;location.append(pin,address);content.append(location);
 const stats=document.createElement('div');stats.className='friend-stats';content.append(stats);
 for(const [icon,value,label] of [[info.network==='Wi-Fi'?'wifi':'signal',info.network,'Network'],['refresh',info.updated,'Updated'],['battery',info.battery,'Battery']]){const stat=document.createElement('div');stat.className='friend-stat';stat.setAttribute('aria-label',label+': '+value);const image=document.createElement('img');image.src=A+icon+'.png';image.alt='';const text=document.createElement('span');text.textContent=value;stat.append(image,text);stats.append(stat)}
 appendProfileToday(content,name);
 }else{const empty=document.createElement('div');empty.className='friend-location friend-no-location';const pin=document.createElement('img');pin.src=A+'pin.png';pin.alt='';const label=document.createElement('span');label.textContent='Location unavailable';empty.append(pin,label);content.append(empty)}
 if(own){finishProfileScroll();return;}
 const friendAction=button(bound?'Remove friend':'Add friend',44,1480,760,108,()=>{
 if(bound){sheet('Remove '+name+'?',p=>{action(p,'Remove friend',()=>{model.friends=model.friends.filter(n=>n!==name);if(model.selected===name)model.selected='You';if(model.pickerSelected===name)model.pickerSelected='John';if(saveModel()){document.querySelector('.product-shade')?.remove();page='location';redraw()}});action(p,'Cancel',()=>document.querySelector('.product-shade')?.remove())})}
 else{if(!model.friends.includes(name))model.friends.push(name);if(saveModel()){friendDetails(name);toast('Added to Friends')}}
 },bound?'remove-friend':'primary',36);
 friendAction.classList.remove('pos');friendAction.style.cssText='position:relative;width:100%;height:108px;flex-shrink:0;margin-top:24px';content.append(friendAction);
 finishProfileScroll();
 function finishProfileScroll(){
  content.style.height='auto';
  const nodes=[...screen.children].filter(e=>!shellNodes.has(e));
  const scroll=box(0,260,848,1500,'friend-page-scroll');
  const inner=document.createElement('div');inner.style.position='relative';scroll.append(inner);
  for(const node of nodes){node.style.top=(parseFloat(node.style.top)-260)+'px';inner.append(node)}
  portrait.style.cssText+=';top:8px;left:354px;width:140px;height:140px';title.style.top='172px';const phone=nodes.find(e=>e!==title&&e.classList.contains('muted'));if(phone)phone.style.top='234px';content.style.top='314px';const resize=()=>inner.style.height=(314+content.scrollHeight+60)+'px';resize();const observer=new ResizeObserver(resize);observer.observe(content);
 }
}
function appendProfileToday(content,name){
 const heading=label=>{const h=document.createElement('h2');h.className='profile-section-title';h.textContent=label;content.append(h);return h};
 const routeHeading=heading('Today’s route');
 const route=document.createElement('section');route.className='profile-today-route';content.append(route);
 for(const record of historyRecords(name,0)){
  const row=document.createElement('div');row.className='history-record-row';
  const time=document.createElement('span');time.className='history-record-time';time.textContent=record.time;
  const dot=document.createElement('span');dot.className='history-record-dot';
  const icon=document.createElement('img');icon.src=A+(record.icon?'history-'+record.icon:'setup-pin')+'.png';icon.alt='';
  const label=document.createElement('strong');label.textContent=record.name;row.append(time,dot,icon,label);route.append(row);
 }
 const rows=[...route.children];rows.slice(2).forEach(row=>row.hidden=true);
 if(rows.length>2){const toggle=document.createElement('button');toggle.className='profile-route-toggle';toggle.setAttribute('aria-expanded','false');const label=document.createElement('span');label.textContent='Show all';const arrow=document.createElement('img');arrow.src=A+'chevron.png';arrow.alt='';toggle.append(label,arrow);routeHeading.append(toggle);toggle.onclick=()=>{const expanded=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(expanded));label.textContent=expanded?'Show less':'Show all';rows.slice(2).forEach(row=>row.hidden=!expanded)}}
 heading('Today’s overview');
 const before=new Set(screen.children);renderOverviewCards();
 const cards=document.createElement('section');cards.className='profile-overview-cards';content.append(cards);
 for(const node of [...screen.children].filter(e=>!before.has(e))){node.style.left=(parseFloat(node.style.left)-41)+'px';node.style.top=(parseFloat(node.style.top)-558)+'px';cards.append(node)}
 cards.firstElementChild.style.height='210px';cards.style.height='1158px';for(const node of cards.children){const y=parseFloat(node.style.top);if(y>=279)node.style.top=(y-69)+'px';if(node.hasAttribute('data-screen-time')){node.style.fontSize='66px';node.style.top='94px'}}cards.firstElementChild.style.background='#fff0f7';for(const node of cards.children){const top=parseFloat(node.style.top);if(top<279&&node.classList.contains('text'))node.style.color=top===100?'#ec3d98':'#28252a';if(top<279&&node.tagName==='IMG'){node.style.filter='brightness(0)';node.style.opacity='.45'}if(node.textContent==='Today’s phone usage')node.remove()}
}

const editProfilePage=profilePage;
profilePage=function(onboarding=false){screen.replaceChildren();screen.classList.remove('profile-screen');editProfilePage(onboarding);if(model.profile&&!onboarding)back(()=>settingsPage());const code=screen.querySelector('#profile-code');if(code)code.textContent=model.profile?.country||'+1';const save=[...screen.querySelectorAll('button')].find(b=>b.textContent==='Continue');if(save){save.textContent=model.profile&&!onboarding?'Save':'Continue';save.onclick=()=>{const name=screen.querySelector('.profile-input');const phone=screen.querySelector('.profile-phone-input');if(!name.value.trim()||phone.value.replace(/\D/g,'').length<7){toast('Enter your nickname and phone number');return}const portrait=screen.querySelector('.emoji-avatar');model.profile={name:name.value.trim(),phone:phone.value,country:code.textContent,avatar:portrait.dataset.avatar||'neutral',avatarImage:portrait.dataset.upload||''};if(saveModel()){if(onboarding)go('overview');else settingsPage()}}}};

async function readAvatarUpload(file){
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Choose a JPG, PNG or WebP image');
 if(file.size>10*1024*1024)throw new Error('Choose an image under 10 MB');
 const url=URL.createObjectURL(file);
 try{const img=new Image();img.src=url;await img.decode();const canvas=document.createElement('canvas');const scale=Math.min(1,512/Math.max(img.naturalWidth,img.naturalHeight));canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);return canvas.toDataURL('image/png')}
 catch{throw new Error('Could not read this image. Try another photo')}
 finally{URL.revokeObjectURL(url)}
}

function initPhoneSearch(form,phone){
 let selected='+1';
 const country=document.createElement('button');country.type='button';country.className='country-trigger';country.hidden=true;country.setAttribute('aria-label','Country code');country.setAttribute('aria-haspopup','listbox');country.setAttribute('aria-expanded','false');
 const value=document.createElement('span');value.textContent=selected;const arrow=document.createElement('img');arrow.src=A+'chevron.png';arrow.alt='';country.append(value,arrow);form.prepend(country);
 const menu=document.createElement('div');menu.className='country-menu';menu.hidden=true;menu.setAttribute('role','listbox');menu.setAttribute('aria-label','Country codes');form.append(menu);
 const closeMenu=()=>{menu.hidden=true;country.setAttribute('aria-expanded','false')};
 const collapse=()=>{closeMenu();country.hidden=true;phone.placeholder='Find by phone number';form.classList.remove('is-editing')};
 const expand=()=>{country.hidden=false;phone.placeholder='Phone number';form.classList.add('is-editing')};
 const rows=[];
 for(const [name,code] of countryCallingCodes){
 const row=document.createElement('button');row.type='button';row.className='country-option';row.setAttribute('role','option');row.setAttribute('aria-selected',String(code===selected));const label=document.createElement('span');label.textContent=name;const number=document.createElement('span');number.textContent=code;row.append(label,number);menu.append(row);rows.push(row);
 row.onclick=()=>{selected=code;value.textContent=code;rows.forEach(r=>r.setAttribute('aria-selected',String(r===row)));closeMenu();phone.focus()};
 }
 country.onclick=()=>{const opening=menu.hidden;menu.hidden=!opening;country.setAttribute('aria-expanded',String(opening));if(opening)(rows.find(r=>r.getAttribute('aria-selected')==='true')||rows[0]).focus()};
 phone.onfocus=expand;
 form.addEventListener('focusout',()=>setTimeout(()=>{if(form.isConnected&&!form.contains(document.activeElement))collapse()},0));
 form.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();document.activeElement?.blur();collapse()}if(!menu.hidden&&['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();const index=rows.indexOf(document.activeElement);rows[(index+(event.key==='ArrowDown'?1:-1)+rows.length)%rows.length].focus()}});
 const outside=event=>{if(!form.isConnected){document.removeEventListener('pointerdown',outside);return}if(!form.contains(event.target))collapse()};document.addEventListener('pointerdown',outside);
 form.onsubmit=event=>{event.preventDefault();if(!phone.value.trim()){expand();phone.focus();return}searchFriend(phone.value,selected)};
}

// Route older dialogs through the same approved bottom-sheet component.
dialog=function(title,choices){sheet(title,(panel,close)=>{for(const [label,fn] of choices)action(panel,label,()=>{close();fn?.()})})};

const collapsedPlaces=new Set();
function renderMapPlaces(){

 const toggle=hit('Show places',267,907,96,96,()=>{model.showPlaces=!model.showPlaces;if(saveModel()){redraw();if(model.showPlaces&&!(model.places||[]).length){locationListTab='places';redraw();toast('No saved places yet. Add a place below.')}}});
 toggle.classList.add('map-places-toggle','map-control-circle');const controlIcon=document.createElement('img');controlIcon.src=A+'map-control-places.png';controlIcon.alt='';toggle.append(controlIcon);toggle.setAttribute('aria-pressed',String(!!model.showPlaces));
 if(!model.showPlaces)return;
 const layer=element('div','saved-place-markers',0,253,848,630);layer.setAttribute('aria-label','Saved places on map');
 for(const [index,place] of (model.places||[]).entries()){
 const point=place.mapPoint||{x:200+(index%3)*210,y:500+Math.floor(index/3)*180};
 const marker=document.createElement('button');marker.className='saved-place-marker';marker.style.left=Math.max(70,Math.min(730,point.x))+'px';marker.style.top=Math.max(40,Math.min(550,(point.y-260)/1140*550))+'px';marker.setAttribute('aria-label','Place: '+place.name);
 const icon=document.createElement('img');icon.src=placeIconSource(place.type);icon.alt='';const label=document.createElement('span');label.textContent=place.name;marker.append(icon,label);layer.append(marker);
 marker.onclick=()=>sheet(place.name,p=>{paragraph(p,place.address)});
 const key=String(place.id??index);const dot=document.createElement('button');dot.className='saved-place-dot-toggle';const compactIcon=icon.cloneNode();dot.append(compactIcon);dot.style.left=marker.style.left;dot.style.top=(parseFloat(marker.style.top)+60)+'px';dot.setAttribute('aria-label','Toggle '+place.name+' place label');const apply=()=>{marker.hidden=collapsedPlaces.has(key);dot.classList.toggle('is-collapsed',marker.hidden);dot.setAttribute('aria-expanded',String(!marker.hidden))};dot.onclick=()=>{if(collapsedPlaces.has(key))collapsedPlaces.delete(key);else collapsedPlaces.add(key);apply()};layer.append(dot);apply();

 }
}

let routeDay=0;
function routeDate(offset){const d=new Date();d.setDate(d.getDate()-offset);return d.toLocaleDateString('en-US',{month:'short',day:'numeric'})}
function historyMemberPicker(){
 const existing=screen.querySelector('.history-picker-shade');if(existing){existing.remove();return}
 const trigger=screen.querySelector('[aria-label="Switch history user"]');trigger?.setAttribute('aria-expanded','true');
 const shade=element('div','member-picker-shade history-picker-shade',0,0,848,1855);const menu=document.createElement('div');menu.className='compact-member-menu';menu.style.cssText='left:508px;top:245px;width:300px';menu.setAttribute('role','listbox');menu.setAttribute('aria-label','History user');shade.append(menu);
 const close=()=>{shade.remove();trigger?.setAttribute('aria-expanded','false');trigger?.focus()};
 for(const name of locationMembers()){const row=document.createElement('button');row.className='compact-member-row'+(name===(model.selected||'John Smith')?' is-selected':'');row.setAttribute('role','option');row.setAttribute('aria-selected',String(name===model.selected));const img=document.createElement('img');img.src=memberAvatarSource(name);img.alt='';const label=document.createElement('span');label.textContent=memberDisplayName(name);row.append(img,label);menu.append(row);row.onclick=()=>{model.selected=name;if(saveModel()){close();redraw()}}}
 shade.onclick=e=>{if(e.target===shade)close()};shade.onkeydown=e=>{if(e.key==='Escape')close()};menu.querySelector('button')?.focus();
}
function historyRecords(name,day){
 if(!['John Smith','Emma','Alex','Mia','Ryan'].includes(name))return [];
 const shift=['John Smith','Emma','Alex'].indexOf(name);
 const places=[{name:'Home',icon:'home',x:150,y:500},{name:'Market',icon:'market',x:410,y:290},{name:'Office',icon:'office',x:690,y:100},{name:'123 Oak Street',icon:null,x:280,y:170},{name:'456 Pine Street',icon:null,x:620,y:430},{name:'789 Maple Street',icon:null,x:180,y:330}];
 return (day%2===0?[0,1,2,3,4,5]:[0,2,3,5]).map((placeIndex,i)=>({...places[placeIndex],time:(11-i)+':'+(day%2?'32':'17')+' AM',day}));
}
function renderSelectableHistory(){
 original.history();const name=locationMembers().includes(model.selected)?model.selected:'John Smith';
 screen.querySelector('[aria-label="Choose history date"]')?.remove();screen.querySelector('img[src="assets/calendar.png"]')?.remove();
 const heading=[...screen.querySelectorAll('.text')].find(e=>e.textContent==='Location history');heading.style.width='400px';heading.style.fontSize='41px';
 const switcher=button('',null,134,null,88,historyMemberPicker,'soft-button history-user-trigger');Object.assign(switcher.style,{position:'absolute',top:'140px',right:'40px',height:'88px',width:'max-content',maxWidth:'300px'});switcher.setAttribute('aria-label','Switch history user');switcher.setAttribute('aria-haspopup','listbox');switcher.setAttribute('aria-expanded','false');
 const portrait=document.createElement('img');portrait.src=memberAvatarSource(name);portrait.alt='';const label=document.createElement('span');label.textContent=memberDisplayName(name);const arrow=document.createElement('img');arrow.src=A+'chevron.png';arrow.alt='';switcher.append(portrait,label,arrow);
 const title=[...screen.querySelectorAll('.text')].find(e=>e.textContent==='John’s route');title.textContent=name.split(' ')[0]+"’s route";
 for(const child of [...screen.children]){const y=parseFloat(child.style.top);if(y>=969&&y<=993)child.remove()}
 for(const [label,x,key] of [['Past 7 days',51,7],['Yesterday',305,1],['Today',559,0]]){const tab=button(label,x,969,238,86,()=>{routeDay=key;redraw()},routeDay===key?'pink':'flat',30);tab.style.borderRadius='27px';tab.setAttribute('aria-pressed',String(routeDay===key))}
 for(const e of [...screen.children]){const y=parseFloat(e.style.top);if(y>=1198&&y<1670&&!e.classList.contains('tabbar'))e.remove()}
 const list=box(44,1198,760,472,'restored-history-scroll');const days=routeDay===7?[0,1,2,3,4,5,6]:[routeDay];const records=days.flatMap(day=>historyRecords(name,day));
 for(const day of days){const rows=historyRecords(name,day);if(!rows.length)continue;const group=document.createElement('section');group.className='history-record-day';list.append(group);if(routeDay===7){const h=document.createElement('h3');h.className='history-day-heading';h.textContent=day===0?'Today':day===1?'Yesterday':routeDate(day);group.append(h)}rows.forEach(record=>{const row=document.createElement('button');row.type='button';row.className='history-record-row';row.dataset.place=record.name;row.setAttribute('aria-label','Locate '+record.name+' '+routeDate(day)+' '+record.time);row.setAttribute('aria-pressed','false');row.onclick=()=>focusHistoryPlace(record,row);const time=document.createElement('span');time.className='history-record-time';time.textContent=record.time;const dot=document.createElement('span');dot.className='history-record-dot';const icon=document.createElement('img');icon.src=A+(record.icon?'history-'+record.icon:'setup-pin')+'.png';icon.alt='';const text=document.createElement('strong');text.textContent=record.name;row.append(time,dot,icon,text);group.append(row)})}
 // Preserve the approved map at its original scale; reuse cropped original marker artwork.
 const oldMap=screen.querySelector('img[src="assets/map-history.png"]');oldMap.src=A+'map-history-clean.png';screen.querySelector('.emoji-avatar')?.remove();
 const map=box(0,253,848,631,'history-exact-map');oldMap.after(map);map.setAttribute('aria-label','Route map for '+name);
 const unique=[...new Map(records.map(r=>[r.name,r])).values()];
 const slots=[[148,496],[398,261],[689,87],[590,470],[260,140],[490,110]];
 const display=unique.length?unique:[];
 display.forEach((record,index)=>{const pos=[record.x,record.y];const marker=document.createElement('button');marker.type='button';marker.className='history-exact-marker';marker.style.left=pos[0]+'px';marker.style.top=pos[1]+'px';marker.dataset.place=record.name;if(pos[0]>550)marker.classList.add('label-left');const icon=document.createElement('img');icon.className='history-exact-icon';icon.src=A+(record.icon==='office'?'history-map-halo':record.icon==='home'?'history-map-home':record.icon==='market'?'history-map-market':'history-map-address')+'.png';icon.alt='';marker.append(icon);if(record.icon==='office'){marker.classList.add('is-person');const avatar=document.createElement('img');avatar.className='history-exact-avatar';avatar.src=memberAvatarSource(name);avatar.alt=name;marker.append(avatar)}const dot=document.createElement('span');dot.className='history-exact-dot';marker.setAttribute('aria-label','Locate '+record.name+' in route');marker.onclick=()=>{const row=[...list.querySelectorAll('.history-record-row')].find(r=>r.dataset.place===record.name);if(!row)return;focusHistoryPlace(record,row);const target=list.scrollTop+(row.getBoundingClientRect().top-list.getBoundingClientRect().top)/(list.getBoundingClientRect().width/list.offsetWidth);list.scrollTo({top:Math.max(0,target-(list.clientHeight-row.offsetHeight)/2),behavior:'smooth'})};marker.append(dot);map.append(marker)});
 const viewport=box(0,253,848,631,'history-map-viewport');oldMap.before(viewport);const scene=document.createElement('div');scene.className='history-map-scene';viewport.append(scene);oldMap.style.top='0px';oldMap.style.left='0px';map.style.top='0px';scene.append(oldMap,map);
 function focusHistoryPlace(record,row){const scale=1.45;const dx=Math.max(848-848*scale,Math.min(0,424-record.x*scale));const dy=Math.max(631-631*scale,Math.min(0,315-(record.y+50)*scale));scene.style.transform='translate('+dx+'px,'+dy+'px) scale('+scale+')';for(const marker of map.querySelectorAll('.history-exact-marker'))marker.classList.toggle('is-locked',marker.dataset.place===record.name);list.querySelectorAll('.history-record-row').forEach(r=>r.setAttribute('aria-pressed',String(r===row)))}
 let stopReplay=()=>{};
 const replay=screen.querySelector('[aria-label="Replay history"]');replay.disabled=!records.length;
 replay.onclick=()=>{
  stopReplay();scene.style.transform='none';map.querySelectorAll('.is-locked').forEach(m=>m.classList.remove('is-locked'));list.querySelectorAll('.history-record-row').forEach(r=>r.setAttribute('aria-pressed','false'));
  const points=[...records].reverse();
  const ns='http://www.w3.org/2000/svg';const trail=document.createElementNS(ns,'svg');
  trail.classList.add('history-replay-trail');trail.setAttribute('viewBox','0 0 848 631');trail.setAttribute('aria-hidden','true');
  const line=document.createElementNS(ns,'polyline');line.setAttribute('fill','none');line.setAttribute('stroke','#f62498');line.setAttribute('stroke-width','7');line.setAttribute('stroke-linecap','round');line.setAttribute('stroke-linejoin','round');trail.append(line);map.append(trail);
  const dot=document.createElement('span');dot.className='history-replay-dot';map.append(dot);
  const duration=Math.max(8000,(points.length-1)*1500);let frame;const started=performance.now();
  stopReplay=()=>{cancelAnimationFrame(frame);trail.remove();dot.remove();replay.setAttribute('aria-pressed','false')};
  replay.setAttribute('aria-pressed','true');
  function tick(now){
   if(!map.isConnected){stopReplay();return}
   const progress=Math.min(1,(now-started)/duration);
   const position=progress*(points.length-1),index=Math.min(Math.floor(position),points.length-1),fraction=position-index;
   const from=points[index],to=points[Math.min(index+1,points.length-1)];
   const x=from.x+(to.x-from.x)*fraction,y=from.y+(to.y-from.y)*fraction;
   line.setAttribute('points',[...points.slice(0,index+1).map(p=>p.x+','+p.y),x+','+y].join(' '));
   dot.style.transform='translate('+(x-12)+'px,'+(y-12)+'px)';
   if(progress===1){stopReplay();return}frame=requestAnimationFrame(tick);
  }
  tick(started);
 };

 if(!records.length){const empty=document.createElement('p');empty.className='history-empty';empty.textContent='No location history';list.append(empty)}
}


function ensureSelfIdentity(){
 if(model.selfKey)return;
 const name=(model.profile?.name||'').trim().toLowerCase();model.selfKey=name==='emma'?'Emma':name==='alex'?'Alex':'John Smith';
 model.friends=(model.friends||[]).filter(n=>n!==model.selfKey);
 if(model.selfKey!=='John Smith'&&!model.friends.includes('John Smith'))model.friends.unshift('John Smith');saveModel();
}
function isSelf(name){ensureSelfIdentity();return String(name).toLowerCase().replace(' smith','')===model.selfKey.toLowerCase().replace(' smith','')}
function memberDisplayName(name){return isSelf(name)?'Me':name}
function locationMembers(){ensureSelfIdentity();return [...new Set([model.selfKey,...model.friends])]}
function memberAvatarSource(name){if(isSelf(name))return model.profile?.avatarImage||defaultAvatarSource(model.profile?.avatar||'neutral');const key=String(name).toLowerCase();return defaultAvatarSource(defaultAvatars[key]?key:(name==='John Smith'||name==='John'?'alex':'emma'))}
const memberExpanded={};
function renderMemberMarkers(){
 for(const n of ['Emma','John Smith','Alex'])screen.querySelector('[aria-label="'+n+' location"]')?.remove();
 const positions={'Emma':[183,511,0,550],'John Smith':[514,633,210,659],'Alex':[723,829,613,704],'Taylor':[570,420,470,455],'Mia':[340,330,240,365],'Ryan':[650,560,530,595]};
 for(const [i,name] of locationMembers().entries()){
 const [x,y,preferredLeft,oldTop]=positions[name]||[300+i*60,450,200+i*60,490];
 // Fixed marker geometry: 37px dot, 8px clear gap, 14px pointer, 100px card.
 const width=name==='John Smith'?332:220;const above=y<oldTop;const top=above?y+40.5:y-140.5;
 const left=Math.max(0,Math.min(848-width,Math.max(x-width+52,Math.min(preferredLeft,x-52))));const own=isSelf(name);if(memberExpanded[name]===undefined)memberExpanded[name]=true;
 const dot=button('',x-36,y-36,72,72,()=>{memberExpanded[name]=!memberExpanded[name];update()},'member-map-point');dot.setAttribute('aria-label','Toggle '+name+' location information');
 const bubble=button('',left,top,width,100,()=>friendDetails(name),'member-map-bubble'+(own?' is-self':''));bubble.setAttribute('aria-label',name+' location');bubble.style.setProperty('--pointer-x',(x-left)+'px');bubble.classList.add(above?'pointer-top':'pointer-bottom');
 const portrait=document.createElement('img');portrait.src=memberAvatarSource(name);portrait.alt='';const info=document.createElement('span');info.className='member-map-copy';const title=document.createElement('strong');title.textContent=memberDisplayName(name);const sub=document.createElement('small');sub.textContent=name==='John Smith'?'Anderson · Updated now':memberInfo(name)?.address||'Location unavailable';info.append(title,sub);bubble.append(portrait,info);
 const compact=button('',x-40,y-40,80,80,()=>{memberExpanded[name]=true;update()},'member-map-compact'+(own?' is-self':''));compact.setAttribute('aria-label','Expand '+name+' location information');const photo=portrait.cloneNode();compact.append(photo);
 const update=()=>{dot.hidden=!memberExpanded[name];bubble.hidden=!memberExpanded[name];compact.hidden=memberExpanded[name];dot.setAttribute('aria-expanded',String(memberExpanded[name]))};update();
 }
}
