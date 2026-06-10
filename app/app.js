import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_ANON_KEY, ADMIN_EMAIL } from '../assets/js/config.js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth:{ persistSession:true, autoRefreshToken:true } });
const qs=(s,r=document)=>r.querySelector(s); const qsa=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let site = null;
let current = { gallery:null, certificates:null, posts:null };

function status(msg, bad=false){ const el=qs('[data-status]'); if(el){ el.textContent=msg; el.style.color=bad?'#ffb3c3':'var(--muted)'; } }
async function starter(){ const r=await fetch('../data/profile.json',{cache:'no-store'}); return r.json(); }
async function getSite(){
  const {data,error}=await supabase.from('site_settings').select('content').eq('id','main').maybeSingle();
  if(error) throw error;
  site = data?.content || await starter();
  return site;
}
async function saveSite(){
  const {error}=await supabase.from('site_settings').upsert({id:'main',content:site,updated_at:new Date().toISOString()});
  if(error) throw error;
}
async function upload(bucket, file){
  if(!file) return '';
  const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g,'-');
  const path = `${Date.now()}-${Math.random().toString(36).slice(2,8)}-${safe}`;
  const {error}=await supabase.storage.from(bucket).upload(path,file,{cacheControl:'3600',upsert:false});
  if(error) throw error;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

