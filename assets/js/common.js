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

    setupNotificationMenu();


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
// Notification Menu
// ==========================================================

function setupNotificationMenu() {
  const notificationButton = document.getElementById("notification-button");
  const notificationDropdown = document.getElementById("notification-dropdown");
  const notificationList = document.getElementById("notification-list");

  if (!notificationButton || !notificationDropdown || !notificationList) {
    return;
  }

  let request = 0;

  function closeNotificationMenu() {
    notificationDropdown.classList.remove("open");
    notificationButton.setAttribute("aria-expanded", "false");
    request += 1;
  }

  notificationButton.addEventListener("click", async (event) => {
    event.stopPropagation();

    const isOpen = notificationDropdown.classList.toggle("open");
    notificationButton.setAttribute("aria-expanded", String(isOpen));

    const currentRequest = ++request;
    if (!isOpen) return;

    document.getElementById("profile-dropdown")?.classList.remove("open");
    document.getElementById("profile-button")?.setAttribute("aria-expanded", "false");
    notificationList.replaceChildren(notificationText("notification-loading", "Loading notifications…"));

    try {
      const jobsURL = new URL("../../data/jobs.json?v=4", import.meta.url);
      const [response, dataService] = await Promise.all([
        fetch(jobsURL, { cache: "no-store" }),
        import("./data-service.js?v=2")
      ]);

      if (!response.ok) {
        throw new Error(`Unable to load jobs (${response.status})`);
      }

      const jobs = await response.json();
      if (currentRequest === request) {
        renderNotifications(notificationList, jobs, dataService.getSavedJobIds);
      }
    } catch (error) {
      if (currentRequest === request) {
        notificationList.replaceChildren(
          notificationText("notification-error", "Unable to load notifications.")
        );
        console.error("Notifications could not be loaded:", error);
      }
    }
  });

  document.addEventListener("click", closeNotificationMenu);
  document.getElementById("profile-button")?.addEventListener("click", closeNotificationMenu);
  notificationDropdown.addEventListener("click", (event) => event.stopPropagation());
}

function notificationDate(value) {
  const day = String(value ?? "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;

  const date = new Date(`${day}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatNotificationDate(date) {
  return date?.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }) ?? "Date unavailable";
}

function notificationText(className, text, tagName = "p") {
  const element = document.createElement(tagName);
  element.className = className;
  element.textContent = text;
  return element;
}

function notificationItem({ type, href, icon, title, message, date }) {
  const item = document.createElement("a");
  item.className = `notification-item notification-item-${type}`;
  item.href = href;

  const iconWrapper = document.createElement("span");
  iconWrapper.className = "notification-item-icon";
  iconWrapper.setAttribute("aria-hidden", "true");
  iconWrapper.append(notificationText("material-symbols-outlined", icon, "span"));

  const content = document.createElement("span");
  content.className = "notification-item-content";
  content.append(
    notificationText("notification-item-title", title, "span"),
    notificationText("notification-item-message", message, "span"),
    notificationText("notification-item-date", date, "span")
  );

  item.append(iconWrapper, content);
  return item;
}

function renderNotifications(list, jobs, getSavedJobIds) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const user = getCurrentUser();
  const savedJobs = getSavedJobIds?.() ?? user?.savedJobIds ?? user?.savedJobs;
  const savedIds = new Set(
    (Array.isArray(savedJobs) ? savedJobs : []).map((job) => String(job?.jobId ?? job?.id ?? job))
  );
  const jobsById = new Map(jobs.map((job) => [String(job.id), job]));
  const deadlines = jobs
    .filter((job) => savedIds.has(String(job.id)))
    .map((job) => {
      const date = notificationDate(job.deadline);
      const days = date ? Math.round((date - today) / 86400000) : null;
      return { job, date, days };
    })
    .filter(({ days }) => days !== null && days >= 0 && days <= 7)
    .sort((a, b) => a.days - b.days);

  const applications = user?.applications;
  const submissions = (Array.isArray(applications) ? applications : [])
    .filter((application) => String(application.status ?? "").trim().toLowerCase() !== "withdrawn")
    .map((application) => ({
      job: jobsById.get(String(application.jobId)),
      date: notificationDate(application.dateApplied || application.appliedAt || application.createdAt)
    }))
    .sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0));

  list.replaceChildren();
  if (!deadlines.length && !submissions.length) {
    list.append(notificationText("notification-empty", "You have no upcoming deadlines or submitted applications."));
    return;
  }

  if (deadlines.length) {
    list.append(notificationText("notification-section-title", "Upcoming Deadlines"));
    for (const { job, date, days } of deadlines) {
      const message = ["Due today", "Due tomorrow"][days] ?? `${days} days left`;
      list.append(notificationItem({
        type: "deadline",
        href: "calendar.html",
        icon: "schedule",
        title: job.title || "Saved job",
        message,
        date: `Deadline: ${formatNotificationDate(date)}`
      }));
    }
  }

  if (submissions.length) {
    list.append(notificationText("notification-section-title", "Submitted Applications"));
    for (const { job, date } of submissions) {
      list.append(notificationItem({
        type: "application",
        href: "applications.html",
        icon: "description",
        title: job?.title || "Application submitted",
        message: job?.company ? `Application submitted at ${job.company}` : "Application submitted",
        date: `Submitted: ${formatNotificationDate(date)}`
      }));
    }
  }
}


// ==========================================================
// Start
// ==========================================================

loadSidebar();

loadTopbar();
