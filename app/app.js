const cfg = window.PORTFOLIO_CONFIG;
const sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
let content = structuredClone(window.DEFAULT_SITE_CONTENT);
let currentTab = 'profile';
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
const esc = (v='') => String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const arr = v => Array.isArray(v) ? v : [];
const tabs = [
  ['profile','Profile & Titles'],['floating','Floating Labels'],['about','About & Education'],['experience','Experience'],['projects','Projects'],['skills','Skills'],['research','Research'],['gallery','Gallery'],['certificates','Certificates'],['posts','Posts'],['messages','Messages'],['json','Raw JSON']
];
function deepMerge(target, source){ if(!source||typeof source!=='object')return target; for(const[k,v] of Object.entries(source)){ if(v&&typeof v==='object'&&!Array.isArray(v)) target[k]=deepMerge(target[k]||{},v); else target[k]=v; } return target; }
function migrateLegacy(raw={}){
  const out=structuredClone(raw||{});
  if(raw.personal){
    out.site=out.site||{}; out.hero=out.hero||{}; out.contact=out.contact||{}; out.nav=out.nav||{}; out.sections=out.sections||{};
    if(!out.site.name && raw.personal.name) out.site.name=String(raw.personal.name).toUpperCase();
    if(!out.site.brandSubtitle && raw.personal.brandSubtitle) out.site.brandSubtitle=raw.personal.brandSubtitle;
    if(!out.site.logoText) out.site.logoText='ABS';
    if(!out.site.pageTitle && raw.personal.name) out.site.pageTitle=`${raw.personal.name} | Portfolio`;
    if(!out.hero.title && raw.personal.name){ const parts=String(raw.personal.name).trim().split(/\s+/); out.hero.title=parts.length>=3?`${parts[0]}\n${parts.slice(1).join(' ')}`.toUpperCase():String(raw.personal.name).toUpperCase(); }
    if(!out.hero.headline && raw.personal.headline) out.hero.headline=raw.personal.headline;
    if(!out.hero.summary && raw.personal.shortIntro) out.hero.summary=raw.personal.shortIntro;
    if(!out.hero.eyebrow && raw.personal.heroLabel) out.hero.eyebrow=raw.personal.heroLabel;
    if(!out.hero.availability && raw.personal.availability) out.hero.availability=raw.personal.availability;
    if(!out.hero.location && raw.personal.location) out.hero.location=raw.personal.location;
    if(!out.hero.profileImage && raw.personal.profileImage) out.hero.profileImage=raw.personal.profileImage;
    if(!out.hero.visualTitle && raw.personal.profileCaptionTitle) out.hero.visualTitle=raw.personal.profileCaptionTitle;
    if(!out.hero.visualFooterTitle && raw.personal.profileCaptionTitle) out.hero.visualFooterTitle=raw.personal.profileCaptionTitle;
    if(!out.hero.visualFooterText && raw.personal.profileCaptionText) out.hero.visualFooterText=raw.personal.profileCaptionText;
    if(!out.hero.tags && raw.personal.heroTags) out.hero.tags=raw.personal.heroTags;
    if(!out.hero.buttons && raw.personal.heroActions) out.hero.buttons=raw.personal.heroActions.map(b=>({label:b.label,url:b.href||'#',style:b.style==='ghost'?'secondary':b.style}));
    if(!out.hero.floatingLabels && raw.personal.floatingChips) out.hero.floatingLabels=raw.personal.floatingChips;
    if(!out.contact.email && raw.personal.email) out.contact.email=raw.personal.email;
    if(!out.contact.phone && raw.personal.phone) out.contact.phone=raw.personal.phone;
    if(!out.contact.location && raw.personal.location) out.contact.location=raw.personal.location;
    if(!out.contact.social && raw.personal.socialLinks) out.contact.social=raw.personal.socialLinks;
  }
  if(raw.siteText?.nav) out.nav={...(out.nav||{}),...raw.siteText.nav};
  if(raw.siteText?.sections){
    out.sections=out.sections||{}; const sec=raw.siteText.sections;
    const pairs=[['about','aboutEyebrow','aboutTitle','aboutSubtitle'],['experience','experienceEyebrow','experienceTitle','experienceSubtitle'],['projects','projectsEyebrow','projectsTitle','projectsSubtitle'],['skills','skillsEyebrow','skillsTitle','skillsSubtitle'],['gallery','galleryEyebrow','galleryTitle','gallerySubtitle'],['certificates','certificatesEyebrow','certificatesTitle','certificatesSubtitle'],['education','educationEyebrow','educationTitle','educationSubtitle'],['contact','contactEyebrow','contactTitle','contactSubtitle']];
    for(const [id,ey,title,sub] of pairs){ out.sections[id]=out.sections[id]||{}; if(sec[ey]) out.sections[id].eyebrow=sec[ey]; if(sec[title]) out.sections[id].title=sec[title]; if(sec[sub]) out.sections[id].subtitle=sec[sub]; }
    if(sec.footerText) out.site={...(out.site||{}),footerText:sec.footerText};
  }
  if(raw.stats && !out.about?.stats) out.about={...(out.about||{}),stats:raw.stats};
  if(Array.isArray(raw.experiences)) out.experiences=raw.experiences.map(e=>({title:e.title||'',organization:e.organization||'',period:e.period||'',category:e.category||'',location:e.location||'',description:e.description||e.summary||'',bullets:e.bullets||e.highlights||[],tags:e.tags||[]}));
  if(Array.isArray(raw.projects)) out.projects=raw.projects.map(p=>({title:p.title||'',type:p.type||'',summary:p.summary||p.description||'',tags:p.tags||p.tools||[],image_url:p.image_url||p.image||'',link:p.link||'#'}));
  if(Array.isArray(raw.education)) out.education=raw.education.map(e=>({degree:e.degree||'',institution:e.institution||'',year:e.year||e.period||'',details:Array.isArray(e.details)?e.details.join('; '):(e.details||'')}));
  return out;
}
function normalize(raw){
  const d=structuredClone(window.DEFAULT_SITE_CONTENT);
  const c=deepMerge(d,migrateLegacy(raw||{}));
  if(typeof c.about==='string') c.about={paragraphs:[c.about], stats:d.about.stats, focusAreas:d.about.focusAreas||[]};
  if(!c.about || typeof c.about!=='object') c.about=structuredClone(d.about);
  c.about.paragraphs=arr(c.about.paragraphs); c.about.stats=arr(c.about.stats); c.about.focusAreas=arr(c.about.focusAreas);
  if(!arr(c.hero?.floatingLabels).length) c.hero.floatingLabels=d.hero.floatingLabels;
  if(!arr(c.hero?.buttons).length) c.hero.buttons=d.hero.buttons;
  if(!arr(c.hero?.tags).length) c.hero.tags=d.hero.tags;
  return c;
}
function getPath(obj,path){ return path.split('.').reduce((o,k)=> o?.[k], obj); }
function setPath(obj,path,val){ const keys=path.split('.'); let o=obj; keys.slice(0,-1).forEach(k=>{ if(!o[k]||typeof o[k]!=='object') o[k]={}; o=o[k]; }); o[keys.at(-1)] = val; }
function field(label,path,type='text',opts={}){
  const val=getPath(content,path) ?? '';
  if(type==='textarea') return `<div class="field"><label>${esc(label)}</label><textarea data-path="${esc(path)}" placeholder="${esc(opts.placeholder||'')}">${esc(val)}</textarea></div>`;
  return `<div class="field"><label>${esc(label)}</label><input type="${type}" data-path="${esc(path)}" placeholder="${esc(opts.placeholder||'')}" value="${esc(val)}"></div>`;
}
function simpleInput(label,value,type='text',attrs=''){ return `<div class="field"><label>${esc(label)}</label><input type="${type}" value="${esc(value)}" ${attrs}></div>`; }
function bindPathFields(){ $$('[data-path]').forEach(el=>{ const path=el.dataset.path; const handler=()=>setPath(content,path,el.value); el.addEventListener('input',handler); }); }
function showNotice(msg, isError=false){ const n=$('#globalNotice'); n.textContent=msg; n.className='notice show'+(isError?' error':''); n.style.display='block'; setTimeout(()=>{n.style.display='none'},4500); }
async function init(){
  $('#appNav').innerHTML = tabs.map(([id,label])=>`<button data-tab="${id}">${label}</button>`).join('');
  $$('#appNav button').forEach(b=>b.onclick=()=>openTab(b.dataset.tab));
  $('#loginForm').onsubmit = login;
  $('#logoutBtn').onclick = async()=>{await sb.auth.signOut(); location.reload();};
  $('#saveContentBtn').onclick = saveContent;
  $('#seedBtn').onclick = async()=>{ content=normalize(window.DEFAULT_SITE_CONTENT); await saveContent(); renderTab(); showNotice('Starter demo content has been seeded and saved. Refresh the public site.'); };
  const { data } = await sb.auth.getSession();
  if(data.session){ await loadContent(); showDashboard(); } else showLogin();
}
function showLogin(){ $('#loginView').hidden=false; $('#dashView').hidden=true; }
function showDashboard(){ $('#loginView').hidden=true; $('#dashView').hidden=false; openTab(currentTab); }
async function login(e){
  e.preventDefault(); const fd=new FormData(e.currentTarget);
  const { error } = await sb.auth.signInWithPassword({ email: fd.get('email'), password: fd.get('password') });
  if(error){ $('#loginNotice').textContent=error.message; $('#loginNotice').style.display='block'; return; }
  await loadContent(); showDashboard();
}
async function loadContent(){
  const { data, error } = await sb.from('site_settings').select('content').eq('id','main').maybeSingle();
  if(error) showNotice(error.message,true);
  content = normalize(data?.content || window.DEFAULT_SITE_CONTENT);
}
async function saveContent(){
  try{
    if(currentTab==='json'){
      const raw=$('#rawJson')?.value; if(raw) content=normalize(JSON.parse(raw));
    }
    const { error } = await sb.from('site_settings').upsert({ id:'main', content, updated_at:new Date().toISOString() });
    if(error) throw error;
    showNotice('Saved. Refresh the public site to see the update.');
  }catch(e){ showNotice(e.message,true); }
}
function openTab(id){ currentTab=id; $$('#appNav button').forEach(b=>b.classList.toggle('active',b.dataset.tab===id)); renderTab(); }
function renderTab(){ const label=tabs.find(t=>t[0]===currentTab)?.[1]||'Dashboard'; $('#panelTitle').textContent=label; const map={profile:renderProfile,floating:renderFloating,about:renderAbout,experience:renderExperience,projects:renderProjects,skills:renderSkills,research:renderResearch,gallery:renderGallery,certificates:renderCertificates,posts:renderPosts,messages:renderMessages,json:renderJson}; map[currentTab]?.(); }
function renderProfile(){
  $('#panel').innerHTML = `<div class="editor-card"><h2>Site identity</h2><div class="editor-grid">${field('Site name','site.name')}${field('Logo text','site.logoText')}${field('Circle logo image URL','site.logoImage')}${field('Circle logo alt text','site.logoAlt')}${field('Brand subtitle','site.brandSubtitle')}${field('Page title','site.pageTitle')}${field('Meta description','site.metaDescription','textarea')}${field('Footer text','site.footerText','textarea')}${field('Footer credit','site.footerCredit')}</div><div class="top-actions"><button class="mini-btn" id="uploadLogoBtn">Upload circle logo PNG/JPG</button><input id="logoFile" type="file" accept="image/*" hidden></div><div id="logoPreview"></div></div>
  <div class="editor-card"><h2>Navigation labels</h2><div class="editor-grid">${Object.keys(content.nav||{}).map(k=>field(k,`nav.${k}`)).join('')}</div></div>
  <div class="editor-card"><h2>Section titles</h2>${Object.keys(content.sections||{}).map(k=>`<div class="item-card"><h3>${esc(k)}</h3><div class="editor-grid">${field('Eyebrow',`sections.${k}.eyebrow`)}${field('Title',`sections.${k}.title`)}${field('Subtitle',`sections.${k}.subtitle`,'textarea')}</div></div>`).join('')}</div>
  <div class="editor-card"><h2>Hero and homepage</h2><div class="editor-grid">${field('Hero eyebrow','hero.eyebrow')}${field('Availability line','hero.availability','textarea')}${field('Hero title / name','hero.title','textarea')}${field('Headline','hero.headline','textarea')}${field('Summary','hero.summary','textarea')}${field('Location','hero.location')}${field('Visual title','hero.visualTitle')}${field('Visual caption','hero.visualCaption')}${field('Visual footer title','hero.visualFooterTitle')}${field('Visual footer text','hero.visualFooterText','textarea')}${field('Profile image URL','hero.profileImage')}${field('Profile image alt','hero.profileAlt')}</div><div class="top-actions"><button class="mini-btn" id="uploadProfileBtn">Upload profile photo</button><input id="profileFile" type="file" accept="image/*" hidden></div><div id="profilePreview"></div><h3>Hero tags</h3><textarea id="heroTagsBox" class="json-area" style="min-height:110px">${esc(arr(content.hero.tags).join('\n'))}</textarea><h3>Hero buttons JSON</h3><textarea id="heroButtonsBox" class="json-area" style="min-height:150px">${esc(JSON.stringify(arr(content.hero.buttons),null,2))}</textarea></div>
  <div class="editor-card"><h2>Contact information</h2><div class="editor-grid">${field('Email','contact.email')}${field('Phone','contact.phone')}${field('Location','contact.location')}</div><h3>Social links JSON</h3><textarea id="socialBox" class="json-area" style="min-height:140px">${esc(JSON.stringify(arr(content.contact.social),null,2))}</textarea></div>`;
  bindPathFields();
  $('#heroTagsBox').oninput=e=>content.hero.tags=e.target.value.split('\n').map(x=>x.trim()).filter(Boolean);
  $('#heroButtonsBox').oninput=e=>{try{content.hero.buttons=JSON.parse(e.target.value)}catch{}};
  $('#socialBox').oninput=e=>{try{content.contact.social=JSON.parse(e.target.value)}catch{}};
  $('#uploadLogoBtn').onclick=()=>$('#logoFile').click();
  $('#logoFile').onchange=async e=>{ const file=e.target.files[0]; if(!file)return; const url=await uploadFile('profile',file); if(url){content.site.logoImage=url; await saveContent(); renderProfile(); showNotice('Circle logo uploaded and saved.');}};
  if(content.site.logoImage) $('#logoPreview').innerHTML=`<img class="preview-img" src="${esc(content.site.logoImage)}" alt="logo preview">`;
  $('#uploadProfileBtn').onclick=()=>$('#profileFile').click();
  $('#profileFile').onchange=async e=>{ const file=e.target.files[0]; if(!file)return; const url=await uploadFile('profile',file); if(url){content.hero.profileImage=url; await saveContent(); renderProfile(); showNotice('Profile image uploaded and saved.');}};
  if(content.hero.profileImage) $('#profilePreview').innerHTML=`<img class="preview-img" src="${esc(content.hero.profileImage)}" alt="preview">`;
}
function renderFloating(){
  const list=arr(content.hero.floatingLabels);
  $('#panel').innerHTML = `<div class="editor-card"><h2>Floating labels around ABS box</h2><p class="muted">Edit label, X position, and Y position. On the public site, these labels disappear and move away when the ABS box is hovered.</p><div class="top-actions"><button id="addFloat" class="mini-btn">Add label</button></div>${list.map((f,i)=>`<div class="item-card"><div class="row">${simpleInput('Label',f.label,'text',`data-fl="label" data-i="${i}"`)}${simpleInput('X position 0-100',f.x,'number',`min="0" max="100" data-fl="x" data-i="${i}"`)}${simpleInput('Y position 0-100',f.y,'number',`min="0" max="100" data-fl="y" data-i="${i}"`)}</div><button class="mini-btn danger" data-remove-float="${i}">Remove</button></div>`).join('')}</div>`;
  $$('[data-fl]').forEach(el=>el.oninput=()=>{const i=+el.dataset.i; const key=el.dataset.fl; content.hero.floatingLabels[i][key]= key==='label'?el.value:Number(el.value);});
  $$('[data-remove-float]').forEach(b=>b.onclick=()=>{content.hero.floatingLabels.splice(+b.dataset.removeFloat,1); renderFloating();});
  $('#addFloat').onclick=()=>{content.hero.floatingLabels.push({label:'New Label',x:50,y:50}); renderFloating();};
}
function renderAbout(){
  $('#panel').innerHTML = `<div class="editor-card"><h2>About paragraphs</h2><textarea id="aboutParagraphs" class="json-area" style="min-height:210px">${esc(arr(content.about.paragraphs).join('\n\n'))}</textarea><h3>Focus areas</h3><textarea id="focusAreasBox" class="json-area" style="min-height:130px">${esc(arr(content.about.focusAreas).join('\n'))}</textarea></div>
  <div class="editor-card"><h2>Stats</h2><button id="addStat" class="mini-btn">Add stat</button>${arr(content.about.stats).map((s,i)=>`<div class="item-card"><div class="row">${simpleInput('Value',s.value,'text',`data-stat="value" data-i="${i}"`)}${simpleInput('Label',s.label,'text',`data-stat="label" data-i="${i}"`)}</div><button class="mini-btn danger" data-rm-stat="${i}">Remove</button></div>`).join('')}</div>
  <div class="editor-card"><h2>Education</h2><button id="addEdu" class="mini-btn">Add education</button>${arr(content.education).map((e,i)=>`<div class="item-card"><div class="editor-grid">${simpleInput('Degree',e.degree,'text',`data-edu="degree" data-i="${i}"`)}${simpleInput('Institution',e.institution,'text',`data-edu="institution" data-i="${i}"`)}${simpleInput('Year',e.year,'text',`data-edu="year" data-i="${i}"`)}<div class="field"><label>Details</label><textarea data-edu="details" data-i="${i}">${esc(e.details)}</textarea></div></div><button class="mini-btn danger" data-rm-edu="${i}">Remove</button></div>`).join('')}</div>`;
  $('#aboutParagraphs').oninput=e=>content.about.paragraphs=e.target.value.split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean);
  $('#focusAreasBox').oninput=e=>content.about.focusAreas=e.target.value.split('\n').map(x=>x.trim()).filter(Boolean);
  $$('[data-stat]').forEach(el=>el.oninput=()=>content.about.stats[+el.dataset.i][el.dataset.stat]=el.value);
  $$('[data-rm-stat]').forEach(b=>b.onclick=()=>{content.about.stats.splice(+b.dataset.rmStat,1);renderAbout();});
  $('#addStat').onclick=()=>{content.about.stats.push({value:'0',label:'New stat'});renderAbout();};
  $$('[data-edu]').forEach(el=>el.oninput=()=>content.education[+el.dataset.i][el.dataset.edu]=el.value);
  $$('[data-rm-edu]').forEach(b=>b.onclick=()=>{content.education.splice(+b.dataset.rmEdu,1);renderAbout();});
  $('#addEdu').onclick=()=>{content.education.push({degree:'New degree',institution:'Institution',year:'Year',details:'Details'});renderAbout();};
}
function textListEditor(name, list, fields){
  return `<div class="editor-card"><h2>${esc(name)}</h2><button class="mini-btn" id="addItem">Add item</button>${arr(list).map((it,i)=>`<div class="item-card">${fields.map(f=> f.type==='textarea'?`<div class="field"><label>${esc(f.label)}</label><textarea data-field="${f.key}" data-i="${i}" data-array="${f.array||''}" data-join="${esc(f.join||'\n')}">${esc(Array.isArray(it[f.key])?it[f.key].join(f.join||'\n'):it[f.key]||'')}</textarea></div>`: simpleInput(f.label, Array.isArray(it[f.key])?it[f.key].join(f.join||', '):it[f.key]||'', 'text', `data-field="${f.key}" data-i="${i}" data-array="${f.array||''}" data-join="${esc(f.join||',')}"`)).join('')}<button class="mini-btn danger" data-rm="${i}">Remove</button></div>`).join('')}</div>`;
}
function bindTextList(path, blank){
  const list=getPath(content,path);
  $$('[data-field]').forEach(el=>el.oninput=()=>{ const item=list[+el.dataset.i]; const key=el.dataset.field; if(el.dataset.array){ item[key]=el.value.split(el.dataset.array==='lines'?/\n/:',').map(x=>x.trim()).filter(Boolean); } else item[key]=el.value; });
  $$('[data-rm]').forEach(b=>b.onclick=()=>{ list.splice(+b.dataset.rm,1); renderTab(); });
  $('#addItem').onclick=()=>{ list.push(structuredClone(blank)); renderTab(); };
}
function renderExperience(){ $('#panel').innerHTML=textListEditor('Experience items',content.experiences,[{label:'Title',key:'title'},{label:'Organization',key:'organization'},{label:'Period',key:'period'},{label:'Category',key:'category'},{label:'Description',key:'description',type:'textarea'},{label:'Bullets, one per line',key:'bullets',type:'textarea',array:'lines'},{label:'Tags, comma separated',key:'tags',array:'comma'}]); bindTextList('experiences',{title:'New role',organization:'Organization',period:'Period',category:'Category',description:'Description',bullets:[],tags:[]}); }
function renderProjects(){ $('#panel').innerHTML=textListEditor('Projects',content.projects,[{label:'Title',key:'title'},{label:'Type',key:'type'},{label:'Summary',key:'summary',type:'textarea'},{label:'Image URL',key:'image_url'},{label:'Tags, comma separated',key:'tags',array:'comma'}]); bindTextList('projects',{title:'New project',type:'Type',summary:'Summary',image_url:'',tags:[]}); }
function renderSkills(){ $('#panel').innerHTML=textListEditor('Skill groups',content.skills,[{label:'Group title',key:'group'},{label:'Items, one per line',key:'items',type:'textarea',array:'lines'}]); bindTextList('skills',{group:'New skill group',items:[]}); }
function renderResearch(){ $('#panel').innerHTML=textListEditor('Research highlights',content.researchHighlights,[{label:'Title',key:'title'},{label:'Text',key:'text',type:'textarea'}]); bindTextList('researchHighlights',{title:'New research highlight',text:'Description'}); }
function renderJson(){ $('#panel').innerHTML=`<div class="editor-card"><h2>Raw JSON editor</h2><p class="muted">Advanced editor. You can edit every title, array, and text here.</p><textarea id="rawJson" class="json-area">${esc(JSON.stringify(content,null,2))}</textarea></div>`; }
async function uploadFile(bucket,file){
  const ext=file.name.split('.').pop(); const name=`${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;
  const { error } = await sb.storage.from(bucket).upload(name,file,{cacheControl:'3600',upsert:false});
  if(error){ showNotice(error.message,true); return ''; }
  const { data } = sb.storage.from(bucket).getPublicUrl(name);
  return data.publicUrl;
}
async function renderGallery(){ await renderMediaTable('gallery','Gallery','gallery',[{name:'title',label:'Title'},{name:'caption',label:'Caption'}]); }
async function renderCertificates(){ await renderMediaTable('certificates','Certificates','certificates',[{name:'title',label:'Title',required:true},{name:'issuer',label:'Issuer'},{name:'year',label:'Year'}]); }
async function renderPosts(){ await renderMediaTable('posts','Posts','posts',[{name:'title',label:'Title',required:true},{name:'body',label:'Body',textarea:true}]); }
async function renderMediaTable(table,title,bucket,fields){
  const { data, error } = await sb.from(table).select('*').order('sort_order',{ascending:true}).order('created_at',{ascending:false});
  if(error){ $('#panel').innerHTML=`<div class="notice error show">${esc(error.message)}</div>`; return; }
  $('#panel').innerHTML=`<div class="editor-card"><h2>Add ${esc(title)}</h2><div class="editor-grid">${fields.map(f=> f.textarea?`<div class="field"><label>${esc(f.label)}</label><textarea id="new_${f.name}"></textarea></div>`:`<div class="field"><label>${esc(f.label)}</label><input id="new_${f.name}" ${f.required?'required':''}></div>`).join('')}<div class="field"><label>Sort order</label><input id="new_sort_order" type="number" value="0"></div><div class="field"><label>Image / file</label><input id="new_file" type="file" accept="image/*"></div></div><button id="addMedia" class="btn primary">Upload and save</button></div><div class="editor-card"><h2>Current ${esc(title)}</h2><div class="list-table">${arr(data).map(r=>`<div class="item-card"><div class="message"><div>${r.image_url?`<img class="preview-img" src="${esc(r.image_url)}">`:''}<h3>${esc(r.title || '(no title)')}</h3><p class="muted">${esc(r.caption || r.issuer || r.body || '')}</p><p class="muted">Published: ${r.published?'Yes':'No'} | Sort: ${r.sort_order ?? 0}</p></div><div class="item-actions"><button class="mini-btn" data-toggle="${r.id}">${r.published?'Hide':'Publish'}</button><button class="mini-btn danger" data-del="${r.id}">Delete</button></div></div></div>`).join('')}</div></div>`;
  $('#addMedia').onclick=async()=>{
    let payload={ published:true, sort_order:Number($('#new_sort_order').value||0) };
    for(const f of fields) payload[f.name]=$(`#new_${f.name}`).value;
    const file=$('#new_file').files[0]; if(file) payload.image_url=await uploadFile(bucket,file);
    const { error } = await sb.from(table).insert(payload); if(error) showNotice(error.message,true); else { showNotice(`${title} item saved.`); renderTab(); }
  };
  $$('[data-toggle]').forEach(b=>b.onclick=async()=>{const row=data.find(x=>x.id===b.dataset.toggle); await sb.from(table).update({published:!row.published}).eq('id',row.id); renderTab();});
  $$('[data-del]').forEach(b=>b.onclick=async()=>{if(confirm('Delete this item?')){ await sb.from(table).delete().eq('id',b.dataset.del); renderTab(); }});
}
async function renderMessages(){
  const { data, error } = await sb.from('messages').select('*').order('created_at',{ascending:false});
  if(error){ $('#panel').innerHTML=`<div class="notice error show">${esc(error.message)}</div>`; return; }
  $('#panel').innerHTML=`<div class="editor-card"><h2>Inbox</h2>${arr(data).length?arr(data).map(m=>`<div class="item-card"><div class="message"><div><h3>${esc(m.name)} ${m.is_read?'':'<span class="mini">New</span>'}</h3><p>${esc(m.email||'No email')}</p><p>${esc(m.message)}</p><p class="muted">${new Date(m.created_at).toLocaleString()}</p></div><div class="item-actions"><button class="mini-btn" data-read="${m.id}">Mark read</button><button class="mini-btn danger" data-del-msg="${m.id}">Delete</button></div></div></div>`).join(''):'<p class="muted">No messages yet.</p>'}</div>`;
  $$('[data-read]').forEach(b=>b.onclick=async()=>{await sb.from('messages').update({is_read:true}).eq('id',b.dataset.read); renderMessages();});
  $$('[data-del-msg]').forEach(b=>b.onclick=async()=>{if(confirm('Delete message?')){await sb.from('messages').delete().eq('id',b.dataset.delMsg); renderMessages();}});
}
init();
