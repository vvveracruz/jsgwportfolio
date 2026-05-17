const ORBIT_RADIUS = 0.47;  // fraction of photo half-dimensions (0.5 = edge, >0.5 = outside)
const ORBIT_SPEED  = [400, 400]; // [min, max] seconds per orbit
const PHOTO_OFFSET = [80, 60];   // [x, y] max px offset from center

const seen = new Set();

let photos = [];
let tagCounts = {};
let current = null;

async function init() {
  const res = await fetch('photos.json', { cache: 'no-store' });
  photos = await res.json();

  for (const p of photos) {
    for (const t of p.tags) {
      tagCounts[t] = (tagCounts[t] || 0) + 1;
    }
  }

  showRandom(null);
}

function validTags(photo) {
  return photo.tags.filter((t) => tagCounts[t] > 1);
}

function pickUnseen(pool) {
  const unseen = pool.filter((p) => !seen.has(p.id));
  if (unseen.length === 0) return null;
  return unseen[Math.floor(Math.random() * unseen.length)];
}

function showRandom(fromTag, clickedEl) {
  const pool = fromTag
    ? photos.filter((p) => p.tags.includes(fromTag) && p.id !== current?.id)
    : photos.filter((p) => p.tags.length > 0 && p.id !== current?.id);

  const photo = pickUnseen(pool);

  if (!photo) {
    flashExhausted(clickedEl);
    return;
  }

  seen.add(photo.id);
  current = photo;
  render(photo);
}

function render(photo) {
  const img = document.getElementById('photo');
  const wrap = document.getElementById('photo-wrap');
  img.classList.remove('loaded');

  const ox = ((Math.random() - 0.5) * 2 * PHOTO_OFFSET[0]).toFixed(0);
  const oy = ((Math.random() - 0.5) * 2 * PHOTO_OFFSET[1]).toFixed(0);
  wrap.style.transform = `translate(${ox}px, ${oy}px)`;

  img.onload = () => {
    img.classList.add('loaded');
    placeTags(photo);
  };
  img.src = photo.file;
}

function makePath(rx, ry) {
  const WAYPOINTS = 12;
  const JITTER = 0.15;
  const start = Math.random() * Math.PI * 2;

  const pts = Array.from({ length: WAYPOINTS }, (_, k) => {
    const angle = start - (k / WAYPOINTS) * Math.PI * 2;
    const jx = 1 + (Math.random() - 0.5) * 2 * JITTER;
    const jy = 1 + (Math.random() - 0.5) * 2 * JITTER;
    return {
      x: (rx * jx * Math.cos(angle)).toFixed(1),
      y: (ry * jy * Math.sin(angle)).toFixed(1),
    };
  });
  pts.push(pts[0]);

  return pts
    .map((p, k) => `${Math.round((k / WAYPOINTS) * 100)}% { translate: ${p.x}px ${p.y}px; }`)
    .join(' ');
}

function placeTags(photo) {
  const img = document.getElementById('photo');
  const container = document.getElementById('tags');
  container.innerHTML = '';

  let styleEl = document.getElementById('tag-keyframes');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'tag-keyframes';
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = '';

  const rx = img.offsetWidth * ORBIT_RADIUS;
  const ry = img.offsetHeight * ORBIT_RADIUS;

  const tags = validTags(photo);

  tags.forEach((tag, i) => {
    const el = document.createElement('span');
    el.className = 'tag';
    el.textContent = tag;
    el.style.left = '50%';
    el.style.top = '50%';

    const name = `tf${i}`;
    const dur = (ORBIT_SPEED[0] + Math.random() * (ORBIT_SPEED[1] - ORBIT_SPEED[0])).toFixed(1) + 's';
    const delay = (Math.random() * -ORBIT_SPEED[1]).toFixed(1) + 's';
    styleEl.textContent += `@keyframes ${name} { ${makePath(rx, ry)} }\n`;
    el.style.animation = `${name} ${dur} linear ${delay} infinite`;

    el.addEventListener('click', () => showRandom(tag, el));
    container.appendChild(el);
  });

  const randEl = document.createElement('span');
  randEl.className = 'tag';
  randEl.textContent = 'random';
  randEl.style.left = '50%';
  randEl.style.top = '50%';

  const randName = `tf${tags.length}`;
  const randDur = (ORBIT_SPEED[0] + Math.random() * (ORBIT_SPEED[1] - ORBIT_SPEED[0])).toFixed(1) + 's';
  const randDelay = (Math.random() * -ORBIT_SPEED[1]).toFixed(1) + 's';
  styleEl.textContent += `@keyframes ${randName} { ${makePath(rx, ry)} }\n`;
  randEl.style.animation = `${randName} ${randDur} linear ${randDelay} infinite`;

  randEl.addEventListener('click', () => showRandom(null, randEl));
  container.appendChild(randEl);
}

function flashExhausted(clickedEl) {
  document.querySelector('.tag-exhausted')?.remove();

  const el = document.createElement('span');
  el.className = 'tag tag-exhausted';
  el.textContent = "you've seen all of these";

  const parent = clickedEl ?? document.getElementById('tags');
  parent.appendChild(el);
}

init();
