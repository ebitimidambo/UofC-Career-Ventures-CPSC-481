import { STORAGE_KEYS } from './config.js';

export function getStoredUser() {
  const raw = localStorage.getItem(STORAGE_KEYS.USER);
  return raw ? JSON.parse(raw) : null;
}

export function setStoredUser(user) {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

export function getSavedJobIds(fallback = []) {
  const raw = localStorage.getItem(STORAGE_KEYS.SAVED_JOBS);
  return raw ? JSON.parse(raw) : [...fallback];
}

export function setSavedJobIds(ids) {
  localStorage.setItem(STORAGE_KEYS.SAVED_JOBS, JSON.stringify([...new Set(ids)]));
}

export function toggleSavedJob(id, fallback = []) {
  const saved = getSavedJobIds(fallback);
  const next = saved.includes(id) ? saved.filter(jobId => jobId !== id) : [...saved, id];
  setSavedJobIds(next);
  return next;
}
