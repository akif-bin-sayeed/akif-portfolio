const cfg = window.PORTFOLIO_CONFIG || {};
const sb = window.supabase?.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
let content = structuredClone(window.DEFAULT_SITE_CONTENT);

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const escapeHTML = (v = '') => String(v ?? '').replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
const safeArr = v => Array.isArray(v) ? v : [];
const setText = (sel, value = '') => { const el = $(sel); if (el) el.textContent = value || ''; };
const setHTML = (sel, html = '') => { const el = $(sel); if (el) el.innerHTML = html; };

function deepMerge(target, source) {
  if (!source || typeof source !== 'object') return target;
  for (const [k, v] of Object.entries(source)) {
    if (v && typeof v === 'object' && !Array.isArray(v)) target[k] = deepMerge(target[k] || {}, v);
    else target[k] = v;
  }
  return target;
}

function migrateLegacy(raw = {}) {
  const out = structuredClone(raw || {});

  // Compatibility for the older JSON shape you pasted earlier.
  if (raw.personal) {
    out.site = out.site || {};
    out.hero = out.hero || {};
    out.contact = out.contact || {};
    out.nav = out.nav || {};
    out.sections = out.sections || {};

    if (!out.site.name && raw.personal.name) out.site.name = String(raw.personal.name).toUpperCase();
    if (!out.site.brandSubtitle && raw.personal.brandSubtitle) out.site.brandSubtitle = raw.personal.brandSubtitle;
    if (!out.site.logoText) out.site.logoText = 'ABS';
    if (!out.site.pageTitle && raw.personal.name) out.site.pageTitle = `${raw.personal.name} | Portfolio`;

    if (!out.hero.title && raw.personal.name) {
      const parts = String(raw.personal.name).trim().split(/\s+/);
      out.hero.title = parts.length >= 3 ? `${parts[0]}\n${parts.slice(1).join(' ')}`.toUpperCase() : String(raw.personal.name).toUpperCase();
    }
    if (!out.hero.headline && raw.personal.headline) out.hero.headline = raw.personal.headline;
    if (!out.hero.summary && raw.personal.shortIntro) out.hero.summary = raw.personal.shortIntro;
    if (!out.hero.eyebrow && raw.personal.heroLabel) out.hero.eyebrow = raw.personal.heroLabel;
    if (!out.hero.availability && raw.personal.availability) out.hero.availability = raw.personal.availability;
    if (!out.hero.location && raw.personal.location) out.hero.location = raw.personal.location;
    if (!out.hero.profileImage && raw.personal.profileImage) out.hero.profileImage = raw.personal.profileImage;
    if (!out.hero.visualTitle && raw.personal.profileCaptionTitle) out.hero.visualTitle = raw.personal.profileCaptionTitle;
    if (!out.hero.visualFooterTitle && raw.personal.profileCaptionTitle) out.hero.visualFooterTitle = raw.personal.profileCaptionTitle;
    if (!out.hero.visualFooterText && raw.personal.profileCaptionText) out.hero.visualFooterText = raw.personal.profileCaptionText;
    if (!out.hero.tags && raw.personal.heroTags) out.hero.tags = raw.personal.heroTags;
    if (!out.hero.buttons && raw.personal.heroActions) out.hero.buttons = raw.personal.heroActions.map(b => ({ label: b.label, url: b.href || '#', style: b.style === 'ghost' ? 'secondary' : b.style }));
    if (!out.hero.floatingLabels && raw.personal.floatingChips) out.hero.floatingLabels = raw.personal.floatingChips;

    if (!out.contact.email && raw.personal.email) out.contact.email = raw.personal.email;
    if (!out.contact.phone && raw.personal.phone) out.contact.phone = raw.personal.phone;
    if (!out.contact.location && raw.personal.location) out.contact.location = raw.personal.location;
    if (!out.contact.social && raw.personal.socialLinks) out.contact.social = raw.personal.socialLinks;
  }

  if (raw.siteText?.nav) out.nav = { ...(out.nav || {}), ...raw.siteText.nav };
  if (raw.siteText?.sections) {
    out.sections = out.sections || {};
    const s = raw.siteText.sections;
    const pairs = [
      ['about', 'aboutEyebrow', 'aboutTitle', 'aboutSubtitle'],
      ['experience', 'experienceEyebrow', 'experienceTitle', 'experienceSubtitle'],
      ['projects', 'projectsEyebrow', 'projectsTitle', 'projectsSubtitle'],
      ['skills', 'skillsEyebrow', 'skillsTitle', 'skillsSubtitle'],
      ['gallery', 'galleryEyebrow', 'galleryTitle', 'gallerySubtitle'],
      ['certificates', 'certificatesEyebrow', 'certificatesTitle', 'certificatesSubtitle'],
      ['education', 'educationEyebrow', 'educationTitle', 'educationSubtitle'],
      ['contact', 'contactEyebrow', 'contactTitle', 'contactSubtitle']
    ];
    for (const [id, eyebrowKey, titleKey, subtitleKey] of pairs) {
      out.sections[id] = out.sections[id] || {};
      if (s[eyebrowKey]) out.sections[id].eyebrow = s[eyebrowKey];
      if (s[titleKey]) out.sections[id].title = s[titleKey];
      if (s[subtitleKey]) out.sections[id].subtitle = s[subtitleKey];
    }
    if (s.footerText) out.site = { ...(out.site || {}), footerText: s.footerText };
  }

  if (raw.stats && !out.about?.stats) out.about = { ...(out.about || {}), stats: raw.stats };

  if (Array.isArray(raw.experiences)) {
    out.experiences = raw.experiences.map(e => ({
      title: e.title || '',
      organization: e.organization || '',
      period: e.period || '',
      category: e.category || '',
      location: e.location || '',
      description: e.description || e.summary || '',
      bullets: e.bullets || e.highlights || [],
      tags: e.tags || []
    }));
  }
  if (Array.isArray(raw.projects)) {
    out.projects = raw.projects.map(p => ({
      title: p.title || '',
      type: p.type || '',
      summary: p.summary || p.description || '',
      tags: p.tags || p.tools || [],
      image_url: p.image_url || p.image || '',
      link: p.link || '#'
    }));
  }
  if (Array.isArray(raw.education)) {
    out.education = raw.education.map(e => ({
      degree: e.degree || '',
      institution: e.institution || '',
      year: e.year || e.period || '',
      details: Array.isArray(e.details) ? e.details.join('; ') : (e.details || '')
    }));
  }

  return out;
}

