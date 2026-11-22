// ==========================================================
// UC Careers - Applications
// ==========================================================

import {
  getCurrentUser
} from "./data-service.js?v=2";


// ==========================================================
// Page Elements
// ==========================================================

const applicationsList =
  document.getElementById(
    "applications-list"
  );


const applicationSort =
  document.getElementById(
    "application-sort"
  );


// ==========================================================
// Page State
// ==========================================================

let currentUser =
  getCurrentUser();


let allJobs = [];

let applications = [];


// ==========================================================
// Load Jobs
// ==========================================================

async function loadJobs() {

  try {

    const response =
      await fetch(
        "../data/jobs.json?v=3"
      );


    if (!response.ok) {

      throw new Error(
        `Could not load jobs (${response.status})`
      );

    }


    const jobs =
      await response.json();


    return Array.isArray(jobs)
      ? jobs
      : [];


  } catch (error) {

    console.error(
      "Unable to load jobs:",
      error
    );


    return [];

  }

}


// ==========================================================
// Get User Applications
// ==========================================================

function getUserApplications() {

  /*
    Existing users may not have an
    applications field yet.

    In that case, simply return an
    empty array.
  */

  if (
    !Array.isArray(
      currentUser?.applications
    )
  ) {

    return [];

  }


  return [
    ...currentUser.applications
  ];

}


// ==========================================================
// Find Job
// ==========================================================

function findJobForApplication(
  application
) {

  if (!application.jobId) {
    return null;
  }


  return (
    allJobs.find(
      (job) =>
        job.id ===
        application.jobId
    ) || null
  );

}


// ==========================================================
// Get Application Date
// ==========================================================

function getApplicationDate(
  application
) {

  /*
    dateApplied is our preferred field.

    The fallbacks make the page tolerant
    of slightly different application
    records in the future.
  */

  return (
    application.dateApplied ||
    application.appliedAt ||
    application.createdAt ||
    ""
  );

}


// ==========================================================
// Format Date
// ==========================================================

function formatDate(dateValue) {

  if (!dateValue) {

    return "Not available";

  }


  /*
    Add a midday time so YYYY-MM-DD dates
    do not shift backward because of
    timezone conversion.
  */

  const date =
    new Date(
      `${dateValue.slice(0, 10)}T12:00:00`
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return dateValue;

  }


  return date.toLocaleDateString(
    "en-CA",
    {
      year: "numeric",
      month: "long",
      day: "numeric"
    }
  );

}


// ==========================================================
// Sort Applications
// ==========================================================

function getSortedApplications() {

  const sortedApplications =
    [...applications];


  sortedApplications.sort(
    (a, b) => {

      const dateA =
        new Date(
          getApplicationDate(a)
        ).getTime() || 0;


      const dateB =
        new Date(
          getApplicationDate(b)
        ).getTime() || 0;


      if (
        applicationSort.value ===
        "oldest"
      ) {

        return dateA - dateB;

      }


      return dateB - dateA;

    }
  );


  return sortedApplications;

}


// ==========================================================
// Display Applications
// ==========================================================

function displayApplications() {

  applicationsList.innerHTML = "";


  /*
    No applications yet.
  */

  if (
    applications.length === 0
  ) {

    displayEmptyState();

    return;

  }


  const sortedApplications =
    getSortedApplications();


  sortedApplications.forEach(
    (application) => {

      createApplicationCard(
        application
      );

    }
  );


  applicationsList.scrollTop = 0;

}


// ==========================================================
// Empty State
// ==========================================================

function displayEmptyState() {

  const emptyState =
    document.createElement("div");


  emptyState.classList.add(
    "applications-empty"
  );


  emptyState.innerHTML = `

    <div class="empty-icon">

      <img
        src="../assets/svg/applicationsIcon.svg"
        alt=""
      >

    </div>


    <h2>
      No applications yet
    </h2>


    <p>
      Jobs you apply to will appear here.
    </p>

  `;


  applicationsList.appendChild(
    emptyState
  );

}


// ==========================================================
// Create Application Card
// ==========================================================

function createApplicationCard(
  application
) {

  const job =
    findJobForApplication(
      application
    );


  /*
    Normally these values come from
    jobs.json using the application's
    jobId.

    Application-level values are also
    accepted as fallbacks so the page
    stays robust.
  */

  const jobTitle =
    job?.title ||
    application.jobTitle ||
    application.title ||
    "Job Application";


  const companyName =
    job?.company ||
    application.company ||
    "Company";


  const logoSource =
    job?.logo ||
    application.logo ||
    "";


  const status =
    application.status ||
    "Applied";


  const dateApplied =
    formatDate(
      getApplicationDate(
        application
      )
    );


  // --------------------------------------------------------
  // Card
  // --------------------------------------------------------

  const card =
    document.createElement(
      "article"
    );


  card.classList.add(
    "application-card"
  );


  // --------------------------------------------------------
  // Logo
  // --------------------------------------------------------

  const logo =
    document.createElement("div");


  logo.classList.add(
    "application-logo"
  );


  if (logoSource) {

    const image =
      document.createElement("img");


    image.src =
      logoSource;


    image.alt =
      `${companyName} logo`;


    logo.appendChild(
      image
    );

  }


  // --------------------------------------------------------
  // Job Information
  // --------------------------------------------------------

  const details =
    document.createElement("div");


  details.classList.add(
    "application-details"
  );


  const title =
    document.createElement("h2");


  title.textContent =
    jobTitle;


  const company =
    document.createElement("p");


  company.classList.add(
    "application-company"
  );


  company.textContent =
    companyName;


  details.append(
    title,
    company
  );


  // --------------------------------------------------------
  // Application Information
  // --------------------------------------------------------

  const meta =
    document.createElement("div");


  meta.classList.add(
    "application-meta"
  );


  const statusText =
    document.createElement("p");


  statusText.innerHTML =
    "<strong>Status:</strong> ";


  statusText.append(
    document.createTextNode(
      status
    )
  );


  const dateText =
    document.createElement("p");


  dateText.innerHTML =
    "<strong>Date Applied:</strong> ";


  dateText.append(
    document.createTextNode(
      dateApplied
    )
  );


  meta.append(
    statusText,
    dateText
  );


  // --------------------------------------------------------
  // Complete Card
  // --------------------------------------------------------

  card.append(
    logo,
    details,
    meta
  );


  applicationsList.appendChild(
    card
  );

}


// ==========================================================
// Sort Change
// ==========================================================

applicationSort.addEventListener(
  "change",
  () => {

    displayApplications();

  }
);


// ==========================================================
// Initialize Applications
// ==========================================================

async function initializeApplications() {

  currentUser =
    getCurrentUser();


  allJobs =
    await loadJobs();


  applications =
    getUserApplications();


  displayApplications();

}


// ==========================================================
// Start
// ==========================================================

initializeApplications();