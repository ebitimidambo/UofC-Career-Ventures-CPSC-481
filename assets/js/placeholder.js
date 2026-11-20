import { renderSidebar } from './common.js';

const active = document.body.dataset.activePage || '';
renderSidebar(active);
const title = document.body.dataset.sectionTitle || 'Page';
document.querySelector('[data-placeholder-title]').textContent = title;
