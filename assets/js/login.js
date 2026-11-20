import { login, isAuthenticated } from './auth.js';

if (isAuthenticated()) window.location.replace('./pages/home.html');

const form = document.querySelector('#login-form');
const password = document.querySelector('#password');
const toggle = document.querySelector('#toggle-password');
const error = document.querySelector('#login-error');

toggle.addEventListener('click', () => {
  const visible = password.type === 'text';
  password.type = visible ? 'password' : 'text';
  toggle.setAttribute('aria-label', visible ? 'Show password' : 'Hide password');
  toggle.classList.toggle('active', !visible);
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  error.hidden = true;
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  button.textContent = 'Logging in...';
  try {
    const ok = await login(form.username.value, form.password.value);
    if (ok) {
      window.location.href = './pages/home.html';
      return;
    }
    error.textContent = 'Incorrect username or password. Please check your myUCalgary login information and try again.';
    error.hidden = false;
  } catch (err) {
    error.textContent = 'The prototype data could not be loaded. Please run the site through GitHub Pages or a local web server.';
    error.hidden = false;
    console.error(err);
  } finally {
    button.disabled = false;
    button.textContent = 'Login';
  }
});