function ensureContent(raw) {
  const d = structuredClone(window.DEFAULT_SITE_CONTENT);
  const migrated = migrateLegacy(raw || {});
  const merged = deepMerge(d, migrated);

  if (typeof merged.about === 'string') merged.about = { paragraphs: [merged.about], stats: d.about.stats, focusAreas: d.about.focusAreas };
  if (!merged.about || typeof merged.about !== 'object') merged.about = structuredClone(d.about);
  if (!Array.isArray(merged.about.paragraphs)) merged.about.paragraphs = d.about.paragraphs;
  if (!Array.isArray(merged.about.stats)) merged.about.stats = d.about.stats;
  if (!Array.isArray(merged.about.focusAreas)) merged.about.focusAreas = d.about.focusAreas;
  if (!Array.isArray(merged.hero?.floatingLabels)) merged.hero.floatingLabels = d.hero.floatingLabels;
  if (!Array.isArray(merged.hero?.buttons)) merged.hero.buttons = d.hero.buttons;
  if (!Array.isArray(merged.hero?.tags)) merged.hero.tags = d.hero.tags;

  return merged;
}

async function loadData() {
  if (!sb) return render();
  try {
    const { data, error } = await sb.from('site_settings').select('content').eq('id', 'main').maybeSingle();
    if (error) throw error;
    if (data?.content) content = ensureContent(data.content);
  } catch (e) {
    console.warn('Using demo data because Supabase content was not loaded:', e.message);
  }
  render();
  await renderRemoteCollections();
}

function render() {
  document.title = content.site.pageTitle || content.site.name || 'Portfolio';
  $('meta[name="description"]')?.setAttribute('content', content.site.metaDescription || 'Portfolio');

  const brandLogo = $('#brandLogo');
  const logoUrl = content.site.logoImage || '';
  if (brandLogo) {
    if (logoUrl) {
      brandLogo.innerHTML = `<img src="${escapeHTML(logoUrl)}" alt="${escapeHTML(content.site.logoAlt || content.site.name || 'Logo')}">`;
      brandLogo.classList.add('has-image');
    } else {
      brandLogo.textContent = content.site.logoText || 'ABS';
      brandLogo.classList.remove('has-image');
    }
  }

  setText('#brandName', content.site.name || '');
  setText('#brandSub', content.site.brandSubtitle || '');

  renderNav();
  renderHero();
  renderAbout();
  renderExperience();
  renderProjects();
  renderSkills();
  renderResearch();
  renderContact();
  renderFooter();
  initInteractions();
}

