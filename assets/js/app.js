const qs = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];
const getPath = (obj, path) => path.split('.').reduce((acc, key) => acc?.[key], obj);
const esc = (value = '') => String(value).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const state = { data: null, activeFilter: 'All' };

async function init(){
  setupCoreInteractions();
  try{
    const res = await fetch('data/profile.json', { cache: 'no-store' });
    if(!res.ok) throw new Error(`Could not load profile.json (${res.status})`);
    state.data = await res.json();
    hydrateText();
    renderHeroTags();
    renderFloatingChips();
    renderStats();
    renderAboutLists();
    renderFilters();
    renderExperiences();
    renderProjects();
    renderSkills();
    renderAchievements();
    renderEducation();
    renderCertificates();
    renderGallery();
    renderContactLinks();
    setupProfileImage();
    setupReveal();
    setupCards();
  }catch(err){
    console.error(err);
    document.body.insertAdjacentHTML('afterbegin', `<div style="position:fixed;z-index:999;left:1rem;right:1rem;bottom:1rem;padding:1rem;border-radius:18px;background:#260b12;color:#ffd7df;border:1px solid #ff8aa1">Profile data could not be loaded. Open the site through Netlify or a local server, not directly as a file.</div>`);
  }
}

function setupCoreInteractions(){
  qs('[data-year]') && (qs('[data-year]').textContent = new Date().getFullYear());
  const toggle = qs('[data-nav-toggle]');
  const links = qs('[data-nav-links]');
  toggle?.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  qsa('[data-nav-links] a').forEach(a => a.addEventListener('click', () => links?.classList.remove('open')));

  const themeBtn = qs('[data-theme-toggle]');
  const savedTheme = localStorage.getItem('abs-theme');
  if(savedTheme) document.documentElement.dataset.theme = savedTheme;
  themeBtn?.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('abs-theme', next);
  });

  const progress = qs('[data-scroll-progress]');
  const glow = qs('[data-pointer-glow]');
  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = `${Math.max(0, Math.min(100, scrollY / max * 100))}%`;
    updateActiveNav();
  }, { passive: true });
  window.addEventListener('pointermove', (event) => {
    if(!glow) return;
    glow.style.transform = `translate(${event.clientX - 115}px, ${event.clientY - 115}px)`;
  }, { passive: true });

  const heroArt = qs('[data-hero-art]');
  const frame = qs('[data-profile-frame]');
  frame?.addEventListener('pointerenter', () => heroArt?.classList.add('photo-hover'));
  frame?.addEventListener('pointerleave', () => heroArt?.classList.remove('photo-hover'));
}

