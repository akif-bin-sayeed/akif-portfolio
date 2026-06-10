const qs = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];
const getPath = (obj, path) => path.split('.').reduce((acc, key) => acc?.[key], obj);
const setPath = (obj, path, value) => {
  const keys = path.split('.');
  let ref = obj;
  keys.slice(0,-1).forEach(key => { if(!ref[key] || typeof ref[key] !== 'object') ref[key] = {}; ref = ref[key]; });
  ref[keys.at(-1)] = value;
};
const clone = obj => JSON.parse(JSON.stringify(obj));
let data = null;
let profileFile = null;
let anyFile = null;

const sectionKeys = ['about','education','experiences','projects','skills','achievements','certificates','gallery','contact'];

async function init(){
  setupTabs();
  setupButtons();
  try{
    const res = await fetch('../data/profile.json', {cache:'no-store'});
    if(!res.ok) throw new Error(`profile.json returned ${res.status}`);
    data = await res.json();
    hydrateQuick();
    renderBlocks();
    syncRaw();
  }catch(err){
    console.error(err);
    data = emptyData();
    hydrateQuick();
    renderBlocks();
    syncRaw();
    toast('Could not load existing profile.json. A blank starter was opened.', true);
  }
}

function setupTabs(){
  qsa('[data-tab]').forEach(btn => btn.addEventListener('click', () => {
    qsa('[data-tab]').forEach(b => b.classList.remove('active'));
    qsa('[data-panel]').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    qs(`[data-panel="${btn.dataset.tab}"]`)?.classList.add('active');
    if(btn.dataset.tab === 'raw') syncRaw();
  }));
}

function setupButtons(){
  qs('[data-apply-quick]')?.addEventListener('click', applyQuick);
  qs('[data-apply-content]')?.addEventListener('click', applyBlocks);
  qs('[data-apply-raw]')?.addEventListener('click', applyRaw);
  qs('[data-download]')?.addEventListener('click', downloadJson);

  qs('[data-profile-upload]')?.addEventListener('change', e => {
    profileFile = e.target.files?.[0] || null;
    previewFile(profileFile, qs('[data-profile-preview]'));
  });
  qs('[data-any-upload]')?.addEventListener('change', e => {
    anyFile = e.target.files?.[0] || null;
    previewFile(anyFile, qs('[data-any-preview]'));
  });
  qs('[data-embed-profile]')?.addEventListener('click', async () => {
    if(!profileFile) return toast('Choose a profile photo first.', true);
    const url = await fileToDataUrl(profileFile);
    setPath(data, 'personal.profileImage', url);
    hydrateQuick(); syncRaw(); toast('Profile photo embedded. Download profile.json now.');
  });
  qs('[data-add-gallery]')?.addEventListener('click', async () => addMedia('gallery'));
  qs('[data-add-certificate]')?.addEventListener('click', async () => addMedia('certificates'));
}

function hydrateQuick(){
  qsa('[data-q]').forEach(input => { input.value = getPath(data, input.dataset.q) || ''; });
  qsa('[data-q-list]').forEach(input => { input.value = (getPath(data, input.dataset.qList) || []).join(', '); });
}

function applyQuick(){
  qsa('[data-q]').forEach(input => setPath(data, input.dataset.q, input.value.trim()));
  qsa('[data-q-list]').forEach(input => {
    let items = input.value.split(',').map(x => x.trim()).filter(Boolean);
    if(input.dataset.qList === 'personal.floatingChips') items = items.filter(x => x.toUpperCase() !== 'SAF');
    setPath(data, input.dataset.qList, items);
  });
  renderBlocks(); syncRaw(); toast('Quick profile changes applied.');
}

function renderBlocks(){
  const target = qs('[data-json-blocks]');
  target.innerHTML = sectionKeys.map(key => `
    <details class="block" ${key === 'experiences' ? 'open' : ''}>
      <summary>${label(key)}</summary>
      <textarea data-block="${key}" spellcheck="false">${JSON.stringify(data[key] ?? (key === 'contact' || key === 'about' ? {} : []), null, 2)}</textarea>
    </details>
  `).join('');
}

function applyBlocks(){
  try{
    qsa('[data-block]').forEach(area => {
      data[area.dataset.block] = JSON.parse(area.value);
    });
    syncRaw(); hydrateQuick(); toast('Content blocks applied.');
  }catch(err){
    toast(`JSON error: ${err.message}`, true);
  }
}

function syncRaw(){ qs('[data-raw]').value = JSON.stringify(data, null, 2); }
function applyRaw(){
  try{
    data = JSON.parse(qs('[data-raw]').value);
    hydrateQuick(); renderBlocks(); toast('Raw JSON applied.');
  }catch(err){ toast(`JSON error: ${err.message}`, true); }
}

async function addMedia(type){
  if(!anyFile) return toast('Choose an image first.', true);
  const url = await fileToDataUrl(anyFile);
  const title = qs('[data-media-title]').value.trim() || (type === 'gallery' ? 'New gallery photo' : 'New certificate');
  const caption = qs('[data-media-caption]').value.trim();
  if(type === 'gallery'){
    data.gallery = data.gallery || [];
    data.gallery.unshift({ title, image:url, caption });
    toast('Image embedded in gallery.');
  }else{
    data.certificates = data.certificates || [];
    data.certificates.unshift({ title, issuer:'', year:new Date().getFullYear().toString(), type:'Certificate', image:url, description:caption });
    toast('Image embedded in certificate corner.');
  }
  renderBlocks(); syncRaw();
}

function downloadJson(){
  applyQuick();
  try{ applyBlocks(); }catch(_){ }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'profile.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function previewFile(file, target){
  if(!target) return;
  if(!file){ target.textContent = 'No image selected'; return; }
  const reader = new FileReader();
  reader.onload = () => { target.innerHTML = `<img alt="Preview" src="${reader.result}">`; };
  reader.readAsDataURL(file);
}
function fileToDataUrl(file){
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function label(key){return key.replace(/([A-Z])/g,' $1').replace(/^./, s => s.toUpperCase());}
function toast(message, error=false){
  const old = qs('.toast'); if(old) old.remove();
  const el = document.createElement('div');
  el.className = `toast ${error ? 'error' : ''}`;
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 4200);
}
function emptyData(){ return { personal:{name:'Your Name', headline:'Headline', shortIntro:'Short intro', location:'', email:'', phone:'', heroTags:[], floatingChips:[]}, stats:[], about:{title:'About title', paragraphs:[], focusAreas:[]}, education:[], experiences:[], projects:[], skills:[], achievements:[], certificates:[], gallery:[], contact:{title:'Contact title', message:'Contact message', buttonLabel:'Send Message'} }; }

document.addEventListener('DOMContentLoaded', init);
