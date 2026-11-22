// ==========================================================
// UC Careers - Login Page
// ==========================================================

import {
  setCurrentUser
} from "./data-service.js?v=2";


const USER_DATA_URL =
  "data/user.json";


const form =
  document.getElementById(
    "login-form"
  );

const usernameInput =
  document.getElementById(
    "username"
  );

const passwordInput =
  document.getElementById(
    "password"
  );

const toggleButton =
  document.getElementById(
    "toggle-password"
  );

const messageEl =
  document.getElementById(
    "login-message"
  );


// ==========================================================
// Password Visibility
// ==========================================================

function setPasswordVisible(visible) {

  passwordInput.type =
    visible
      ? "text"
      : "password";


  toggleButton.classList.toggle(
    "is-visible",
    visible
  );


  toggleButton.setAttribute(
    "aria-pressed",
    String(visible)
  );


  toggleButton.setAttribute(
    "aria-label",
    visible
      ? "Hide password"
      : "Show password"
  );

}


toggleButton.addEventListener(
  "click",
  () => {

    setPasswordVisible(
      passwordInput.type ===
        "password"
    );


    passwordInput.focus();

  }
);


// ==========================================================
// Messages
// ==========================================================

function showMessage(text, type) {

  messageEl.textContent =
    text;


  messageEl.classList.remove(
    "is-error",
    "is-success"
  );


  if (type) {

    messageEl.classList.add(
      `is-${type}`
    );

  }

}


function clearMessage() {

  showMessage(
    "",
    null
  );


  usernameInput.classList.remove(
    "is-invalid"
  );


  passwordInput.classList.remove(
    "is-invalid"
  );

}


function showInvalidLogin(text) {

  showMessage(
    text,
    "error"
  );


  usernameInput.classList.add(
    "is-invalid"
  );


  passwordInput.classList.add(
    "is-invalid"
  );


  form.classList.remove(
    "is-shaking"
  );


  void form.offsetWidth;


  form.classList.add(
    "is-shaking"
  );

}


form.addEventListener(
  "animationend",
  () =>
    form.classList.remove(
      "is-shaking"
    )
);


usernameInput.addEventListener(
  "input",
  clearMessage
);


passwordInput.addEventListener(
  "input",
  clearMessage
);


// ==========================================================
// Load Users
// ==========================================================

async function loadUsers() {

  const response =
    await fetch(
      USER_DATA_URL
    );


  if (!response.ok) {

    throw new Error(
      `Could not load ${USER_DATA_URL} (${response.status})`
    );

  }


  const data =
    await response.json();


  return (
    data.users || []
  );

}


// ==========================================================
// Login
// ==========================================================

form.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();


    clearMessage();


    const username =
      usernameInput.value.trim();


    const password =
      passwordInput.value;


    if (
      !username ||
      !password
    ) {

      showInvalidLogin(
        "Please enter your username and password."
      );


      return;

    }


    let users;


    try {

      users =
        await loadUsers();

    } catch (error) {

      console.error(error);


      showMessage(
        "Unable to load user data.",
        "error"
      );


      return;

    }


    const match =
      users.find(
        (user) =>
          user.username.toLowerCase() ===
            username.toLowerCase() &&
          user.password === password
      );


    if (!match) {

      showInvalidLogin(
        "Invalid username or password."
      );


      return;

    }


    /*
      Saves the FULL user profile the first
      time they log in.

      Existing localStorage data is preserved
      on later logins.
    */

    setCurrentUser(
      match
    );


    window.location.href =
      "pages/home.html";

  }
);