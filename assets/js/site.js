import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const qs = (s, r=document)=>r.querySelector(s);
const qsa = (s, r=document)=>[...r.querySelectorAll(s)];
const path = (obj, p)=>p.split('.').reduce((a,k)=>a?.[k], obj);
const esc = (v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let state = { data:null, gallery:[], certificates:[], posts:[], filter:'All' };

async function loadStarter(){
  const res = await fetch('data/profile.json',{cache:'no-store'});
  if(!res.ok) throw new Error('Starter profile not found');
  return res.json();
}
async function loadLive(){
  const starter = await loadStarter();
  let data = starter;
  try{
    const { data: row, error } = await supabase.from('site_settings').select('content').eq('id','main').maybeSingle();
    if(error) throw error;
    if(row?.content) data = row.content;
  }catch(e){ console.warn('Using starter content because Supabase site_settings was unavailable.', e.message); }
  state.data = data;
  try{
    const [g,c,p] = await Promise.all([
      supabase.from('gallery').select('*').eq('published',true).order('sort_order',{ascending:true}).order('created_at',{ascending:false}),
      supabase.from('certificates').select('*').eq('published',true).order('sort_order',{ascending:true}).order('created_at',{ascending:false}),
      supabase.from('posts').select('*').eq('published',true).order('created_at',{ascending:false}).limit(6)
    ]);
    if(!g.error) state.gallery = g.data || [];
    if(!c.error) state.certificates = c.data || [];
    if(!p.error) state.posts = p.data || [];
  }catch(e){ console.warn('Optional live lists unavailable', e.message); }
}

function bootInteractions(){
  qs('[data-year]').textContent = new Date().getFullYear();
  const navBtn = qs('[data-nav-toggle]'), navLinks = qs('[data-nav-links]');
  navBtn?.addEventListener('click',()=>{ const open = navLinks.classList.toggle('open'); navBtn.setAttribute('aria-expanded', String(open)); });
  qsa('.nav-links a').forEach(a=>a.addEventListener('click',()=>navLinks?.classList.remove('open')));
  const savedTheme = localStorage.getItem('abs-theme'); if(savedTheme) document.documentElement.dataset.theme = savedTheme;
  qs('[data-theme-toggle]')?.addEventListener('click',()=>{ const next = document.documentElement.dataset.theme === 'dark' ? 'light':'dark'; document.documentElement.dataset.theme = next; localStorage.setItem('abs-theme', next); });
  window.addEventListener('scroll',()=>{ const max = document.documentElement.scrollHeight - innerHeight; qs('[data-progress]').style.width = `${Math.max(0,Math.min(100,scrollY/max*100))}%`; updateActiveNav(); },{passive:true});
  window.addEventListener('pointermove',e=>{ const g=qs('[data-glow]'); if(g) g.style.transform = `translate(${e.clientX-115}px, ${e.clientY-115}px)`; },{passive:true});
  const art = qs('[data-hero-art]'), frame=qs('[data-profile-frame]');
  frame?.addEventListener('pointerenter',()=>art?.classList.add('photo-hover'));
  frame?.addEventListener('pointerleave',()=>{ art?.classList.remove('photo-hover'); frame.style.removeProperty('--rx'); frame.style.removeProperty('--ry'); });
  frame?.addEventListener('pointermove',e=>{ const r=frame.getBoundingClientRect(); const x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5; frame.style.setProperty('--rx',`${(-y*7).toFixed(2)}deg`); frame.style.setProperty('--ry',`${(x*8).toFixed(2)}deg`); },{passive:true});
}
function updateActiveNav(){
  let active=''; ['about','experience','projects','skills','certificates','gallery','contact'].forEach(id=>{ const el=document.getElementById(id); if(el&&el.getBoundingClientRect().top<140) active=id; });
  qsa('.nav-links a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')===`#${active}`));
}
function hydrate(){
  qsa('[data-text]').forEach(el=>{ const v=path(state.data,el.dataset.text); if(v!==undefined&&v!==null) el.textContent=v; });
  const personal = state.data.personal || {};
  qs('[data-hero-tags]').innerHTML = (personal.heroTags||[]).map(t=>`<span class="tag">${esc(t)}</span>`).join('');
  qs('[data-hero-actions]').innerHTML = (personal.heroActions||[{label:'Explore Work',href:'#projects',style:'primary'},{label:'Collaborate',href:'#contact',style:'ghost'}]).map(a=>`<a class="button ${esc(a.style||'ghost')}" href="${esc(a.href||'#')}">${esc(a.label||'Action')}</a>`).join('');
  qsa('[data-paragraphs]').forEach(el=>{ el.innerHTML=(path(state.data,el.dataset.paragraphs)||[]).map(p=>`<p>${esc(p)}</p>`).join(''); });
  qsa('[data-list]').forEach(el=>{ el.innerHTML=(path(state.data,el.dataset.list)||[]).map(i=>`<li>${esc(i)}</li>`).join(''); });
  renderFloating(); renderStats(); renderFilters(); renderExperience(); renderProjects(); renderSkills(); renderAchievements(); renderEducation(); renderCertificates(); renderGallery(); renderPosts(); renderContactLinks(); setupProfileImage(); setupContactForm(); setupReveal(); setupLightbox();
}
function renderFloating(){
  const chips = (state.data.personal?.floatingChips || state.data.personal?.floatingLabels || []).filter(c => (typeof c === 'string' ? c : c.label)?.toUpperCase() !== 'SAF');
  const fallback = [[54,1],[8,8],[78,10],[9,23],[58,30],[80,24],[72,43],[6,62],[35,70],[55,76],[18,82],[48,96],[82,88],[60,84],[4,48],[94,56],[90,66]];
  qs('[data-floating-zone]').innerHTML = chips.map((raw,i)=>{ const o=typeof raw==='string'?{label:raw}:raw; const [fx,fy]=fallback[i%fallback.length]; const x=Number.isFinite(+o.x)?+o.x:fx, y=Number.isFinite(+o.y)?+o.y:fy, d=Number.isFinite(+o.delay)?+o.delay:(i%6)*.14; return `<span class="float-chip" style="--chip-x:${x}%;--chip-y:${y}%;--delay:${d}s;--away-x:${x<50?-130:130}px;--away-y:${y<50?-90:90}px">${esc(o.label)}</span>`; }).join('');
}
function renderStats(){ qs('[data-stats]').innerHTML = (state.data.stats||[]).map(s=>`<div class="stat"><strong>${esc(s.value)}</strong><span>${esc(s.label)}</span></div>`).join(''); }
function renderFilters(){ const cats=['All',...new Set((state.data.experiences||[]).map(e=>e.category).filter(Boolean))]; qs('[data-filters]').innerHTML=cats.map(c=>`<button class="filter ${c===state.filter?'active':''}" data-filter="${esc(c)}">${esc(c)}</button>`).join(''); qsa('[data-filter]').forEach(b=>b.addEventListener('click',()=>{state.filter=b.dataset.filter;renderFilters();renderExperience();setupReveal();})); }
function renderExperience(){ let items=state.data.experiences||[]; if(state.filter!=='All') items=items.filter(i=>i.category===state.filter); qs('[data-experience]').innerHTML=items.map(i=>`<article class="card reveal"><div class="card-kicker">${esc(i.category||'Experience')}</div><h3>${esc(i.title)}</h3><p class="org">${esc(i.organization||'')}</p><p class="period">${esc(i.period||'')}${i.location?` • ${esc(i.location)}`:''}</p><p>${esc(i.summary||'')}</p>${i.highlights?.length?`<details><summary>Key highlights</summary><ul>${i.highlights.map(h=>`<li>${esc(h)}</li>`).join('')}</ul></details>`:''}${tags(i.tags)}</article>`).join(''); }
function renderProjects(){ qs('[data-projects]').innerHTML=(state.data.projects||[]).map(i=>`<article class="project-card reveal">${i.image?`<img class="project-img" src="${esc(i.image)}" alt="${esc(i.title)}" loading="lazy">`:''}<span class="project-type">${esc(i.type||'Project')}</span><h3>${esc(i.title)}</h3><p>${esc(i.description||'')}</p>${tags(i.tools)}${i.link&&i.link!=='#'?`<a class="button soft" href="${esc(i.link)}" target="_blank" rel="noreferrer">View details</a>`:''}</article>`).join(''); }
function renderSkills(){ qs('[data-skills]').innerHTML=(state.data.skills||[]).map(g=>`<article class="skill-card"><h3>${esc(g.group)}</h3><ul>${(g.items||[]).map(i=>`<li>${esc(i)}</li>`).join('')}</ul></article>`).join(''); }
function renderAchievements(){ qs('[data-achievements]').innerHTML=(state.data.achievements||[]).map(a=>`<div class="achievement-item">${esc(a)}</div>`).join(''); }
function renderEducation(){ qs('[data-education]').innerHTML=(state.data.education||[]).map(i=>`<article class="edu-item reveal"><div><h3>${esc(i.degree)}</h3><p>${esc(i.institution)}</p>${i.details?.length?`<ul>${i.details.map(d=>`<li>${esc(d)}</li>`).join('')}</ul>`:''}</div><strong>${esc(i.period)}</strong></article>`).join(''); }
function renderCertificates(){
  const fallback = state.data.certificates || [];
  const items = state.certificates.length ? state.certificates.map(c=>({title:c.title,issuer:c.issuer,year:c.year,image:c.image_url,description:c.description,type:'Certificate'})) : fallback;
  qs('[data-certificates]').innerHTML = items.map((c,i)=>`<article class="cert-card reveal"><div class="cert-media">${c.image?`<img src="${esc(c.image)}" alt="${esc(c.title)}" loading="lazy">`:`<span class="cert-placeholder">C${i+1}</span>`}</div><span class="cert-type">${esc(c.type||'Certificate')}</span><h3>${esc(c.title)}</h3><p><strong>${esc(c.issuer||'')}</strong>${c.year?` • ${esc(c.year)}`:''}</p><p>${esc(c.description||'')}</p></article>`).join('');
}
function renderGallery(){
  const fallback = state.data.gallery || [];
  const items = state.gallery.length ? state.gallery.map(g=>({title:g.title,caption:g.caption,image:g.image_url})) : fallback;
  qs('[data-gallery]').innerHTML = items.map((g,i)=>`<article class="gallery-card reveal">${g.image?`<img src="${esc(g.image)}" alt="${esc(g.title||'Gallery photo')}" loading="lazy" data-full="${esc(g.image)}" data-caption="${esc(g.caption||g.title||'')}">`:`<span class="gallery-placeholder">0${i+1}</span>`}<h3>${esc(g.title||'Gallery item')}</h3><p>${esc(g.caption||'')}</p></article>`).join('');
}
function renderPosts(){ qs('[data-posts]').innerHTML = state.posts.length ? state.posts.map(p=>`<article class="post-card reveal">${p.image_url?`<img class="project-img" src="${esc(p.image_url)}" alt="${esc(p.title)}" loading="lazy">`:''}<h3>${esc(p.title)}</h3><p>${esc(p.body||'')}</p></article>`).join('') : `<article class="post-card reveal"><h3>No public updates yet</h3><p>Add posts from the private app when you are ready.</p></article>`; }
function renderContactLinks(){ const p=state.data.personal||{}; const links=[]; if(p.email)links.push({label:'Email',url:`mailto:${p.email}`}); if(p.phone)links.push({label:'Phone',url:`tel:${p.phone}`}); (p.socialLinks||[]).forEach(l=>{ if(l.url&&l.url!=='#')links.push(l); }); qs('[data-contact-links]').innerHTML = links.length ? links.map(l=>`<a href="${esc(l.url)}" target="${l.url.startsWith('http')?'_blank':'_self'}" rel="noreferrer">${esc(l.label)}</a>`).join('') : `<span class="tag">Add email and social links from the app</span>`; }
function setupProfileImage(){ const img=state.data.personal?.profileImage, box=qs('[data-profile-visual]'); if(img&&box) box.innerHTML = `<img src="${esc(img)}" alt="${esc(state.data.personal?.name||'Profile photo')}"><div class="scan"></div>`; }
function setupContactForm(){ const form=qs('[data-contact-form]'), note=qs('[data-form-note]'); form?.addEventListener('submit', async e=>{ e.preventDefault(); note.textContent='Sending...'; const fd=new FormData(form); const payload={name:fd.get('name'),email:fd.get('email'),message:fd.get('message')}; const {error}=await supabase.from('messages').insert(payload); if(error){ note.textContent='Message could not be sent. Please try again or contact by email.'; console.error(error); } else { form.reset(); note.textContent='Message sent. Thank you.'; } }); }
function setupLightbox(){ const d=qs('[data-lightbox]'), img=qs('[data-lightbox-img]'), cap=qs('[data-lightbox-caption]'); qsa('[data-full]').forEach(el=>el.addEventListener('click',()=>{ img.src=el.dataset.full; cap.textContent=el.dataset.caption||''; d.showModal(); })); qs('[data-lightbox-close]')?.addEventListener('click',()=>d.close()); }
function tags(items=[]){ return items?.length ? `<div class="mini-tags">${items.map(t=>`<span>${esc(t)}</span>`).join('')}</div>` : ''; }
function setupReveal(){ const io=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){e.target.classList.add('visible'); io.unobserve(e.target);} }),{threshold:.12}); qsa('.reveal:not(.visible)').forEach(el=>io.observe(el)); }

bootInteractions();
loadLive().then(hydrate).catch(err=>{ console.error(err); document.body.insertAdjacentHTML('afterbegin',`<div style="position:fixed;z-index:999;left:1rem;right:1rem;bottom:1rem;padding:1rem;border-radius:18px;background:#260b12;color:#ffd7df;border:1px solid #ff8aa1">Website data could not load. Check Supabase URL/key or open through Netlify/local server.</div>`); });
