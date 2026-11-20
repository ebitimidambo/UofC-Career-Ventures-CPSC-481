import { logout, requireAuth } from './auth.js';

const icons = {
  home: '<svg viewBox="0 0 24 24"><path d="M3 11.5 12 4l9 7.5v8a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
  search: '<svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg>',
  doc: '<svg viewBox="0 0 24 24"><path d="M6 3h9l4 4v14H6z"/><path d="M15 3v5h5M9 12h6M9 16h6"/></svg>',
  bookmark: '<svg viewBox="0 0 24 24"><path d="M6 3h12v18l-6-4-6 4z"/></svg>',
  compare: '<svg viewBox="0 0 24 24"><path d="M8 5h12M8 12h12M8 19h12M4 5h.01M4 12h.01M4 19h.01"/></svg>',
  calendar: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>',
  profile: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
  logout: '<svg viewBox="0 0 24 24"><path d="M10 5H5v14h5M14 8l4 4-4 4M18 12H9"/></svg>'
};

const navItems = [
  ['home.html', 'Home', 'home'],
  ['job-search.html', 'Job Search', 'search'],
  ['applications.html', 'Applications', 'doc'],
  ['saved-jobs.html', 'Saved Jobs', 'bookmark'],
  ['comparison.html', 'Comparison Tool', 'compare'],
  ['calendar.html', 'Calendar', 'calendar'],
  ['profile.html', 'My Career Profile', 'profile']
];

export function renderSidebar(activePage) {
  if (!requireAuth()) return;
  const host = document.querySelector('[data-sidebar]');
  if (!host) return;
  host.innerHTML = `
    <aside class="sidebar">
      <div class="brand"><img src="../assets/images/ucalgary-sidebar-logo.png" alt="University of Calgary"></div>
      <nav class="sidebar-nav" aria-label="Primary navigation">
        ${navItems.map(([href,label,icon]) => `
          <a class="nav-item ${activePage === href ? 'active' : ''}" href="${href}">
            <span class="nav-icon">${icons[icon]}</span><span>${label}</span>
          </a>`).join('')}
      </nav>
      <button class="nav-item logout-button" type="button" data-logout>
        <span class="nav-icon">${icons.logout}</span><span>Log Out</span>
      </button>
    </aside>`;
  host.querySelector('[data-logout]').addEventListener('click', logout);
}

export function formatDeadline(iso) {
  const date = new Date(`${iso}T12:00:00`);
  return new Intl.DateTimeFormat('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

export function bookmarkIcon(saved) {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.75A1.75 1.75 0 0 1 7.75 2h8.5A1.75 1.75 0 0 1 18 3.75V22l-6-4.1L6 22V3.75Z" ${saved ? 'fill="currentColor"' : 'fill="none"'} stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
}

export function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 1600);
}