function renderNav() {
  const map = content.nav || {};
  setHTML('#navLinks', ['about', 'experience', 'projects', 'skills', 'certificates', 'gallery', 'posts', 'contact'].map(id => `<a href="#${id}">${escapeHTML(map[id] || id)}</a>`).join(''));
  const mobile = $('#mobileMenu');
  if (mobile) mobile.onclick = () => $('#navLinks')?.classList.toggle('open');
}

function renderHero() {
  const h = content.hero || {};
  setText('#heroEyebrow', h.eyebrow || '');
  setText('#heroAvailability', h.availability || '');
  setText('#heroTitle', h.title || content.site.name || '');
  setText('#heroHeadline', h.headline || '');
  setText('#heroSummary', h.summary || '');
  setHTML('#heroTags', safeArr(h.tags).map(t => `<span class="pill">${escapeHTML(t)}</span>`).join(''));
  setHTML('#heroButtons', safeArr(h.buttons).map(b => `<a class="btn ${b.style === 'secondary' ? 'secondary' : 'primary'}" href="${escapeHTML(b.url || b.href || '#')}">${escapeHTML(b.label || 'Button')}</a>`).join(''));

  setText('#visualCaption', h.visualCaption || '');
  setText('#visualTitle', h.visualTitle || 'ABS');
  setText('#visualFooterTitle', h.visualFooterTitle || h.location || '');
  setText('#visualFooterText', h.visualFooterText || '');

  const img = $('#profilePhoto');
  const placeholder = $('#absPlaceholder');
  if (img && placeholder) {
    if (h.profileImage) {
      img.src = h.profileImage;
      img.alt = h.profileAlt || 'Profile photo';
      img.style.display = 'block';
      placeholder.style.display = 'none';
    } else {
      img.removeAttribute('src');
      img.style.display = 'none';
      placeholder.textContent = h.visualTitle || 'ABS';
      placeholder.style.display = 'block';
    }
  }

  setHTML('#floatingLabels', safeArr(h.floatingLabels).map((f, i) => {
    const x = Number(f.x ?? 50), y = Number(f.y ?? 50);
    const awayX = x < 50 ? '-150px' : '150px';
    const awayY = y < 50 ? '-115px' : '115px';
    return `<span class="float-label" style="--x:${x};--y:${y};--delay:${(Number(f.delay) || (i % 5) * .18)}s;--away-x:${awayX};--away-y:${awayY}">${escapeHTML(f.label || '')}</span>`;
  }).join(''));
}

function renderSectionHead(id) {
  const s = content.sections?.[id] || {};
  return `<div class="section-head reveal"><div><div class="eyebrow">${escapeHTML(s.eyebrow || '')}</div><h2>${escapeHTML(s.title || '')}</h2></div><p class="section-sub">${escapeHTML(s.subtitle || '')}</p></div>`;
}

function renderAbout() {
  const focus = safeArr(content.about?.focusAreas);
  setHTML('#about', renderSectionHead('about') + `<div class="grid cards-2"><div class="card reveal">${safeArr(content.about?.paragraphs).map(p => `<p>${escapeHTML(p)}</p>`).join('')}${focus.length ? `<div class="chip-row">${focus.map(f => `<span class="chip">${escapeHTML(f)}</span>`).join('')}</div>` : ''}</div><div><div class="stat-grid">${safeArr(content.about?.stats).map(s => `<div class="stat reveal"><strong>${escapeHTML(s.value)}</strong><span>${escapeHTML(s.label)}</span></div>`).join('')}</div></div></div><div class="grid cards-2" style="margin-top:22px">${safeArr(content.education).map(e => `<article class="card reveal"><div class="mini">${escapeHTML(e.year)}</div><h3>${escapeHTML(e.degree)}</h3><p><strong>${escapeHTML(e.institution)}</strong></p><p>${escapeHTML(e.details)}</p></article>`).join('')}</div>`);
}

