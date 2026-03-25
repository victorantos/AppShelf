// AppShelf - Personal App Catalog

const MANIFEST_URL = './apps.json';

// ── State ──
let manifest = null;
let pullStartY = 0;
let isPulling = false;

// ── Init ──
document.addEventListener('DOMContentLoaded', async () => {
  registerServiceWorker();
  await loadAndRender();
  setupPullToRefresh();
});

// ── Data ──
async function loadManifest() {
  try {
    const res = await fetch(MANIFEST_URL + '?t=' + Date.now());
    if (!res.ok) throw new Error('Network response not ok');
    return await res.json();
  } catch (e) {
    console.warn('Failed to fetch manifest, using cached:', e);
    // Service worker will serve cached version
    try {
      const res = await fetch(MANIFEST_URL);
      return await res.json();
    } catch {
      return null;
    }
  }
}

async function loadAndRender() {
  manifest = await loadManifest();
  if (manifest) {
    renderHeader(manifest);
    renderAppList(manifest.apps);
  } else {
    renderEmpty();
  }
}

// ── Header ──
function renderHeader(data) {
  document.getElementById('header-title').textContent = data.name || 'AppShelf';
  document.getElementById('header-subtitle').textContent = 'Build ' + data.build;
}

// ── App List ──
function renderAppList(apps) {
  const container = document.getElementById('app-list');
  // Keep pull indicator, remove the rest
  const pullIndicator = document.getElementById('pull-indicator');
  container.innerHTML = '';
  container.appendChild(pullIndicator);

  if (!apps || apps.length === 0) {
    renderEmpty();
    return;
  }

  apps.forEach((app, i) => {
    container.appendChild(createAppRow(app));
    if (i < apps.length - 1) {
      const sep = document.createElement('div');
      sep.className = 'app-row-separator';
      container.appendChild(sep);
    }
  });
}

function createAppRow(app) {
  const row = document.createElement('div');
  row.className = 'app-row';

  // Icon
  const iconWrap = document.createElement('div');
  iconWrap.className = 'app-icon';

  const img = document.createElement('img');
  img.src = app.icon;
  img.alt = app.name;
  img.loading = 'lazy';
  img.onerror = () => {
    img.remove();
    const fallback = document.createElement('span');
    fallback.className = 'app-icon-fallback';
    fallback.textContent = app.name.charAt(0).toUpperCase();
    iconWrap.appendChild(fallback);
  };
  iconWrap.appendChild(img);

  // Info
  const info = document.createElement('div');
  info.className = 'app-info';

  const name = document.createElement('div');
  name.className = 'app-name';
  name.textContent = app.name;

  const meta = document.createElement('div');
  meta.className = 'app-meta';
  meta.textContent = `v${app.version} \u00B7 Build ${app.build}`;

  const date = document.createElement('div');
  date.className = 'app-date';
  date.textContent = app.date;

  info.appendChild(name);
  info.appendChild(meta);
  info.appendChild(date);

  // Action Button
  const btn = document.createElement('button');
  btn.className = 'action-btn open';
  btn.textContent = 'Open';

  if (app.url && app.url !== '#') {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      window.location.href = app.url;
    });
  }

  row.appendChild(iconWrap);
  row.appendChild(info);
  row.appendChild(btn);

  return row;
}

function renderEmpty() {
  const container = document.getElementById('app-list');
  const pullIndicator = document.getElementById('pull-indicator');
  container.innerHTML = '';
  container.appendChild(pullIndicator);

  const empty = document.createElement('div');
  empty.className = 'empty-state';
  empty.innerHTML = `
    <div class="empty-state-icon">📱</div>
    <div>No apps yet</div>
    <div style="font-size: 13px; color: var(--text-tertiary)">Add apps to apps.json to get started</div>
  `;
  container.appendChild(empty);
}

// ── Pull to Refresh ──
function setupPullToRefresh() {
  const list = document.getElementById('app-list');
  const indicator = document.getElementById('pull-indicator');

  list.addEventListener('touchstart', (e) => {
    if (list.scrollTop <= 0) {
      pullStartY = e.touches[0].clientY;
      isPulling = true;
    }
  }, { passive: true });

  list.addEventListener('touchmove', (e) => {
    if (!isPulling) return;
    const dy = e.touches[0].clientY - pullStartY;
    if (dy > 60 && list.scrollTop <= 0) {
      indicator.classList.add('visible');
    }
  }, { passive: true });

  list.addEventListener('touchend', async () => {
    if (!isPulling) return;
    isPulling = false;
    if (indicator.classList.contains('visible')) {
      await loadAndRender();
      setTimeout(() => indicator.classList.remove('visible'), 500);
    }
  });
}

// ── Service Worker ──
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch((err) => {
      console.warn('SW registration failed:', err);
    });
  }
}
