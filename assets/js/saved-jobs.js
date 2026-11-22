// ==========================================================
// UC Careers - Saved Jobs
// ==========================================================

import {
  getSavedJobIds,
  removeSavedJob
} from "./data-service.js?v=2";


// ==========================================================
// Page Elements
// ==========================================================

const savedJobsList =
  document.getElementById(
    "saved-jobs-list"
  );


const savedJobsSort =
  document.getElementById(
    "saved-jobs-sort"
  );


// ==========================================================
// Remove Modal Elements
// ==========================================================

const removeSavedModal =
  document.getElementById(
    "remove-saved-modal"
  );


const cancelRemoveButton =
  document.getElementById(
    "cancel-remove-job"
  );


const confirmRemoveButton =
  document.getElementById(
    "confirm-remove-job"
  );


// ==========================================================
// Page State
// ==========================================================

let allJobs = [];

let savedJobIds = [];

let jobPendingRemoval = null;


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
// Get Saved Jobs
// ==========================================================

function getSavedJobs() {

  return allJobs.filter(
    (job) =>
      savedJobIds.includes(
        job.id
      )
  );

}


// ==========================================================
// Sort Saved Jobs
// ==========================================================

function getSortedSavedJobs() {

  const jobs =
    getSavedJobs();


  jobs.sort(
    (a, b) => {

      const deadlineA =
        new Date(
          a.deadline
        ).getTime();


      const deadlineB =
        new Date(
          b.deadline
        ).getTime();


      if (
        savedJobsSort.value ===
        "furthest"
      ) {

        return (
          deadlineB -
          deadlineA
        );

      }


      return (
        deadlineA -
        deadlineB
      );

    }
  );


  return jobs;

}


// ==========================================================
// Format Date
// ==========================================================