function updateActiveNav(){
  const sections = ['about','experience','projects','skills','certificates','contact'];
  let active = '';
  for(const id of sections){
    const el = document.getElementById(id);
    if(el && el.getBoundingClientRect().top < 140) active = id;
  }
  qsa('.nav-links a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${active}`));
}

function hydrateText(){
  qsa('[data-field]').forEach(el => {
    const value = getPath(state.data, el.dataset.field);
    if(value !== undefined && value !== null) el.textContent = value;
  });
}

function renderHeroTags(){
  const target = qs('[data-list="personal.heroTags"]');
  if(!target) return;
  const tags = getPath(state.data, 'personal.heroTags') || [];
  target.innerHTML = tags.map(t => `<span class="tag">${esc(t)}</span>`).join('');
}

function renderFloatingChips(){
  const zone = qs('[data-floating-zone]');
  if(!zone) return;
  const classMap = {
    'GIS':'chip-gis','RS':'chip-rs','Drone Mapping':'chip-drone','GEE':'chip-gee','Spatial Data':'chip-spatial','Field Research':'chip-field','Agribusiness':'chip-agri','Youth Leadership':'chip-youth','UAV':'chip-uav','ArcGIS':'chip-arcgis','Pix4D':'chip-pix4d','R':'chip-r','SPSS':'chip-spss','Google Colab':'chip-colab','Survey Ops':'chip-survey','Climate Action':'chip-climate','Startup Mentor':'chip-startup'
  };
  const chips = (getPath(state.data, 'personal.floatingChips') || []).filter(label => label.toUpperCase() !== 'SAF');
  zone.innerHTML = chips.map((label, i) => `<span class="float-chip ${classMap[label] || `chip-${i}`}">${esc(label)}</span>`).join('');
}

function renderStats(){
  const target = qs('[data-stats]');
  if(!target) return;
  const stats = state.data.stats || [];
  target.innerHTML = stats.map(s => `<div class="stat"><strong data-count="${esc(s.value)}">${esc(s.value)}</strong><span>${esc(s.label)}</span></div>`).join('');
}

function renderAboutLists(){
  qsa('[data-paragraphs]').forEach(target => {
    const items = getPath(state.data, target.dataset.paragraphs) || [];
    target.innerHTML = items.map(p => `<p>${esc(p)}</p>`).join('');
  });
  qsa('[data-list-ul]').forEach(target => {
    const items = getPath(state.data, target.dataset.listUl) || [];
    target.innerHTML = items.map(i => `<li>${esc(i)}</li>`).join('');
  });
}

function renderFilters(){
  const target = qs('[data-filters]');
  if(!target) return;
  const cats = ['All', ...new Set((state.data.experiences || []).map(e => e.category).filter(Boolean))];
  target.innerHTML = cats.map(cat => `<button class="filter ${cat === state.activeFilter ? 'active' : ''}" type="button" data-filter="${esc(cat)}">${esc(cat)}</button>`).join('');
  qsa('[data-filter]', target).forEach(btn => btn.addEventListener('click', () => {
    state.activeFilter = btn.dataset.filter;
    renderFilters();
    renderExperiences();
    setupCards();
  }));
}

function renderExperiences(){
  const target = qs('[data-experience]');
  if(!target) return;
  let items = state.data.experiences || [];
  if(state.activeFilter !== 'All') items = items.filter(item => item.category === state.activeFilter);
  target.innerHTML = items.map(item => `
    <article class="card reveal">
      <div class="card-kicker">${esc(item.category || 'Experience')}</div>
      <h3>${esc(item.title)}</h3>
      <p class="org">${esc(item.organization)}</p>
      <p class="period">${esc(item.period)}${item.location ? ` • ${esc(item.location)}` : ''}</p>
      <p>${esc(item.summary)}</p>
      ${item.highlights?.length ? `<details><summary>Key highlights</summary><ul>${item.highlights.map(h=>`<li>${esc(h)}</li>`).join('')}</ul></details>` : ''}
      ${renderMiniTags(item.tags)}
    </article>
  `).join('');
  setupReveal();
}

function renderProjects(){
  const target = qs('[data-projects]');
  if(!target) return;
  target.innerHTML = (state.data.projects || []).map(item => `
    <article class="project-card reveal">
      <span class="project-type">${esc(item.type || 'Project')}</span>
      <h3>${esc(item.title)}</h3>
      <p>${esc(item.description)}</p>
      ${renderMiniTags(item.tools)}
      ${item.link && item.link !== '#' ? `<a class="button soft" href="${esc(item.link)}" target="_blank" rel="noreferrer">View details</a>` : ''}
    </article>
  `).join('');
  setupReveal();
}

function renderSkills(){
  const target = qs('[data-skills]');
  if(!target) return;
  target.innerHTML = (state.data.skills || []).map(group => `
    <article class="skill-card">
      <h3>${esc(group.group)}</h3>
      <ul>${(group.items || []).map(item => `<li>${esc(item)}</li>`).join('')}</ul>
    </article>
  `).join('');
}

function renderAchievements(){
  const target = qs('[data-achievements]');
  if(!target) return;
  target.innerHTML = (state.data.achievements || []).map(a => `<div class="achievement-item">${esc(a)}</div>`).join('');
}

function renderEducation(){
  const target = qs('[data-education]');
  if(!target) return;
  target.innerHTML = (state.data.education || []).map(item => `
    <article class="edu-item reveal">
      <div>
        <h3>${esc(item.degree)}</h3>
        <p>${esc(item.institution)}</p>
        ${item.details?.length ? `<ul>${item.details.map(d=>`<li>${esc(d)}</li>`).join('')}</ul>` : ''}
      </div>
      <strong>${esc(item.period)}</strong>
    </article>
  `).join('');
  setupReveal();
}

function renderCertificates(){
  const target = qs('[data-certificates]');
  if(!target) return;
  target.innerHTML = (state.data.certificates || []).map((cert, index) => `
    <article class="cert-card reveal">
      <div class="cert-media">${cert.image ? `<img src="${esc(cert.image)}" alt="${esc(cert.title)} certificate image" loading="lazy">` : `<span class="cert-placeholder">C${index+1}</span>`}</div>
      <span class="cert-type">${esc(cert.type || 'Certificate')}</span>
      <h3>${esc(cert.title)}</h3>
      <p><strong>${esc(cert.issuer || '')}</strong>${cert.year ? ` • ${esc(cert.year)}` : ''}</p>
      <p>${esc(cert.description || '')}</p>
    </article>
  `).join('');
  setupReveal();
}

function renderGallery(){
  const target = qs('[data-gallery]');
  if(!target) return;
  target.innerHTML = (state.data.gallery || []).map((item, index) => `
    <article class="gallery-card reveal">
      <div class="gallery-media">${item.image ? `<img src="${esc(item.image)}" alt="${esc(item.title)}" loading="lazy">` : `<span class="gallery-placeholder">0${index+1}</span>`}</div>
      <h3>${esc(item.title)}</h3>
      <p>${esc(item.caption || '')}</p>
    </article>
  `).join('');
  setupReveal();
}

function renderContactLinks(){
  const target = qs('[data-contact-links]');
  if(!target) return;
  const personal = state.data.personal || {};
  const links = [];
  if(personal.email) links.push({label:'Email', url:`mailto:${personal.email}`});
  if(personal.phone) links.push({label:'Phone', url:`tel:${personal.phone}`});
  (personal.socialLinks || []).forEach(item => { if(item.url && item.url !== '#') links.push(item); });
  target.innerHTML = links.length ? links.map(l => `<a href="${esc(l.url)}" target="${l.url.startsWith('http') ? '_blank' : '_self'}" rel="noreferrer">${esc(l.label)}</a>`).join('') : `<span class="tag">Add email and links from dashboard</span>`;
}

function renderMiniTags(items = []){
  return items?.length ? `<div class="mini-tags">${items.map(tag => `<span>${esc(tag)}</span>`).join('')}</div>` : '';
}

function setupProfileImage(){
  const visual = qs('[data-profile-visual]');
  const img = state.data.personal?.profileImage;
  if(visual && img){
    visual.innerHTML = `<img src="${esc(img)}" alt="${esc(state.data.personal.name)} profile photo"><div class="photo-glass"></div><div class="scan"></div>`;
  }
}

function setupReveal(){
  const items = qsa('.reveal:not(.visible)');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach(item => io.observe(item));
}

function setupCards(){
  qsa('.card,.project-card,.cert-card,.gallery-card,.skill-card,.edu-item').forEach(card => {
    card.addEventListener('pointermove', event => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      card.style.setProperty('--my', `${event.clientY - rect.top}px`);
    });
  });
}

document.addEventListener('DOMContentLoaded', init);
