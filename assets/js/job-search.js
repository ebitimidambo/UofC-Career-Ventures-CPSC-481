import { renderSidebar, formatDeadline, bookmarkIcon, showToast } from './common.js';
import { getUser, getJobs } from './data-service.js';
import { getSavedJobIds, toggleSavedJob } from './storage.js';

renderSidebar('job-search.html');

const user = await getUser();
const jobs = await getJobs();
let savedIds = getSavedJobIds(user.savedJobIds || []);
let appliedFilters = { search: '', type: [], experience: [], duration: [], location: [], eligible: false };

const form = document.querySelector('#filter-form');
const searchInput = document.querySelector('#job-search-input');
const results = document.querySelector('[data-job-results]');
const count = document.querySelector('[data-result-count]');

function getFormFilters() {
  const data = new FormData(form);
  return {
    search: searchInput.value.trim().toLowerCase(),
    type: data.getAll('type'),
    experience: data.getAll('experience').map(Number),
    duration: data.getAll('duration').map(Number),
    location: data.getAll('location'),
    eligible: data.get('eligible') === 'yes'
  };
}

function matches(job) {
  const f = appliedFilters;
  const haystack = `${job.title} ${job.company} ${job.location} ${job.skills.join(' ')}`.toLowerCase();
  if (f.search && !haystack.includes(f.search)) return false;
  if (f.type.length && !f.type.includes(job.type)) return false;
  if (f.experience.length && !f.experience.includes(job.experienceYears)) return false;
  if (f.duration.length && !f.duration.includes(job.durationMonths)) return false;
  if (f.location.length) {
    const simpleLocation = job.location.startsWith('Calgary') ? 'Calgary' : job.location.startsWith('Toronto') ? 'Toronto' : job.location.startsWith('Vancouver') ? 'Vancouver' : job.location;
    if (!f.location.includes(simpleLocation)) return false;
  }
  if (f.eligible && !job.eligible) return false;
  return true;
}

function render() {
  const filtered = jobs.filter(matches);
  count.textContent = `${filtered.length} ${filtered.length === 1 ? 'job' : 'jobs'} found`;
  if (!filtered.length) {
    results.innerHTML = '<div class="empty-state"><h3>No jobs found</h3><p>Try changing your search or resetting some filters.</p></div>';
    return;
  }

  results.innerHTML = filtered.map(job => {
    const saved = savedIds.includes(job.id);
    return `
      <article class="job-card search-job-card">
        <div class="job-card-topline">
          <div>
            <h3>${job.title}</h3>
            <p class="company">${job.company}</p>
          </div>
          <button class="bookmark-button ${saved ? 'saved' : ''}" data-bookmark="${job.id}" aria-label="${saved ? 'Unsave' : 'Save'} ${job.title}">${bookmarkIcon(saved)}</button>
        </div>
        <div class="job-meta search-meta">
          <span>${job.location}</span>
          <span>${job.type}</span>
          <span>${job.durationMonths ? `${job.durationMonths} months` : 'Ongoing'}</span>
          <span>${job.experienceYears === 0 ? 'No experience required' : `${job.experienceYears}+ years experience`}</span>
        </div>
        <div class="job-card-footer">
          <span>Deadline: ${formatDeadline(job.deadline)}</span>
          <a class="view-button" href="job-details.html?id=${job.id}">View</a>
        </div>
      </article>`;
  }).join('');

  results.querySelectorAll('[data-bookmark]').forEach(button => {
    button.addEventListener('click', () => {
      savedIds = toggleSavedJob(button.dataset.bookmark, user.savedJobIds || []);
      showToast(savedIds.includes(button.dataset.bookmark) ? 'Job saved.' : 'Job removed from Saved Jobs.');
      render();
    });
  });
}

form.addEventListener('submit', event => {
  event.preventDefault();
  appliedFilters = getFormFilters();
  render();
});

document.querySelector('[data-search-button]').addEventListener('click', () => {
  appliedFilters = getFormFilters();
  render();
});

searchInput.addEventListener('keydown', event => {
  if (event.key === 'Enter') {
    event.preventDefault();
    appliedFilters = getFormFilters();
    render();
  }
});

document.querySelector('[data-reset]').addEventListener('click', () => {
  form.reset();
  searchInput.value = '';
  appliedFilters = { search: '', type: [], experience: [], duration: [], location: [], eligible: false };
  render();
});

render();