function formatDate(dateValue) {

  if (!dateValue) {

    return "Not available";

  }


  const cleanDate =
    String(dateValue).slice(
      0,
      10
    );


  const date =
    new Date(
      `${cleanDate}T12:00:00`
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
// Calculate Days Left
// ==========================================================

function getDaysLeft(
  deadlineValue
) {

  if (!deadlineValue) {
    return null;
  }


  const deadlineParts =
    String(deadlineValue)
      .slice(0, 10)
      .split("-")
      .map(Number);


  if (
    deadlineParts.length !== 3
  ) {

    return null;

  }


  const [
    year,
    month,
    day
  ] = deadlineParts;


  const now =
    new Date();


  /*
    Compare dates at local midnight so the
    result represents calendar days rather
    than hours remaining.
  */

  const today =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );


  const deadline =
    new Date(
      year,
      month - 1,
      day
    );


  if (
    Number.isNaN(
      deadline.getTime()
    )
  ) {

    return null;

  }


  const millisecondsPerDay =
    1000 * 60 * 60 * 24;


  return Math.ceil(
    (
      deadline.getTime() -
      today.getTime()
    ) /
    millisecondsPerDay
  );

}


// ==========================================================
// Format Days Left
// ==========================================================

function formatDaysLeft(
  deadlineValue
) {

  const daysLeft =
    getDaysLeft(
      deadlineValue
    );


  if (daysLeft === null) {

    return "";

  }


  if (daysLeft < 0) {

    return "Deadline Passed";

  }


  if (daysLeft === 0) {

    return "Due Today";

  }


  if (daysLeft === 1) {

    return "1 Day Left";

  }


  return `${daysLeft} Days Left`;

}


// ==========================================================
// Display Saved Jobs
// ==========================================================

function displaySavedJobs() {

  savedJobsList.innerHTML = "";


  const savedJobs =
    getSortedSavedJobs();


  if (
    savedJobs.length === 0
  ) {

    displayEmptyState();

    return;

  }


  savedJobs.forEach(
    (job) => {

      createSavedJobCard(
        job
      );

    }
  );


  savedJobsList.scrollTop = 0;

}


// ==========================================================
// Empty State
// ==========================================================

function displayEmptyState() {

  const emptyState =
    document.createElement(
      "div"
    );


  emptyState.classList.add(
    "saved-jobs-empty"
  );


  emptyState.innerHTML = `

    <div
      class="saved-jobs-empty-icon"
    >

      <img
        src="../assets/svg/savedJobsIcon.svg"
        alt=""
      >

    </div>


    <h2>
      No saved jobs yet
    </h2>


    <p>
      Jobs you bookmark will appear here.
    </p>

  `;


  savedJobsList.appendChild(
    emptyState
  );

}


// ==========================================================
// Create Saved Job Card
// ==========================================================

function createSavedJobCard(job) {

  const card =
    document.createElement(
      "article"
    );


  card.classList.add(
    "saved-job-card"
  );


  // --------------------------------------------------------
  // Logo
  // --------------------------------------------------------

  const logo =
    document.createElement("div");


  logo.classList.add(
    "saved-job-logo"
  );


  if (job.logo) {

    const logoImage =
      document.createElement("img");


    logoImage.src =
      job.logo;


    logoImage.alt =
      `${job.company} logo`;


    logo.appendChild(
      logoImage
    );

  }


  // --------------------------------------------------------
  // Job Details
  // --------------------------------------------------------

  const details =
    document.createElement("div");


  details.classList.add(
    "saved-job-details"
  );


  const title =
    document.createElement("h2");


  title.textContent =
    job.title;


  const company =
    document.createElement("p");


  company.classList.add(
    "saved-job-company"
  );


  company.textContent =
    job.company;


  // --------------------------------------------------------
  // Days Left
  // --------------------------------------------------------

  const daysLeft =
    document.createElement("p");


  daysLeft.classList.add(
    "saved-job-days-left"
  );


  daysLeft.textContent =
    formatDaysLeft(
      job.deadline
    );


  // --------------------------------------------------------
  // Deadline
  // --------------------------------------------------------

  const deadline =
    document.createElement("p");


  deadline.classList.add(
    "saved-job-deadline"
  );


  const deadlineLabel =
    document.createElement(
      "strong"
    );


  deadlineLabel.textContent =
    "Deadline: ";


  deadline.append(
    deadlineLabel,
    document.createTextNode(
      formatDate(
        job.deadline
      )
    )
  );


  details.append(
    title,
    company
  );


  if (
    daysLeft.textContent
  ) {

    details.appendChild(
      daysLeft
    );

  }


  details.appendChild(
    deadline
  );


  // --------------------------------------------------------
  // Actions
  // --------------------------------------------------------

  const actions =
    document.createElement("div");


  actions.classList.add(
    "saved-job-actions"
  );


  // --------------------------------------------------------
  // Bookmark / Unsave
  // --------------------------------------------------------

  const unsaveButton =
    document.createElement(
      "button"
    );


  unsaveButton.type =
    "button";


  unsaveButton.classList.add(
    "unsave-job-button"
  );


  unsaveButton.dataset.jobId =
    job.id;


  unsaveButton.setAttribute(
    "aria-label",
    `Remove ${job.title} from saved jobs`
  );


  unsaveButton.innerHTML = `

    <img
      src="../assets/svg/bookmarkFilledIcon.svg"
      alt=""
    >

  `;


  unsaveButton.addEventListener(
    "click",
    () => {

      openRemoveModal(
        job
      );

    }
  );


  // --------------------------------------------------------
  // View / Apply
  // --------------------------------------------------------

  const actionButtons =
    document.createElement("div");


  actionButtons.classList.add(
    "saved-job-action-buttons"
  );


  const viewButton =
    document.createElement(
      "button"
    );


  viewButton.type =
    "button";


  viewButton.classList.add(
    "saved-job-action-button",
    "view-job-button"
  );


  viewButton.dataset.jobId =
    job.id;


  viewButton.dataset.target =
    "job-details-overlay";


  viewButton.textContent =
    "View";


  viewButton.addEventListener(
    "click",
    () => {

      handleViewJob(
        job
      );

    }
  );


  const applyButton =
    document.createElement(
      "button"
    );


  applyButton.type =
    "button";


  applyButton.classList.add(
    "saved-job-action-button",
    "apply-job-button"
  );


  applyButton.dataset.jobId =
    job.id;


  applyButton.dataset.target =
    "job-application.html";


  applyButton.textContent =
    "Apply";


  applyButton.addEventListener(
    "click",
    () => {

      handleApplyToJob(
        job
      );

    }
  );


  actionButtons.append(
    applyButton,
    viewButton
  );


  actions.append(
    unsaveButton,
    actionButtons
  );


  // --------------------------------------------------------
  // Complete Card
  // --------------------------------------------------------

  card.append(
    logo,
    details,
    actions
  );


  savedJobsList.appendChild(
    card
  );

}


// ==========================================================
// Open Remove Modal
// ==========================================================

function openRemoveModal(job) {

  jobPendingRemoval =
    job;


  removeSavedModal.hidden =
    false;


  document.body.style.overflow =
    "hidden";


  cancelRemoveButton.focus();

}


// ==========================================================
// Close Remove Modal
// ==========================================================

function closeRemoveModal() {

  removeSavedModal.hidden =
    true;


  document.body.style.overflow =
    "";


  jobPendingRemoval =
    null;

}


// ==========================================================
// Confirm Remove
// ==========================================================

function confirmRemoveJob() {

  if (!jobPendingRemoval) {
    return;
  }


  removeSavedJob(
    jobPendingRemoval.id
  );


  savedJobIds =
    getSavedJobIds();


  closeRemoveModal();


  displaySavedJobs();

}


// ==========================================================
// Future: Job Details Overlay
// ==========================================================

function handleViewJob(job) {

  /*
    FUTURE:

    Open job-details-overlay
    using job.id.
  */

  console.log(
    "Future job-details-overlay:",
    job.id
  );

}


// ==========================================================
// Future: Job Application Page
// ==========================================================

function handleApplyToJob(job) {

  /*
    FUTURE:

    Navigate directly to:

    job-application.html

    Example:

    window.location.href =
      `job-application.html?jobId=${job.id}`;
  */

  console.log(
    "Future job-application.html:",
    job.id
  );

}


// ==========================================================
// Sort
// ==========================================================

savedJobsSort.addEventListener(
  "change",
  () => {

    displaySavedJobs();

  }
);


// ==========================================================
// Cancel Remove
// ==========================================================

cancelRemoveButton.addEventListener(
  "click",
  () => {

    closeRemoveModal();

  }
);


// ==========================================================
// Confirm Remove
// ==========================================================

confirmRemoveButton.addEventListener(
  "click",
  () => {

    confirmRemoveJob();

  }
);


// ==========================================================
// Click Outside Modal
// ==========================================================

removeSavedModal.addEventListener(
  "click",
  (event) => {

    if (
      event.target ===
      removeSavedModal
    ) {

      closeRemoveModal();

    }

  }
);


// ==========================================================
// Escape Key
// ==========================================================

document.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key === "Escape" &&
      !removeSavedModal.hidden
    ) {

      closeRemoveModal();

    }

  }
);


// ==========================================================
// Initialize Saved Jobs
// ==========================================================

async function initializeSavedJobs() {

  allJobs =
    await loadJobs();


  savedJobIds =
    getSavedJobIds();


  displaySavedJobs();

}


// ==========================================================
// Start
// ==========================================================

initializeSavedJobs();