async function init(){
  const {data:{session}} = await supabase.auth.getSession();
  if(session) await showApp();
  qs('[data-login-form]').addEventListener('submit', async e=>{ e.preventDefault(); const fd=new FormData(e.currentTarget); qs('[data-login-note]').textContent='Logging in...'; const {data,error}=await supabase.auth.signInWithPassword({email:fd.get('email'),password:fd.get('password')}); if(error){ qs('[data-login-note]').textContent=error.message; return; } if(data.user?.email !== ADMIN_EMAIL){ await supabase.auth.signOut(); qs('[data-login-note]').textContent='This email is not allowed as admin in this app.'; return; } await showApp(); });
  qs('[data-logout]').addEventListener('click',async()=>{await supabase.auth.signOut(); location.reload();});
}
async function showApp(){
  qs('[data-login]').hidden=true; qs('[data-app]').hidden=false;
  wireTabs(); wireForms(); wireContentButtons();
  await getSite(); fillProfile(); fillJson(); renderFloating(); await refreshAll(); status('Ready. Changes save directly to Supabase.');
}
function wireTabs(){ qsa('[data-tab]').forEach(btn=>btn.addEventListener('click',()=>{ qsa('[data-tab]').forEach(b=>b.classList.remove('active')); qsa('[data-panel]').forEach(p=>p.classList.remove('active')); btn.classList.add('active'); qs(`[data-panel="${btn.dataset.tab}"]`).classList.add('active'); qs('[data-page-title]').textContent=btn.textContent; })); }
function wireForms(){
  qs('[data-profile-form]').addEventListener('submit', saveProfile);
  qs('[data-gallery-form]').addEventListener('submit', e=>saveRow(e,'gallery','gallery','gallery'));
  qs('[data-cert-form]').addEventListener('submit', e=>saveRow(e,'certificates','certificates','certificates'));
  qs('[data-post-form]').addEventListener('submit', e=>saveRow(e,'posts','posts','posts'));
  qs('[data-save-floating]').addEventListener('click', saveFloating);
  qs('[data-add-floating]').addEventListener('click',()=>{ site.personal.floatingChips = site.personal.floatingChips || []; site.personal.floatingChips.push({label:'New Label',x:50,y:50,delay:0}); renderFloating(); });
}
function wireContentButtons(){
  qs('[data-save-json]').addEventListener('click',async()=>{ try{ site=JSON.parse(qs('[data-json]').value); await saveSite(); fillProfile(); renderFloating(); status('Full content saved.'); }catch(e){ status('JSON error: '+e.message,true); }});
  qs('[data-download-json]').addEventListener('click',()=>{ const blob=new Blob([JSON.stringify(site,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='profile-backup.json'; a.click(); URL.revokeObjectURL(a.href); });
  qs('[data-seed]').addEventListener('click',async()=>{ if(!confirm('Replace Supabase site content with the starter profile from data/profile.json?')) return; site=await starter(); await saveSite(); fillProfile(); fillJson(); renderFloating(); status('Starter content seeded. Refresh public site.'); });
}
function fillProfile(){ const f=qs('[data-profile-form]'); const p=site.personal||{}; const a=site.about||{}; f.name.value=p.name||''; f.headline.value=p.headline||''; f.availability.value=p.availability||''; f.location.value=p.location||''; f.email.value=p.email||''; f.phone.value=p.phone||''; f.shortIntro.value=p.shortIntro||''; f.heroTags.value=(p.heroTags||[]).join('\n'); f.aboutParagraphs.value=(a.paragraphs||[]).join('\n'); f.profileImage.value=p.profileImage||''; }
function fillJson(){ qs('[data-json]').value=JSON.stringify(site,null,2); }
async function saveProfile(e){
  e.preventDefault(); const f=e.currentTarget; status('Saving profile...');
  try{ site.personal=site.personal||{}; site.about=site.about||{}; const file=f.profileFile.files[0]; const url=file ? await upload('profile',file) : f.profileImage.value.trim(); Object.assign(site.personal,{name:f.name.value.trim(),headline:f.headline.value.trim(),availability:f.availability.value.trim(),location:f.location.value.trim(),email:f.email.value.trim(),phone:f.phone.value.trim(),shortIntro:f.shortIntro.value.trim(),profileImage:url}); site.personal.heroTags=f.heroTags.value.split('\n').map(x=>x.trim()).filter(Boolean); site.about.paragraphs=f.aboutParagraphs.value.split('\n').map(x=>x.trim()).filter(Boolean); await saveSite(); f.profileImage.value=url; fillJson(); status('Profile saved. Public site will update after refresh.'); }
  catch(err){ console.error(err); status(err.message,true); }
}
function renderFloating(){ const box=qs('[data-floating-list]'); const chips=site.personal?.floatingChips || []; box.innerHTML=chips.map((c,i)=>`<div class="float-row" data-i="${i}"><label>Label<input value="${esc(c.label||'')}" data-k="label"></label><label>X %<input type="number" value="${esc(c.x??50)}" data-k="x"></label><label>Y %<input type="number" value="${esc(c.y??50)}" data-k="y"></label><label>Delay<input type="number" step="0.1" value="${esc(c.delay??0)}" data-k="delay"></label><button class="button danger small" data-remove-floating="${i}">Remove</button></div>`).join(''); qsa('[data-remove-floating]').forEach(b=>b.addEventListener('click',()=>{ site.personal.floatingChips.splice(+b.dataset.removeFloating,1); renderFloating(); })); }
async function saveFloating(){ try{ site.personal=site.personal||{}; site.personal.floatingChips=qsa('.float-row').map(row=>{ const o={}; qsa('[data-k]',row).forEach(inp=>{ const k=inp.dataset.k; o[k]=['x','y','delay'].includes(k)?Number(inp.value):inp.value.trim(); }); return o; }).filter(x=>x.label && x.label.toUpperCase()!=='SAF'); await saveSite(); fillJson(); status('Floating labels saved.'); }catch(e){status(e.message,true);} }
async function saveRow(e, table, bucket, kind){
  e.preventDefault(); const form=e.currentTarget; const fd=new FormData(form); status(`Saving ${kind}...`);
  try{ const file=fd.get('imageFile'); let url=fd.get('image_url')?.trim() || ''; if(file && file.size) url=await upload(bucket,file); let payload={}; if(table==='gallery') payload={title:fd.get('title'),caption:fd.get('caption'),image_url:url,published:!!fd.get('published'),sort_order:Number(fd.get('sort_order')||0)}; if(table==='certificates') payload={title:fd.get('title'),issuer:fd.get('issuer'),year:fd.get('year'),description:fd.get('description'),image_url:url,published:!!fd.get('published'),sort_order:Number(fd.get('sort_order')||0)}; if(table==='posts') payload={title:fd.get('title'),body:fd.get('body'),image_url:url,published:!!fd.get('published')}; const id=current[table]; let res; if(id) res=await supabase.from(table).update(payload).eq('id',id); else res=await supabase.from(table).insert(payload); if(res.error) throw res.error; form.reset(); current[table]=null; if(form.published) form.published.checked=true; status(`${kind} saved.`); await refreshAll(); } catch(err){ console.error(err); status(err.message,true); }
}
async function refreshAll(){ await Promise.all([loadList('gallery'),loadList('certificates'),loadList('posts'),loadMessages()]); }
async function loadList(table){ const {data,error}=await supabase.from(table).select('*').order(table==='posts'?'created_at':'sort_order',{ascending:table!=='posts'}); if(error){status(error.message,true); return;} renderList(table,data||[]); }
function renderList(table, rows){ const map={gallery:'[data-gallery-list]',certificates:'[data-cert-list]',posts:'[data-post-list]'}; qs(map[table]).innerHTML=rows.map(r=>`<article class="item ${r.image_url?'':'no-img'}">${r.image_url?`<img class="thumb" src="${esc(r.image_url)}" alt="">`:''}<div><h4>${esc(r.title||'(Untitled)')}</h4><p>${esc(r.caption||r.description||r.body||'')}</p><p>${r.published?'Published':'Hidden'}${r.created_at?` • ${new Date(r.created_at).toLocaleString()}`:''}</p></div><div class="item-actions"><button class="button ghost small" data-edit="${table}:${r.id}">Edit</button><button class="button danger small" data-delete="${table}:${r.id}">Delete</button></div></article>`).join(''); qsa(`[data-edit^="${table}:"]`).forEach(b=>b.addEventListener('click',()=>editRow(table,rows.find(r=>r.id===b.dataset.edit.split(':')[1])))); qsa(`[data-delete^="${table}:"]`).forEach(b=>b.addEventListener('click',()=>deleteRow(table,b.dataset.delete.split(':')[1]))); }
function editRow(table,r){ current[table]=r.id; const form = table==='gallery'?qs('[data-gallery-form]'):table==='certificates'?qs('[data-cert-form]'):qs('[data-post-form]'); ['title','caption','issuer','year','description','body','image_url','sort_order'].forEach(k=>{ if(form[k]) form[k].value=r[k]??''; }); if(form.published) form.published.checked=!!r.published; status(`Editing ${table}. Save to update.`); form.scrollIntoView({behavior:'smooth',block:'center'}); }
async function deleteRow(table,id){ if(!confirm('Delete this item?')) return; const {error}=await supabase.from(table).delete().eq('id',id); if(error) status(error.message,true); else { status('Deleted.'); loadList(table); } }
async function loadMessages(){ const {data,error}=await supabase.from('messages').select('*').order('created_at',{ascending:false}); if(error){ qs('[data-message-list]').innerHTML=`<p class="note">${esc(error.message)}</p>`; return; } qs('[data-message-list]').innerHTML=(data||[]).map(m=>`<article class="item no-img"><div><h4>${esc(m.name)} ${m.is_read?'':'• New'}</h4><p>${esc(m.email||'No email')}</p><p>${esc(m.message)}</p><p>${new Date(m.created_at).toLocaleString()}</p></div><div class="item-actions"><button class="button ghost small" data-read="${m.id}">Mark read</button><button class="button danger small" data-msg-delete="${m.id}">Delete</button></div></article>`).join('') || '<p class="note">No messages yet.</p>'; qsa('[data-read]').forEach(b=>b.addEventListener('click',async()=>{ await supabase.from('messages').update({is_read:true}).eq('id',b.dataset.read); loadMessages(); })); qsa('[data-msg-delete]').forEach(b=>b.addEventListener('click',async()=>{ if(confirm('Delete message?')){ await supabase.from('messages').delete().eq('id',b.dataset.msgDelete); loadMessages(); } })); }

init();
