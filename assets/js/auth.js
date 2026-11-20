import { STORAGE_KEYS } from './config.js';
import { getUser } from './data-service.js';

export async function login(username, password) {
  const user = await getUser();
  const valid = username.trim().toLowerCase() === user.username.toLowerCase() && password === user.password;
  if (valid) localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
  return valid;
}

export function logout() {
  localStorage.removeItem(STORAGE_KEYS.AUTH);
  window.location.href = '../index.html';
}

export function isAuthenticated() {
  return localStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
}

export function requireAuth() {
  if (!isAuthenticated()) {
    window.location.replace('../index.html');
    return false;
  }
  return true;
}
