import { renderSidebar, formatDeadline, bookmarkIcon, showToast } from './common.js';
import { getUser, getJobs } from './data-service.js';
import { getSavedJobIds, toggleSavedJob } from './storage.js';

renderSidebar('home.html');

const user = await getUser();
const jobs = await getJobs();
let savedIds = getSavedJobIds(user.savedJobIds || []);

document.querySelector('[data-welcome]').textContent = `Welcome back to the Student Career Search Portal, ${user.firstName}!`;

const statValues = {
  deadlines: user.stats.upcomingDeadlines,
  inProgress: user.stats.inProgressApplications,
  applied: user.stats.recentlyApplied,
  views: user.stats.profileViews
};
Object.entries(statValues).forEach(([key,value]) => {
  const el = document.querySelector(`[data-stat="${key}"]`);
  if (el) el.textContent = value;
});

function renderSuggested() {
  const container = document.querySelector('[data-suggested-jobs]');
  const suggested = jobs.filter(job => job.recommended).slice(0,3);
  container.innerHTML = suggested.map(job => {
    const saved = savedIds.includes(job.id);
    return `
      <article class="job-card home-job-card">
        <div class="job-card-topline">
          <div>
            <h3>${job.title}</h3>
            <p class="company">${job.company}</p>
          </div>
          <button class="bookmark-button ${saved ? 'saved' : ''}" data-bookmark="${job.id}" aria-label="${saved ? 'Unsave' : 'Save'} ${job.title}">${bookmarkIcon(saved)}</button>
        </div>
        <div class="job-meta">
          <span>${job.location}</span>
          <span>${job.type}</span>
          <span>${job.durationMonths ? `${job.durationMonths} months` : 'Ongoing'}</span>
        </div>
        <div class="job-card-footer">
          <span>Deadline: ${formatDeadline(job.deadline)}</span>
          <a class="text-link" href="job-details.html?id=${job.id}">View</a>
        </div>
      </article>`;
  }).join('');

  container.querySelectorAll('[data-bookmark]').forEach(button => {
    button.addEventListener('click', () => {
      savedIds = toggleSavedJob(button.dataset.bookmark, user.savedJobIds || []);
      showToast(savedIds.includes(button.dataset.bookmark) ? 'Job saved.' : 'Job removed from Saved Jobs.');
      renderSuggested();
    });
  });
}

renderSuggested();
