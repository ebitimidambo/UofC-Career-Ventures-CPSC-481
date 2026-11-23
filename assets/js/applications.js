// ==========================================================
// UC Careers - Applications
// ==========================================================

import {
  getCurrentUser,
  saveCurrentUser
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
// View Modal Elements
// ==========================================================

const viewApplicationModal =
  document.getElementById(
    "view-application-modal"
  );

const viewApplicationContent =
  document.getElementById(
    "view-application-content"
  );

const closeViewApplicationButton =
  document.getElementById(
    "close-view-application"
  );

const closeViewApplicationFooterButton =
  document.getElementById(
    "close-view-application-footer"
  );


// ==========================================================
// Withdraw Modal Elements
// ==========================================================

const withdrawApplicationModal =
  document.getElementById(
    "withdraw-application-modal"
  );

const withdrawModalDescription =
  document.getElementById(
    "withdraw-modal-description"
  );

const cancelWithdrawButton =
  document.getElementById(
    "cancel-withdraw"
  );

const confirmWithdrawButton =
  document.getElementById(
    "confirm-withdraw"
  );


// ==========================================================
// Page State
// ==========================================================

let currentUser =
  getCurrentUser();

let allJobs = [];

let applications = [];

let applicationPendingWithdrawal =
  null;


// ==========================================================
// Load Jobs
// ==========================================================

async function loadJobs() {

  try {

    const response =
      await fetch(
        "../data/jobs.json?v=4"
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
// Company Initials
// ==========================================================

function getCompanyInitials(
  companyName
) {

  const words =
    String(companyName || "")
      .trim()
      .split(/\s+/)
      .map(
        (word) =>
          word.replace(
            /[^a-zA-Z0-9]/g,
            ""
          )
      )
      .filter(Boolean);


  if (
    words.length >= 2
  ) {

    return (
      words[0][0] +
      words[1][0]
    ).toUpperCase();

  }


  if (
    words.length === 1
  ) {

    return words[0]
      .slice(
        0,
        2
      )
      .toUpperCase();

  }


  return "UC";

}


// ==========================================================
// Get Application Date
// ==========================================================

function getApplicationDate(
  application
) {

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

function formatDate(
  dateValue
) {

  if (!dateValue) {

    return "Not available";

  }


  const cleanDate =
    String(dateValue)
      .slice(
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
// Format Salary
// ==========================================================

function formatSalary(
  job
) {

  if (
    job?.salary === undefined ||
    job?.salary === null
  ) {

    return "Not available";

  }


  const salary =
    Number(
      job.salary
    );


  if (
    Number.isNaN(
      salary
    )
  ) {

    return String(
      job.salary
    );

  }


  return `$${salary.toFixed(2)} per hour`;

}


// ==========================================================
// Format Experience
// ==========================================================

function formatExperience(
  job
) {

  if (
    job?.experienceYears === undefined ||
    job?.experienceYears === null
  ) {

    return "Not available";

  }


  const experience =
    Number(
      job.experienceYears
    );


  if (
    Number.isNaN(
      experience
    )
  ) {

    return String(
      job.experienceYears
    );

  }


  if (
    experience <= 0
  ) {

    return "No experience required";

  }


  if (
    experience === 1
  ) {

    return "1 year";

  }


  return `${experience} years`;

}


// ==========================================================
// Normalize List
// ==========================================================

function normalizeList(
  value
) {

  if (
    Array.isArray(value)
  ) {

    return value
      .map(
        (item) =>
          String(item).trim()
      )
      .filter(Boolean);

  }


  if (
    typeof value === "string"
  ) {

    return value
      .split(/\n|;/)
      .map(
        (item) =>
          item.trim()
      )
      .filter(Boolean);

  }


  return [];

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

  applicationsList.innerHTML =
    "";


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
    document.createElement(
      "div"
    );


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


  const jobTitle =
    job?.title ||
    application.jobTitle ||
    application.title ||
    "Job Application";


  const companyName =
    job?.company ||
    application.company ||
    "Company";


  const location =
    job?.location ||
    application.location ||
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
  // Left
  // --------------------------------------------------------

  const left =
    document.createElement(
      "div"
    );


  left.classList.add(
    "application-card-left"
  );


  // --------------------------------------------------------
  // Company Initials
  // --------------------------------------------------------

  const logo =
    document.createElement(
      "div"
    );


  logo.classList.add(
    "application-logo"
  );


  logo.setAttribute(
    "aria-label",
    companyName
  );


  const initials =
    document.createElement(
      "span"
    );


  initials.classList.add(
    "application-logo-initials"
  );


  initials.textContent =
    getCompanyInitials(
      companyName
    );


  logo.appendChild(
    initials
  );


  // --------------------------------------------------------
  // Job Information
  // --------------------------------------------------------

  const details =
    document.createElement(
      "div"
    );


  details.classList.add(
    "application-details"
  );


  const title =
    document.createElement(
      "h2"
    );


  title.textContent =
    jobTitle;


  const company =
    document.createElement(
      "p"
    );


  company.classList.add(
    "application-company"
  );


  company.textContent =
    companyName;


  details.append(
    title,
    company
  );


  if (location) {

    const locationText =
      document.createElement(
        "p"
      );


    locationText.classList.add(
      "application-location"
    );


    locationText.textContent =
      location;


    details.appendChild(
      locationText
    );

  }


  left.append(
    logo,
    details
  );


  // --------------------------------------------------------
  // Right
  // --------------------------------------------------------

  const right =
    document.createElement(
      "div"
    );


  right.classList.add(
    "application-card-right"
  );


  // --------------------------------------------------------
  // Meta
  // --------------------------------------------------------

  const meta =
    document.createElement(
      "div"
    );


  meta.classList.add(
    "application-meta"
  );


  const statusLabel =
    document.createElement(
      "p"
    );


  statusLabel.innerHTML =
    "<strong>Status:</strong>";


  const statusValue =
    document.createElement(
      "span"
    );


  statusValue.classList.add(
    "application-status"
  );


  if (
    status.toLowerCase() ===
    "withdrawn"
  ) {

    statusValue.classList.add(
      "withdrawn"
    );

  }


  statusValue.textContent =
    status;


  const dateText =
    document.createElement(
      "p"
    );


  dateText.innerHTML =
    `<strong>Date Applied:</strong> ${dateApplied}`;


  meta.append(
    statusLabel,
    statusValue,
    dateText
  );


  // --------------------------------------------------------
  // Actions
  // --------------------------------------------------------

  const actions =
    document.createElement(
      "div"
    );


  actions.classList.add(
    "application-actions"
  );


  const viewButton =
    document.createElement(
      "button"
    );


  viewButton.type =
    "button";


  viewButton.classList.add(
    "application-action-button",
    "view-application-button"
  );


  viewButton.textContent =
    "View";


  viewButton.addEventListener(
    "click",
    () => {

      openViewApplication(
        application
      );

    }
  );


  actions.appendChild(
    viewButton
  );


  if (
    status.toLowerCase() !==
    "withdrawn"
  ) {

    const withdrawButton =
      document.createElement(
        "button"
      );


    withdrawButton.type =
      "button";


    withdrawButton.classList.add(
      "application-action-button",
      "withdraw-application-button"
    );


    withdrawButton.textContent =
      "Withdraw";


    withdrawButton.addEventListener(
      "click",
      () => {

        openWithdrawModal(
          application
        );

      }
    );


    actions.appendChild(
      withdrawButton
    );

  }


  right.append(
    meta,
    actions
  );


  // --------------------------------------------------------
  // Complete Card
  // --------------------------------------------------------

  card.append(
    left,
    right
  );


  applicationsList.appendChild(
    card
  );

}


// ==========================================================
// Add View Summary Item
// ==========================================================

function createSummaryItem(
  label,
  value
) {

  const item =
    document.createElement(
      "div"
    );


  item.classList.add(
    "view-summary-item"
  );


  const labelElement =
    document.createElement(
      "p"
    );


  labelElement.classList.add(
    "view-summary-label"
  );


  labelElement.textContent =
    label;


  const valueElement =
    document.createElement(
      "p"
    );


  valueElement.classList.add(
    "view-summary-value"
  );


  valueElement.textContent =
    value || "Not available";


  item.append(
    labelElement,
    valueElement
  );


  return item;

}


// ==========================================================
// Add View Text Section
// ==========================================================

function appendViewTextSection(
  container,
  title,
  value
) {

  if (
    value === undefined ||
    value === null ||
    String(value).trim() === ""
  ) {

    return;

  }


  const section =
    document.createElement(
      "section"
    );


  section.classList.add(
    "view-section"
  );


  const heading =
    document.createElement(
      "h4"
    );


  heading.textContent =
    title;


  const paragraph =
    document.createElement(
      "p"
    );


  paragraph.textContent =
    value;


  section.append(
    heading,
    paragraph
  );


  container.appendChild(
    section
  );

}


// ==========================================================
// Add View List Section
// ==========================================================

function appendViewListSection(
  container,
  title,
  values
) {

  const items =
    normalizeList(
      values
    );


  if (
    items.length === 0
  ) {

    return;

  }


  const section =
    document.createElement(
      "section"
    );


  section.classList.add(
    "view-section"
  );


  const heading =
    document.createElement(
      "h4"
    );


  heading.textContent =
    title;


  const list =
    document.createElement(
      "ul"
    );


  items.forEach(
    (item) => {

      const listItem =
        document.createElement(
          "li"
        );


      listItem.textContent =
        item;


      list.appendChild(
        listItem
      );

    }
  );


  section.append(
    heading,
    list
  );


  container.appendChild(
    section
  );

}


// ==========================================================
// Submitted Documents
// ==========================================================

function appendSubmittedDocuments(
  container,
  application
) {

  const documents =
    Array.isArray(
      application.documents
    )
      ? application.documents
      : [];


  const section =
    document.createElement(
      "section"
    );


  section.classList.add(
    "view-section"
  );


  const heading =
    document.createElement(
      "h4"
    );


  heading.textContent =
    "Documents Submitted";


  section.appendChild(
    heading
  );


  if (
    documents.length === 0
  ) {

    const message =
      document.createElement(
        "p"
      );


    message.textContent =
      "No document names were saved with this application.";


    section.appendChild(
      message
    );


    container.appendChild(
      section
    );


    return;

  }


  const documentList =
    document.createElement(
      "div"
    );


  documentList.classList.add(
    "submitted-documents"
  );


  documents.forEach(
    (documentRecord) => {

      const row =
        document.createElement(
          "div"
        );


      row.classList.add(
        "submitted-document"
      );


      const type =
        document.createElement(
          "span"
        );


      type.classList.add(
        "submitted-document-type"
      );


      type.textContent =
        documentRecord.type ||
        "Document";


      const name =
        document.createElement(
          "span"
        );


      name.classList.add(
        "submitted-document-name"
      );


      name.textContent =
        documentRecord.fileName ||
        "File name unavailable";


      row.append(
        type,
        name
      );


      documentList.appendChild(
        row
      );

    }
  );


  section.appendChild(
    documentList
  );


  container.appendChild(
    section
  );

}


// ==========================================================
// Open View Application
// ==========================================================

function openViewApplication(
  application
) {

  const job =
    findJobForApplication(
      application
    );


  const jobTitle =
    job?.title ||
    application.jobTitle ||
    application.title ||
    "Job Application";


  const companyName =
    job?.company ||
    application.company ||
    "Company";


  const location =
    job?.location ||
    application.location ||
    "Not available";


  const status =
    application.status ||
    "Applied";


  viewApplicationContent.innerHTML =
    "";


  // --------------------------------------------------------
  // Header
  // --------------------------------------------------------

  const jobHeader =
    document.createElement(
      "div"
    );


  jobHeader.classList.add(
    "view-job-header"
  );


  const companyMark =
    document.createElement(
      "div"
    );


  companyMark.classList.add(
    "view-company-mark"
  );


  companyMark.textContent =
    getCompanyInitials(
      companyName
    );


  const heading =
    document.createElement(
      "div"
    );


  heading.classList.add(
    "view-job-heading"
  );


  const title =
    document.createElement(
      "h3"
    );


  title.textContent =
    jobTitle;


  const company =
    document.createElement(
      "p"
    );


  company.textContent =
    companyName;


  const locationText =
    document.createElement(
      "p"
    );


  locationText.textContent =
    location;


  heading.append(
    title,
    company,
    locationText
  );


  jobHeader.append(
    companyMark,
    heading
  );


  viewApplicationContent.appendChild(
    jobHeader
  );


  // --------------------------------------------------------
  // Summary
  // --------------------------------------------------------

  const summary =
    document.createElement(
      "div"
    );


  summary.classList.add(
    "view-summary-grid"
  );


  summary.append(
    createSummaryItem(
      "Status",
      status
    ),

    createSummaryItem(
      "Date Applied",
      formatDate(
        getApplicationDate(
          application
        )
      )
    ),

    createSummaryItem(
      "Job Type",
      job?.type ||
      "Not available"
    ),

    createSummaryItem(
      "Work Term",
      job?.workTerm ||
      "Not available"
    ),

    createSummaryItem(
      "Salary",
      formatSalary(
        job
      )
    ),

    createSummaryItem(
      "Application Deadline",
      formatDate(
        job?.deadline
      )
    )
  );


  viewApplicationContent.appendChild(
    summary
  );


  // --------------------------------------------------------
  // Brief Job Information
  // --------------------------------------------------------

  appendViewTextSection(
    viewApplicationContent,
    "Job Description",
    job?.description
  );


  appendViewTextSection(
    viewApplicationContent,
    "Experience Required",
    formatExperience(
      job
    )
  );


  appendViewListSection(
    viewApplicationContent,
    "Required Skills",
    job?.skills
  );


  // --------------------------------------------------------
  // Documents at Bottom
  // --------------------------------------------------------

  appendSubmittedDocuments(
    viewApplicationContent,
    application
  );


  viewApplicationModal.hidden =
    false;


  document.body.style.overflow =
    "hidden";


  closeViewApplicationButton.focus();

}


// ==========================================================
// Close View Application
// ==========================================================

function closeViewApplication() {

  viewApplicationModal.hidden =
    true;


  document.body.style.overflow =
    "";

}


// ==========================================================
// Open Withdraw Modal
// ==========================================================

function openWithdrawModal(
  application
) {

  const job =
    findJobForApplication(
      application
    );


  const jobTitle =
    job?.title ||
    application.jobTitle ||
    application.title ||
    "this position";


  const companyName =
    job?.company ||
    application.company ||
    "this company";


  applicationPendingWithdrawal =
    application;


  withdrawModalDescription.textContent =
    `Are you sure you want to withdraw your application for ${jobTitle} at ${companyName}?`;


  withdrawApplicationModal.hidden =
    false;


  document.body.style.overflow =
    "hidden";


  cancelWithdrawButton.focus();

}


// ==========================================================
// Close Withdraw Modal
// ==========================================================

function closeWithdrawModal() {

  withdrawApplicationModal.hidden =
    true;


  document.body.style.overflow =
    "";


  applicationPendingWithdrawal =
    null;

}


// ==========================================================
// Save Applications
// ==========================================================

function saveApplications() {

  if (!currentUser) {

    return;

  }


  currentUser = {
    ...currentUser,

    applications:
      [...applications]
  };


  saveCurrentUser(
    currentUser
  );

}


// ==========================================================
// Confirm Withdraw
// ==========================================================

function confirmWithdrawApplication() {

  if (
    !applicationPendingWithdrawal
  ) {

    return;

  }


  const targetApplicationId =
    applicationPendingWithdrawal.id;


  /*
    Remove the withdrawn application completely
    from the user's Applications list.
  */

  applications =
    applications.filter(
      (application) =>
        application.id !==
        targetApplicationId
    );


  /*
    Save the updated Applications array
    back to the current user in localStorage.
  */

  saveApplications();


  closeWithdrawModal();


  displayApplications();

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
// View Modal Events
// ==========================================================

closeViewApplicationButton.addEventListener(
  "click",
  () => {

    closeViewApplication();

  }
);


closeViewApplicationFooterButton.addEventListener(
  "click",
  () => {

    closeViewApplication();

  }
);


viewApplicationModal.addEventListener(
  "click",
  (event) => {

    if (
      event.target ===
      viewApplicationModal
    ) {

      closeViewApplication();

    }

  }
);


// ==========================================================
// Withdraw Modal Events
// ==========================================================

cancelWithdrawButton.addEventListener(
  "click",
  () => {

    closeWithdrawModal();

  }
);


confirmWithdrawButton.addEventListener(
  "click",
  () => {

    confirmWithdrawApplication();

  }
);


withdrawApplicationModal.addEventListener(
  "click",
  (event) => {

    if (
      event.target ===
      withdrawApplicationModal
    ) {

      closeWithdrawModal();

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
      event.key !==
      "Escape"
    ) {

      return;

    }


    if (
      !viewApplicationModal.hidden
    ) {

      closeViewApplication();

      return;

    }


    if (
      !withdrawApplicationModal.hidden
    ) {

      closeWithdrawModal();

    }

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