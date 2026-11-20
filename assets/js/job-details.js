import { renderSidebar, formatDeadline } from './common.js';
import { getJobById } from './data-service.js';

renderSidebar('job-search.html');
const id = new URLSearchParams(window.location.search).get('id');
const job = await getJobById(id);
const host = document.querySelector('[data-job-detail-shell]');

if (!job) {
  host.innerHTML = '<div class="empty-state"><h2>Job not found</h2><a class="primary-button" href="job-search.html">Back to Job Search</a></div>';
} else {
  host.innerHTML = `
    <div class="integration-shell-note">Integration shell for the teammate-owned Job Details page.</div>
    <div class="detail-shell-card">
      <a class="text-link" href="job-search.html">← Back to Job Search</a>
      <h1>${job.title}</h1>
      <h2>${job.company}</h2>
      <p>${job.description}</p>
      <div class="job-meta"><span>${job.location}</span><span>${job.type}</span><span>Deadline: ${formatDeadline(job.deadline)}</span></div>
    </div>`;
}
