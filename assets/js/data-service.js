import { getStoredUser, setStoredUser, getSavedJobIds, setSavedJobIds } from './storage.js';

const userUrl = new URL('../../data/user.json', import.meta.url);
const jobsUrl = new URL('../../data/jobs.json', import.meta.url);

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Unable to load ${url.pathname}`);
  return response.json();
}

export async function getUser() {
  const stored = getStoredUser();
  if (stored) return stored;

  const user = await fetchJson(userUrl);
  setStoredUser(user);
  if (!localStorage.getItem('uc-careers-saved-jobs')) {
    setSavedJobIds(user.savedJobIds || []);
  }
  return user;
}

export async function getJobs() {
  return fetchJson(jobsUrl);
}

export async function getJobById(id) {
  const jobs = await getJobs();
  return jobs.find(job => job.id === id) || null;
}

export async function getSavedJobs() {
  const [user, jobs] = await Promise.all([getUser(), getJobs()]);
  const ids = getSavedJobIds(user.savedJobIds || []);
  return jobs.filter(job => ids.includes(job.id));
}
