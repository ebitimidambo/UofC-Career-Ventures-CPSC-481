// ==========================================================
// UC Careers - Login page behaviour
// ==========================================================

// Path is relative to index.html (the page that loads this module).
const USER_DATA_URL = "data/user.json";

// Set this to the Home page path once it exists, e.g. "pages/home.html".
// While it is null, a success message is shown instead of redirecting.
const HOME_PAGE = null;

const form = document.getElementById("login-form");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const toggleButton = document.getElementById("toggle-password");
const messageEl = document.getElementById("login-message");

// ---------- Password visibility ----------
function setPasswordVisible(visible) {
  passwordInput.type = visible ? "text" : "password";
  toggleButton.classList.toggle("is-visible", visible);
  toggleButton.setAttribute("aria-pressed", String(visible));
  toggleButton.setAttribute("aria-label", visible ? "Hide password" : "Show password");
}

toggleButton.addEventListener("click", () => {
  setPasswordVisible(passwordInput.type === "password");
  passwordInput.focus();
});

// ---------- Messages ----------
function showMessage(text, type) {
  messageEl.textContent = text;
  messageEl.classList.remove("is-error", "is-success");
  if (type) messageEl.classList.add(`is-${type}`);
}

function clearMessage() {
  showMessage("", null);
  usernameInput.classList.remove("is-invalid");
  passwordInput.classList.remove("is-invalid");
}

function showInvalidLogin(text) {
  showMessage(text, "error");
  usernameInput.classList.add("is-invalid");
  passwordInput.classList.add("is-invalid");

  // Restart the shake animation
  form.classList.remove("is-shaking");
  void form.offsetWidth;
  form.classList.add("is-shaking");
}

form.addEventListener("animationend", () => form.classList.remove("is-shaking"));

usernameInput.addEventListener("input", clearMessage);
passwordInput.addEventListener("input", clearMessage);

// ---------- Mock user data ----------
async function loadUsers() {
  const response = await fetch(USER_DATA_URL);
  if (!response.ok) {
    throw new Error(`Could not load ${USER_DATA_URL} (${response.status})`);
  }
  const data = await response.json();
  return data.users || [];
}

// ---------- Submit (Enter key also submits because this is a <form>) ----------
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessage();

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!username || !password) {
    showInvalidLogin("Please enter your username and password.");
    return;
  }

  let users;
  try {
    users = await loadUsers();
  } catch (error) {
    console.error(error);
    showMessage("Unable to load user data. Run the site from a local server.", "error");
    return;
  }

  const match = users.find(
    (user) => user.username.toLowerCase() === username.toLowerCase() && user.password === password
  );

  if (!match) {
    showInvalidLogin("Invalid username or password.");
    return;
  }

  // Remember who logged in for later pages (cleared when the tab closes).
  sessionStorage.setItem(
    "currentUser",
    JSON.stringify({
      username: match.username,
      name: match.name,
      email: match.email,
      program: match.program
    })
  );

  if (HOME_PAGE) {
    window.location.href = HOME_PAGE;
  } else {
    showMessage(`Welcome, ${match.name}! (Home page coming soon)`, "success");
  }
});