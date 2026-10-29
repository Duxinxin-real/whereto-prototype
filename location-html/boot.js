const renderers={};for(const key of Object.keys(pages)){if(typeof window[key+'Page']==='function')renderers[key]=window[key+'Page'];}
if(page==='profile')profilePage(params.has('onboarding'));else (renderers[page]||locationPage)();
const capture=params.has('capture');if(capture)document.body.classList.add('capture');
function resize(){const mobile=innerWidth<=600;const width=capture?innerWidth:mobile?innerWidth:Math.min(430,(innerHeight-36)*848/1855);const ratio=width/848;screen.style.transform=`scale(${ratio})`;const vp=document.getElementById('viewport');vp.style.width=width+'px';vp.style.height=1855*ratio+'px'}
addEventListener('resize',resize);resize();

// Keep the phone shell mounted for tabs and the complete SOS flow.
const primaryTabs=new Set(['overview','location','history']);
const routedPages=new Set([...primaryTabs,'setup','countdown','active','emergency']);
const tabScrollPositions={};
function switchTab(next,push=true){
 if(!routedPages.has(next)||next===page)return;
 tabScrollPositions[page]=[...screen.querySelectorAll('.member-scroll,.overview-scroll')].map(e=>e.scrollTop);
 page=next;document.body.dataset.page=next;screen.setAttribute('aria-label',pages[next]);document.title=pages[next]+' · Location UI';
 if(push){const url=new URL(location.protocol==='file:'?location.href:next+'.html',location.href);url.search=location.search;if(location.protocol==='file:')url.hash=next;history.pushState({page:next},'',url)}
 redraw();screen.querySelectorAll('.member-scroll,.overview-scroll').forEach((e,i)=>e.scrollTop=tabScrollPositions[next]?.[i]||0);
}
screen.addEventListener('click',event=>{
 const link=event.target.closest('.tabbar a');if(!link||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
 const next=new URL(link.href).pathname.split('/').pop().replace('.html','');if(!primaryTabs.has(next))return;
 event.preventDefault();switchTab(next);
});
addEventListener('popstate',()=>{const next=location.hash.slice(1)||location.pathname.split('/').pop().replace('.html','');if(routedPages.has(next))navigateInApp(next,false)});
// Decode the shared artwork ahead of the first tab change.
const tabArtwork=['map-location','map-history','map-controls-original','map-john-label','dark-texture','screen-phone','record-wifi','record-signal','record-call','calendar','home','chevron','switch-icon','system-light','system-dark','system-arrow'];
for(const key of primaryTabs)tabArtwork.push('nav-'+key,'nav-'+key+'-active');
const preloadedTabArtwork=tabArtwork.map(name=>{const img=new Image();img.src=A+name+'.png';img.decode().catch(()=>{});return img});

// Warm and retain SOS images; await decoding before replacing the current screen.
const sosArtwork=['sos-halo','call-pink','back','setup-check','setup-unchecked','setup-edit','setup-pin','setup-clock','countdown-close','countdown-settings','countdown-ring','location-gray','sos-bell','active-location','system-light','system-dark'];
const sosImages=sosArtwork.map(name=>{const img=new Image();img.src=A+name+'.png';return img});
const sosReady=Promise.all(sosImages.map(img=>img.decode().catch(()=>{})));
let navigationVersion=0;
async function navigateInApp(next,push=true){
 const version=++navigationVersion;
 if(timer){clearInterval(timer);timer=null}
 if(['setup','countdown','active','emergency'].includes(next))await sosReady;
 if(version!==navigationVersion)return;
 switchTab(next,push);
}
const documentGo=go;
go=function(next){if(routedPages.has(next))return navigateInApp(next);return documentGo(next)};

// Local prototype notification: accept commands only from this page's host frame.
let incomingSOSReturn='overview';
function returnIncomingSOS(){go(incomingSOSReturn)}
function showIncomingSOS(){
 screen.querySelector('.incoming-sos')?.remove();
 const banner=document.createElement('div');banner.className='incoming-sos';banner.setAttribute('role','status');
 const open=document.createElement('button');open.className='incoming-sos-open';open.setAttribute('aria-label','Open SOS from Emma');
 const portrait=document.createElement('img');portrait.src=memberAvatarSource('Emma');portrait.alt='';
 const copy=document.createElement('span');
 const appLabel=document.createElement('small');appLabel.textContent='WhereTo · now';
 const title=document.createElement('strong');title.textContent='Emma needs you';
 const message=document.createElement('span');message.textContent='SOS · Please reply to me ASAP!';
 copy.append(appLabel,title,message);open.append(portrait,copy);
 open.onclick=()=>{incomingSOSReturn=primaryTabs.has(page)?page:'overview';banner.remove();go('emergency')};
 const close=document.createElement('button');close.className='incoming-sos-close';close.textContent='×';close.setAttribute('aria-label','Dismiss SOS notification');close.onclick=()=>banner.remove();
 banner.append(open,close);screen.append(banner);
}
addEventListener('message',event=>{if(window.parent!==window&&event.source===window.parent&&event.data?.type==='whereto-demo-sos')showIncomingSOS()});

const defaultAvatarPreloads=Object.keys(defaultAvatars).map(key=>{const img=new Image();img.src=defaultAvatarSource(key);img.decode().catch(()=>{});return img});