function renderExperience() {
  setHTML('#experience', renderSectionHead('experience') + `<div class="timeline">${safeArr(content.experiences).map(e => `<article class="card timeline-card reveal"><div><div class="period">${escapeHTML(e.period)}</div><div class="mini">${escapeHTML(e.category)}</div></div><div><h3>${escapeHTML(e.title)}</h3><p><strong>${escapeHTML(e.organization)}</strong></p><p>${escapeHTML(e.description)}</p><ul>${safeArr(e.bullets).map(b => `<li>${escapeHTML(b)}</li>`).join('')}</ul><div class="chip-row">${safeArr(e.tags).map(t => `<span class="chip">${escapeHTML(t)}</span>`).join('')}</div></div></article>`).join('')}</div>`);
}

function renderProjects() {
  setHTML('#projects', renderSectionHead('projects') + `<div class="grid cards-3">${safeArr(content.projects).map(p => `<article class="card reveal">${p.image_url ? `<img class="project-img" src="${escapeHTML(p.image_url)}" alt="${escapeHTML(p.title)}">` : ''}<div class="mini">${escapeHTML(p.type)}</div><h3>${escapeHTML(p.title)}</h3><p>${escapeHTML(p.summary)}</p><div class="chip-row">${safeArr(p.tags).map(t => `<span class="chip">${escapeHTML(t)}</span>`).join('')}</div></article>`).join('')}</div>`);
}

function renderSkills() {
  setHTML('#skills', renderSectionHead('skills') + `<div class="grid cards-2">${safeArr(content.skills).map(g => `<article class="card reveal"><h3>${escapeHTML(g.group)}</h3><div class="skill-list">${safeArr(g.items).map(i => `<span>${escapeHTML(i)}</span>`).join('')}</div></article>`).join('')}</div>`);
}

function renderResearch() {
  const html = safeArr(content.researchHighlights).map(r => `<article class="card reveal"><h3>${escapeHTML(r.title)}</h3><p>${escapeHTML(r.text)}</p></article>`).join('');
  setHTML('#researchHighlights', html ? `<div class="section-head reveal"><div><div class="eyebrow">Research</div><h2>Research direction</h2></div></div><div class="grid cards-3">${html}</div>` : '');
}

async function renderRemoteCollections() {
  await Promise.all([renderGallery(), renderCertificates(), renderPosts()]);
  initReveal();
}

async function fetchRows(table) {
  if (!sb) return [];
  const { data, error } = await sb.from(table).select('*').eq('published', true).order('sort_order', { ascending: true }).order('created_at', { ascending: false });
  if (error) { console.warn(error.message); return []; }
  return data || [];
}

async function renderGallery() {
  const rows = await fetchRows('gallery');
  const fallback = safeArr(content.gallery).map((g, i) => ({ id: 'demo-' + i, title: g.title, caption: g.caption, image_url: g.image || '', published: true }));
  const items = rows.length ? rows : fallback;
  setHTML('#gallery', renderSectionHead('gallery') + (items.length ? `<div class="masonry">${items.map(g => `<figure class="masonry-item reveal">${g.image_url ? `<img src="${escapeHTML(g.image_url)}" alt="${escapeHTML(g.title || 'Gallery image')}" loading="lazy">` : `<div class="media-placeholder">${escapeHTML(g.title || 'Add photo')}</div>`}<figcaption class="masonry-caption"><strong>${escapeHTML(g.title || '')}</strong><p>${escapeHTML(g.caption || '')}</p></figcaption></figure>`).join('')}</div>` : `<div class="card reveal"><p>Gallery is ready. Upload photos from the private app.</p></div>`));
}

async function renderCertificates() {
  const rows = await fetchRows('certificates');
  const fallback = safeArr(content.certificates).map((c, i) => ({ id: 'demo-' + i, title: c.title, issuer: c.issuer, year: c.year, image_url: c.image || '', published: true, description: c.description, type: c.type }));
  const items = rows.length ? rows : fallback;
  setHTML('#certificates', renderSectionHead('certificates') + (items.length ? `<div class="grid cards-3">${items.map(c => `<article class="card reveal">${c.image_url ? `<img class="cert-img" src="${escapeHTML(c.image_url)}" alt="${escapeHTML(c.title)}" loading="lazy">` : ''}<div class="mini">${escapeHTML(c.year || c.type || '')}</div><h3>${escapeHTML(c.title)}</h3><p>${escapeHTML(c.issuer || '')}</p>${c.description ? `<p>${escapeHTML(c.description)}</p>` : ''}</article>`).join('')}</div>` : `<div class="card reveal"><p>Certificate corner is ready. Add certificates from the private app.</p></div>`));
}

