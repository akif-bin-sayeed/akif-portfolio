const DATA_PATH = 'data/profile.json';

const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];
const clean = (value = '') => String(value ?? '').trim();
const pathValue = (obj, path) => path.split('.').reduce((acc, key) => acc?.[key], obj);

function createEl(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined && text !== null) element.textContent = text;
  return element;
}

function safeURL(url) {
  const value = clean(url);
  if (!value || value === '#') return '#';
  try {
    const parsed = new URL(value, window.location.origin);
    if (['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)) return value;
  } catch (error) {
    return '#';
  }
  return '#';
}

function setTextFields(data) {
  qsa('[data-field]').forEach((node) => {
    const value = pathValue(data, node.dataset.field);
    if (value !== undefined && value !== null && clean(value) !== '') node.textContent = value;
  });
}

function renderTagList(container, items = []) {
  container.innerHTML = '';
  items.filter(Boolean).forEach((item) => container.append(createEl('span', 'tag', item)));
}

function renderHero(data) {
  qsa('[data-list="personal.heroTags"]').forEach((node) => renderTagList(node, data.personal?.heroTags || []));
  const profile = qs('[data-profile-visual]');
  const image = clean(data.personal?.profileImage);
  if (profile && image) {
    profile.classList.add('has-image');
    profile.style.backgroundImage = `linear-gradient(145deg, rgba(23, 122, 78, .38), rgba(107, 193, 109, .18)), url('${image}')`;
  }
}

function renderStats(data) {
  const container = qs('[data-stats]');
  if (!container) return;
  container.innerHTML = '';
  (data.stats || []).forEach((stat) => {
    const card = createEl('article', 'stat-card reveal');
    card.append(createEl('div', 'stat-value', stat.value));
    card.append(createEl('div', 'stat-label', stat.label));
    container.append(card);
  });
}

function renderAbout(data) {
  const paraContainer = qs('[data-paragraphs="about.paragraphs"]');
  if (paraContainer) {
    paraContainer.innerHTML = '';
    (data.about?.paragraphs || []).forEach((paragraph) => paraContainer.append(createEl('p', '', paragraph)));
  }
  const focusList = qs('[data-list-ul="about.focusAreas"]');
  if (focusList) {
    focusList.innerHTML = '';
    (data.about?.focusAreas || []).forEach((area) => focusList.append(createEl('li', '', area)));
  }
}

function categoryList(experiences = []) {
  return ['All', ...new Set(experiences.map((item) => item.category).filter(Boolean))];
}

function experienceCard(item) {
  const card = createEl('article', 'experience-card reveal');
  card.dataset.category = item.category || 'Other';
  const top = createEl('div', 'card-top');
  const topText = createEl('div');
  topText.append(createEl('span', 'badge', item.category || 'Experience'));
  topText.append(createEl('h3', '', item.title || 'Untitled role'));
  topText.append(createEl('p', 'period', `${item.organization || ''}${item.period ? ' · ' + item.period : ''}`));
  top.append(topText);
  card.append(top);
  if (item.location) card.append(createEl('p', 'period', item.location));
  card.append(createEl('p', 'card-summary', item.summary || ''));
  renderTagList(card.appendChild(createEl('div', 'tag-list')), item.tags || []);
  const toggle = createEl('button', 'details-toggle', 'View highlights +');
  toggle.type = 'button';
  card.append(toggle);
  const details = createEl('div', 'card-details');
  const list = createEl('ul');
  (item.highlights || []).forEach((highlight) => list.append(createEl('li', '', highlight)));
  details.append(list);
  card.append(details);
  toggle.addEventListener('click', () => {
    card.classList.toggle('open');
    toggle.textContent = card.classList.contains('open') ? 'Hide highlights −' : 'View highlights +';
  });
  return card;
}

function renderExperience(data) {
  const filters = qs('[data-filters]');
  const grid = qs('[data-experience]');
  if (!filters || !grid) return;
  const experiences = data.experiences || [];
  filters.innerHTML = '';
  grid.innerHTML = '';
  categoryList(experiences).forEach((category, index) => {
    const button = createEl('button', `filter-btn${index === 0 ? ' active' : ''}`, category);
    button.type = 'button';
    button.addEventListener('click', () => {
      qsa('.filter-btn', filters).forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');
      qsa('.experience-card', grid).forEach((card) => {
        card.style.display = category === 'All' || card.dataset.category === category ? '' : 'none';
      });
    });
    filters.append(button);
  });
  experiences.forEach((item) => grid.append(experienceCard(item)));
}

function renderProjects(data) {
  const grid = qs('[data-projects]');
  if (!grid) return;
  grid.innerHTML = '';
  (data.projects || []).forEach((project) => {
    const card = createEl('article', 'project-card reveal');
    card.append(createEl('p', 'project-type', project.type || 'Project'));
    card.append(createEl('h3', '', project.title || 'Untitled project'));
    card.append(createEl('p', 'card-summary', project.description || ''));
    renderTagList(card.appendChild(createEl('div', 'tag-list')), project.tools || []);
    if (project.link && project.link !== '#') {
      const link = createEl('a', 'details-toggle', 'Open project →');
      link.href = safeURL(project.link);
      link.target = '_blank';
      link.rel = 'noreferrer noopener';
      card.append(link);
    }
    grid.append(card);
  });
}

function renderSkills(data) {
  const grid = qs('[data-skills]');
  if (!grid) return;
  grid.innerHTML = '';
  (data.skills || []).forEach((group) => {
    const card = createEl('article', 'skill-card reveal');
    card.append(createEl('h3', '', group.group || 'Skill group'));
    const pills = createEl('div', 'skill-pills');
    (group.items || []).forEach((skill) => pills.append(createEl('span', 'pill', skill)));
    card.append(pills);
    grid.append(card);
  });
  const achievements = qs('[data-achievements]');
  if (achievements) {
    achievements.innerHTML = '';
    const list = createEl('ul');
    (data.achievements || []).forEach((achievement) => list.append(createEl('li', '', achievement)));
    achievements.append(list);
  }
}

function renderEducation(data) {
  const timeline = qs('[data-education]');
  if (!timeline) return;
  timeline.innerHTML = '';
  (data.education || []).forEach((item) => {
    const card = createEl('article', 'timeline-item reveal');
    card.append(createEl('span', 'badge', item.period || ''));
    card.append(createEl('h3', '', item.degree || 'Degree'));
    card.append(createEl('p', 'period', item.institution || ''));
    const list = createEl('ul');
    (item.details || []).forEach((detail) => list.append(createEl('li', '', detail)));
    card.append(list);
    timeline.append(card);
  });
}

function renderGallery(data) {
  const grid = qs('[data-gallery]');
  if (!grid) return;
  grid.innerHTML = '';
  (data.gallery || []).forEach((item) => {
    const card = createEl('article', 'gallery-card reveal');
    const media = createEl('div', 'gallery-media');
    if (clean(item.image)) {
      const img = document.createElement('img');
      img.src = item.image;
      img.alt = item.title || 'Gallery image';
      media.append(img);
    } else {
      media.textContent = 'Add Photo';
    }
    card.append(media);
    card.append(createEl('h3', '', item.title || 'Gallery item'));
    card.append(createEl('p', 'card-summary', item.caption || ''));
    grid.append(card);
  });
}

function renderContact(data) {
  const container = qs('[data-contact-links]');
  if (!container) return;
  container.innerHTML = '';
  const links = [];
  if (data.personal?.email) links.push({ label: 'Email', url: `mailto:${data.personal.email}` });
  if (data.personal?.phone) links.push({ label: 'Phone', url: `tel:${data.personal.phone}` });
  (data.personal?.socialLinks || []).forEach((link) => {
    if (link.url && link.url !== '#') links.push(link);
  });
  if (!links.length) {
    container.append(createEl('span', 'tag', 'Add email and social links in the admin panel'));
    return;
  }
  links.forEach((link) => {
    const anchor = createEl('a', 'tag', link.label);
    anchor.href = safeURL(link.url);
    if (!anchor.href.startsWith('mailto:') && !anchor.href.startsWith('tel:')) {
      anchor.target = '_blank';
      anchor.rel = 'noreferrer noopener';
    }
    container.append(anchor);
  });
}

function setupNavigation() {
  const navToggle = qs('.nav-toggle');
  const navLinks = qs('[data-nav-links]');
  if (!navToggle || !navLinks) return;
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  qsa('a', navLinks).forEach((link) => link.addEventListener('click', () => navLinks.classList.remove('open')));
}

function setupTheme() {
  const root = document.documentElement;
  const saved = localStorage.getItem('theme');
  if (saved) root.dataset.theme = saved;
  qs('.theme-toggle')?.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    localStorage.setItem('theme', next);
  });
}

function setupReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  qsa('.reveal').forEach((node) => observer.observe(node));
}

function setupNetlifyIdentity() {
  if (window.netlifyIdentity) {
    window.netlifyIdentity.on('init', (user) => {
      if (!user && window.location.hash.includes('invite_token')) window.netlifyIdentity.open('signup');
    });
    window.netlifyIdentity.on('login', () => { window.location.href = '/admin/'; });
  }
}

async function boot() {
  setupNavigation();
  setupTheme();
  setupNetlifyIdentity();
  qs('[data-year]').textContent = new Date().getFullYear();

  try {
    const response = await fetch(DATA_PATH, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Could not load ${DATA_PATH}`);
    const data = await response.json();
    setTextFields(data);
    renderHero(data);
    renderStats(data);
    renderAbout(data);
    renderExperience(data);
    renderProjects(data);
    renderSkills(data);
    renderEducation(data);
    renderGallery(data);
    renderContact(data);
  } catch (error) {
    console.error(error);
    const main = qs('#main');
    const warning = createEl('div', 'wrap');
    warning.style.padding = '20px 0';
    warning.innerHTML = '<p class="tag">Content could not load. Please run this site through a local server or after deployment.</p>';
    main.prepend(warning);
  } finally {
    setupReveal();
  }
}

boot();
