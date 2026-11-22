// ==========================================================
// UC Careers - Shared Page Behaviour
// ==========================================================

import {
  getCurrentUser,
  logoutUser
} from "./data-service.js?v=2";


// ==========================================================
// Load Sidebar
// ==========================================================

async function loadSidebar() {

  const sidebarContainer =
    document.getElementById(
      "sidebar-container"
    );


  if (!sidebarContainer) {
    return;
  }


  try {

    const sidebarURL =
      new URL(
        "../../components/sidebar.html",
        import.meta.url
      );


    const response =
      await fetch(sidebarURL);


    if (!response.ok) {

      throw new Error(
        `Unable to load sidebar (${response.status})`
      );

    }


    sidebarContainer.innerHTML =
      await response.text();


    highlightCurrentPage();


  } catch (error) {

    console.error(
      "Sidebar could not be loaded:",
      error
    );

  }

}


// ==========================================================
// Current Navigation Page
// ==========================================================

function highlightCurrentPage() {

  const currentPage =
    window.location.pathname
      .split("/")
      .pop();


  const navigationLinks =
    document.querySelectorAll(
      ".nav-link"
    );


  navigationLinks.forEach(
    (link) => {

      link.classList.remove(
        "active"
      );


      const linkPage =
        link.getAttribute(
          "href"
        );


      if (
        linkPage ===
        currentPage
      ) {

        link.classList.add(
          "active"
        );

      }

    }
  );

}


// ==========================================================
// Load Top Bar
// ==========================================================

async function loadTopbar() {

  const topbarContainer =
    document.getElementById(
      "topbar-container"
    );


  if (!topbarContainer) {
    return;
  }


  try {

    const topbarURL =
      new URL(
        "../../components/topbar.html",
        import.meta.url
      );


    const response =
      await fetch(topbarURL);


    if (!response.ok) {

      throw new Error(
        `Unable to load top bar (${response.status})`
      );

    }


    topbarContainer.innerHTML =
      await response.text();


    setProfileInitials();

    setupProfileMenu();

    setupLogout();


  } catch (error) {

    console.error(
      "Top bar could not be loaded:",
      error
    );

  }

}


// ==========================================================
// Profile Initials
// ==========================================================

function setProfileInitials() {

  const initialsElement =
    document.getElementById(
      "profile-initials"
    );


  if (!initialsElement) {
    return;
  }


  const user =
    getCurrentUser();


  if (!user) {
    return;
  }


  const firstInitial =
    user.firstName
      ?.charAt(0) || "";


  const lastInitial =
    user.lastName
      ?.charAt(0) || "";


  const initials =
    `${firstInitial}${lastInitial}`
      .toUpperCase();


  if (initials) {

    initialsElement.textContent =
      initials;

  }

}


// ==========================================================
// Profile Menu
// ==========================================================

function setupProfileMenu() {

  const profileButton =
    document.getElementById(
      "profile-button"
    );


  const profileDropdown =
    document.getElementById(
      "profile-dropdown"
    );


  if (
    !profileButton ||
    !profileDropdown
  ) {
    return;
  }


  profileButton.addEventListener(
    "click",
    (event) => {

      event.stopPropagation();


      const isOpen =
        profileDropdown.classList
          .toggle("open");


      profileButton.setAttribute(
        "aria-expanded",
        String(isOpen)
      );

    }
  );


  document.addEventListener(
    "click",
    () => {

      profileDropdown.classList
        .remove("open");


      profileButton.setAttribute(
        "aria-expanded",
        "false"
      );

    }
  );


  profileDropdown.addEventListener(
    "click",
    (event) => {

      event.stopPropagation();

    }
  );

}


// ==========================================================
// Logout
// ==========================================================

function setupLogout() {

  const logoutButton =
    document.getElementById(
      "logout-button"
    );


  if (!logoutButton) {
    return;
  }


  logoutButton.addEventListener(
    "click",
    () => {

      /*
        Clears who is logged in,
        but keeps their saved profile.
      */

      logoutUser();


      window.location.href =
        "../index.html";

    }
  );

}


// ==========================================================
// Start
// ==========================================================

loadSidebar();

loadTopbar();