async function renderPosts() {
  const rows = await fetchRows('posts');
  setHTML('#posts', renderSectionHead('posts') + (rows.length ? `<div class="grid cards-3">${rows.map(p => `<article class="card reveal">${p.image_url ? `<img class="project-img" src="${escapeHTML(p.image_url)}" alt="${escapeHTML(p.title)}" loading="lazy">` : ''}<h3>${escapeHTML(p.title)}</h3><p>${escapeHTML(p.body || '')}</p><div class="mini">${new Date(p.created_at).toLocaleDateString()}</div></article>`).join('')}</div>` : `<div class="card reveal"><p>No updates yet. Add posts from the private app.</p></div>`));
}

function renderContact() {
  const c = content.contact || {};
  setHTML('#contact', renderSectionHead('contact') + `<div class="contact-wrap"><div class="card reveal"><h3>${escapeHTML(c.location || '')}</h3><p>Email: ${escapeHTML(c.email || '')}</p><p>Phone: ${escapeHTML(c.phone || 'Add phone later')}</p><div class="chip-row">${safeArr(c.social).map(s => s.url ? `<a class="chip" href="${escapeHTML(s.url)}" target="_blank" rel="noreferrer">${escapeHTML(s.label)}</a>` : `<span class="chip">${escapeHTML(s.label)}</span>`).join('')}</div></div><form id="contactForm" class="form card reveal"><input name="name" placeholder="Your name" required><input name="email" placeholder="Your email" type="email"><textarea name="message" placeholder="Write your message" required></textarea><button class="btn primary" type="submit">Send message</button><div id="formNotice" class="notice"></div></form></div>`);
  $('#contactForm')?.addEventListener('submit', submitMessage);
}

async function submitMessage(e) {
  e.preventDefault();
  const fd = new FormData(e.currentTarget);
  const notice = $('#formNotice');
  const payload = { name: fd.get('name'), email: fd.get('email'), message: fd.get('message') };
  try {
    const { error } = await sb.from('messages').insert(payload);
    if (error) throw error;
    if (notice) { notice.textContent = 'Message sent successfully. Thank you.'; notice.className = 'notice show'; notice.style.display = 'block'; }
    e.currentTarget.reset();
  } catch (err) {
    if (notice) { notice.textContent = 'Could not send message right now. Please email directly.'; notice.className = 'notice error show'; notice.style.display = 'block'; }
  }
}

function renderFooter() {
  setHTML('#footer', `<div class="footer-inner"><div>${escapeHTML(content.site.footerText || '')}</div><div>${escapeHTML(content.site.footerCredit || '')}</div></div>`);
}

function initInteractions() {
  const visual = $('#heroVisual');
  visual?.addEventListener('mousemove', e => {
    const r = visual.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top) / r.height - .5;
    visual.style.setProperty('--ry', `${x * 10}deg`);
    visual.style.setProperty('--rx', `${-y * 10}deg`);
  });
  visual?.addEventListener('mouseleave', () => {
    visual.style.setProperty('--ry', '0deg');
    visual.style.setProperty('--rx', '0deg');
  });
  $$('.masonry img').forEach(img => img.onclick = () => openLightbox(img.src));
  initReveal();
  initScrollNav();
}

function initReveal() {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }), { threshold: .12 });
  $$('.reveal').forEach(el => io.observe(el));
}

function initScrollNav() {
  const sections = ['about', 'experience', 'projects', 'skills', 'certificates', 'gallery', 'posts', 'contact'];
  window.addEventListener('scroll', () => {
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const progress = $('#progress');
    if (progress) progress.style.width = `${(scrollY / max) * 100}%`;
    const current = sections.findLast(id => (($('#' + id)?.offsetTop || 0) - 180 <= scrollY));
    $$('#navLinks a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
  }, { passive: true });
}

function openLightbox(src) {
  setHTML('#lightboxImg', '');
  const img = $('#lightboxImg');
  if (img) img.src = src;
  $('#lightbox')?.classList.add('open');
}

$('#lightboxClose')?.addEventListener('click', () => $('#lightbox')?.classList.remove('open'));
$('#lightbox')?.addEventListener('click', e => { if (e.target.id === 'lightbox') $('#lightbox')?.classList.remove('open'); });

loadData();
