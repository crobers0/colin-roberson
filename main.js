let zIndexCounter = 10;

document.addEventListener('DOMContentLoaded', () => {
  initStats(); initClock(); initWeather(); initPing(); initSpotify();
  setupDesktop(); initBlog(); initProjects(); drawAvatar();
});

async function initStats() {
  try {
    const res = await fetch('/api/stats');
    const j = await res.json();
    document.getElementById('last-update').textContent = j.last_update;
    document.getElementById('visits').textContent = j.visits;
  } catch (e) { console.error(e); }
}

function initClock() {
  const el = document.getElementById('taskbar-time');
  setInterval(() => {
    el.textContent = 'local time: ' + new Date().toLocaleTimeString();
  }, 1000);
}

async function initWeather() {
  const el = document.getElementById('weather');
  const key = 'YOUR_OPENWEATHERMAP_KEY';
  const loc = '37.77,-122.42';
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${loc.split(',')[0]}&lon=${loc.split(',')[1]}&units=metric&appid=${key}`;
    const r = await fetch(url);
    const j = await r.json();
    el.textContent = `${j.weather[0].main}, ${j.main.temp}°C`;
  } catch {
    el.textContent = 'n/a';
  }
}

async function initPing() {
  const el = document.getElementById('ping');
  const start = performance.now();
  await fetch('/api/ping');
  el.textContent = Math.round(performance.now() - start) + ' ms';
}

async function initSpotify() {
  const a = document.getElementById('now-playing');
  a.href = 'https://open.spotify.com';
  a.textContent = 'My Spotify';
}

function bringToFront(win) {
  zIndexCounter += 1;
  win.style.zIndex = zIndexCounter;
}

function setupDesktop() {
  const tabs = document.getElementById('taskbar-tabs');
  document.querySelectorAll('.icon').forEach(ic => {
    ic.addEventListener('click', () => {
      const id = ic.dataset.window;
      const win = document.getElementById(id);
      const label = ic.textContent;
      let tb = tabs.querySelector(`.taskbar-item[data-window="${id}"]`);
      if (!tb) {
        tb = document.createElement('div');
        tb.className = 'taskbar-item';
        tb.dataset.window = id;
        tb.textContent = label;
        tb.addEventListener('click', () => {
          win.style.display = 'flex';
          bringToFront(win);
        });
        tabs.append(tb);
      }
      win.style.display = 'flex';
      bringToFront(win);
    });
  });

  document.querySelectorAll('.window').forEach(win => {
    win.addEventListener('mousedown', () => bringToFront(win));
    win.querySelector('.minimize').addEventListener('click', () => {
      win.style.display = 'none';
    });
    win.querySelector('.close').addEventListener('click', () => {
      const id = win.id;
      win.style.display = 'none';
      const tb = document.querySelector(`#taskbar-tabs .taskbar-item[data-window="${id}"]`);
      if (tb) tb.remove();
    });
  });
}

function createCard(filename, fullText, html, previewLength) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  const titleElem = tmp.querySelector('h1, h2, h3, h4, h5');
  const title = titleElem ? titleElem.textContent : filename;
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.html = html;
  card.dataset.full = fullText;
  card.dataset.filename = filename;
  const h4 = document.createElement('h4'); h4.textContent = title;
  const p = document.createElement('p');
  p.textContent = fullText.slice(0, previewLength) + '...';
  card.append(h4, p);
  card.addEventListener('click', () => openFullView(card));
  return card;
}

function openFullView(card) {
  const windowEl = card.closest('.window');
  const controls = windowEl.querySelector('.view-controls');
  const grid = windowEl.querySelector('.cards-grid');
  controls.style.display = 'none';
  grid.style.display = 'none';
  const view = windowEl.querySelector('.full-view');
  view.style.display = 'flex';
  bringToFront(windowEl);
  view.querySelector('.content').innerHTML = card.dataset.html;
}

function closeFullView(windowId) {
  const windowEl = document.getElementById(windowId);
  windowEl.querySelector('.view-controls').style.display = 'flex';
  windowEl.querySelector('.cards-grid').style.display = 'grid';
  windowEl.querySelector('.full-view').style.display = 'none';
}

async function initBlog() {
  const grid = document.getElementById('blog-cards');
  const sizeButtons = grid.parentElement.querySelectorAll('.view-controls button');
  const posts = await fetch('/api/posts').then(r => r.json());
  let currentSize = 'medium';
  const sizeMap = { small: 50, medium: 100, large: 200 };
  for (const fname of posts) {
    const md = await fetch('/posts/' + fname).then(r => r.text());
    const html = marked.parse(md);
    const text = html.replace(/<[^>]+>/g, ' ').trim();
    grid.append(createCard(fname, text, html, sizeMap[currentSize]));
  }
  sizeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      sizeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSize = btn.dataset.size;
      grid.className = 'cards-grid ' + currentSize;
      grid.querySelectorAll('.card').forEach(card => {
        const len = sizeMap[currentSize];
        card.querySelector('p').textContent = card.dataset.full.slice(0, len) + '...';
      });
    });
  });
  document.querySelector('#blog-view .back').addEventListener('click', () => closeFullView('blog'));
}

async function initProjects() {
  const grid = document.getElementById('project-cards');
  const sizeButtons = grid.parentElement.querySelectorAll('.view-controls button');
  const projs = await fetch('/api/projects').then(r => r.json());
  let currentSize = 'medium';
  const sizeMap = { small: 50, medium: 100, large: 200 };
  for (const fname of projs) {
    const md = await fetch('/projects/' + fname).then(r => r.text());
    const html = marked.parse(md);
    const text = html.replace(/<[^>]+>/g, ' ').trim();
    grid.append(createCard(fname, text, html, sizeMap[currentSize]));
  }
  sizeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      sizeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSize = btn.dataset.size;
      grid.className = 'cards-grid ' + currentSize;
      grid.querySelectorAll('.card').forEach(card => {
        const len = sizeMap[currentSize];
        card.querySelector('p').textContent = card.dataset.full.slice(0, len) + '...';
      });
    });
  });
  document.querySelector('#projects-view .back').addEventListener('click', () => closeFullView('projects'));
}

function drawAvatar() {
  const c = document.getElementById('avatar-canvas'), ctx = c.getContext('2d');
  let x=50,y=50,dx=2,dy=1.5;
  function step() {
    ctx.fillStyle='#000'; ctx.fillRect(0,0,c.width,c.height);
    ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--fg');
    ctx.fillRect(x,y,10,10);
    x+=dx; y+=dy;
    if(x<0||x>c.width-10)dx=-dx;
    if(y<0||y>c.height-10)dy=-dy;
    requestAnimationFrame(step);
  }
  step();
}