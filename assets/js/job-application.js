// ==========================================================
// UC Careers - Application Submission
// ==========================================================

import {
  getCurrentUser,
  saveCurrentUser,
  removeSavedJob
} from "./data-service.js?v=2";


// ==========================================================
// Page Elements
// ==========================================================

const applicationContent =
  document.getElementById(
    "application-content"
  );

const applicationError =
  document.getElementById(
    "application-error"
  );

const backToJobButton =
  document.getElementById(
    "back-to-job"
  );


const companyInitials =
  document.getElementById(
    "company-initials"
  );

const jobTitle =
  document.getElementById(
    "job-title"
  );

const jobCompany =
  document.getElementById(
    "job-company"
  );

const jobLocation =
  document.getElementById(
    "job-location"
  );


const applicationForm =
  document.getElementById(
    "application-form"
  );


const resumeLabel =
  document.getElementById(
    "resume-label"
  );

const resumeFile =
  document.getElementById(
    "resume-file"
  );

const resumeFileName =
  document.getElementById(
    "resume-file-name"
  );


const coverLetterLabel =
  document.getElementById(
    "cover-letter-label"
  );

const coverLetterFile =
  document.getElementById(
    "cover-letter-file"
  );

const coverLetterFileName =
  document.getElementById(
    "cover-letter-file-name"
  );


const additionalDocumentsLabel =
  document.getElementById(
    "additional-documents-label"
  );

const additionalFiles =
  document.getElementById(
    "additional-files"
  );

const additionalPickerStatus =
  document.getElementById(
    "additional-picker-status"
  );

const additionalFileNames =
  document.getElementById(
    "additional-file-names"
  );


const detailsSummaryContent =
  document.getElementById(
    "details-summary-content"
  );


// ==========================================================
// Modal Elements
// ==========================================================

const submitModal =
  document.getElementById(
    "submit-modal"
  );

const submitModalDescription =
  document.getElementById(
    "submit-modal-description"
  );

const cancelSubmitButton =
  document.getElementById(
    "cancel-submit"
  );

const confirmSubmitButton =
  document.getElementById(
    "confirm-submit"
  );

const submissionSuccessModal =
  document.getElementById(
    "submission-success-modal"
  );


// ==========================================================
// Page State
// ==========================================================

let currentJob = null;

let applicationDocuments = [];

let selectedAdditionalFiles = [];

let profileResume = null;

let isSubmitting = false;


// ==========================================================
// Default Application Documents
// ==========================================================

const DEFAULT_APPLICATION_DOCUMENTS = [

  {
    key: "resume",
    label: "Resume",
    required: true
  },

  {
    key: "cover-letter",
    label: "Cover Letter",
    required: true
  }

];


// ==========================================================
// URL Parameters
// ==========================================================

function getUrlParameters() {

  return new URLSearchParams(
    window.location.search
  );

}


// ==========================================================
// Get Job ID
// ==========================================================

function getJobIdFromUrl() {

  return getUrlParameters().get(
    "jobId"
  );

}


// ==========================================================
// Return Page
// ==========================================================

function getReturnPage() {

  const source =
    getUrlParameters().get(
      "from"
    );


  if (!source) {
    return null;
  }


  try {

    const sourceUrl =
      new URL(
        source,
        window.location.href
      );


    if (
      sourceUrl.origin !==
      window.location.origin
    ) {

      return null;

    }


    const pageName =
      sourceUrl.pathname
        .split("/")
        .pop();


    const allowedPages =
      new Set([
        "home.html",
        "job-search.html",
        "saved-jobs.html",
        "applications.html",
        "job-details.html"
      ]);


    if (
      !allowedPages.has(
        pageName
      )
    ) {

      return null;

    }


    return (
      `${pageName}${sourceUrl.search}`
    );


  } catch (error) {

    return null;

  }

}


// ==========================================================
// Referrer Page
// ==========================================================

function getReferrerPage() {

  if (!document.referrer) {
    return null;
  }


  try {

    const referrer =
      new URL(
        document.referrer
      );


    if (
      referrer.origin !==
      window.location.origin
    ) {

      return null;

    }


    const pageName =
      referrer.pathname
        .split("/")
        .pop();


    return (
      `${pageName}${referrer.search}`
    );


  } catch (error) {

    return null;

  }

}


// ==========================================================
// Back Button Text
// ==========================================================

function configureBackButton() {

  const returnPage =
    getReturnPage();


  if (!returnPage) {

    backToJobButton.textContent =
      "< Back to Job Details";


    return;

  }


  if (
    returnPage.startsWith(
      "saved-jobs.html"
    )
  ) {

    backToJobButton.textContent =
      "< Back to Saved Jobs";

    return;

  }


  if (
    returnPage.startsWith(
      "job-search.html"
    )
  ) {

    backToJobButton.textContent =
      "< Back to Job Search";

    return;

  }


  if (
    returnPage.startsWith(
      "home.html"
    )
  ) {

    backToJobButton.textContent =
      "< Back to Home";

    return;

  }


  if (
    returnPage.startsWith(
      "applications.html"
    )
  ) {

    backToJobButton.textContent =
      "< Back to Applications";

    return;

  }


  backToJobButton.textContent =
    "< Back to Job Details";

}


// ==========================================================
// Navigate Back
// ==========================================================

function navigateBack() {

  const returnPage =
    getReturnPage();


  const referrerPage =
    getReferrerPage();


  if (
    returnPage &&
    referrerPage === returnPage &&
    window.history.length > 1
  ) {

    window.history.back();

    return;

  }


  if (returnPage) {

    window.location.replace(
      returnPage
    );

    return;

  }


  if (currentJob) {

    window.location.replace(
      `job-details.html?jobId=${encodeURIComponent(
        currentJob.id
      )}`
    );

    return;

  }


  window.location.replace(
    "job-search.html"
  );

}


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
      .slice(0, 2)
      .toUpperCase();

  }


  return "UC";

}


// ==========================================================
// Normalize Document Key
// ==========================================================

function normalizeDocumentKey(
  value
) {

  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(
      /[^a-z0-9]/g,
      ""
    );

}


// ==========================================================
// Get Application Documents
// ==========================================================

function getApplicationDocuments(
  job
) {

  if (
    Array.isArray(
      job.applicationDocuments
    ) &&
    job.applicationDocuments.length > 0
  ) {

    return job.applicationDocuments;

  }


  return DEFAULT_APPLICATION_DOCUMENTS;

}


// ==========================================================
// Resume Configuration
// ==========================================================

function getResumeConfiguration() {

  return applicationDocuments.find(
    (documentConfiguration) => {

      const key =
        normalizeDocumentKey(
          documentConfiguration.key
        );


      const label =
        normalizeDocumentKey(
          documentConfiguration.label
        );


      return (
        key === "resume" ||
        label === "resume"
      );

    }
  );

}


// ==========================================================
// Cover Letter Configuration
// ==========================================================

function getCoverLetterConfiguration() {

  return applicationDocuments.find(
    (documentConfiguration) => {

      const key =
        normalizeDocumentKey(
          documentConfiguration.key
        );


      const label =
        normalizeDocumentKey(
          documentConfiguration.label
        );


      return (
        key === "coverletter" ||
        label === "coverletter"
      );

    }
  );

}


// ==========================================================
// Additional Document Configurations
// ==========================================================

function getAdditionalDocumentConfigurations() {

  return applicationDocuments.filter(
    (documentConfiguration) => {

      const key =
        normalizeDocumentKey(
          documentConfiguration.key
        );


      const label =
        normalizeDocumentKey(
          documentConfiguration.label
        );


      const isResume =
        key === "resume" ||
        label === "resume";


      const isCoverLetter =
        key === "coverletter" ||
        label === "coverletter";


      return (
        !isResume &&
        !isCoverLetter
      );

    }
  );

}


// ==========================================================
// Required Label
// ==========================================================

function setDocumentLabel(
  element,
  text,
  required
) {

  element.innerHTML = "";


  element.appendChild(
    document.createTextNode(
      text
    )
  );


  if (required) {

    const star =
      document.createElement(
        "span"
      );


    star.classList.add(
      "required-star"
    );


    star.textContent =
      "*";


    element.appendChild(
      star
    );

  }

}


// ==========================================================
// Configure Upload Fields
// ==========================================================

function configureUploadFields() {

  const resumeConfiguration =
    getResumeConfiguration();


  const coverLetterConfiguration =
    getCoverLetterConfiguration();


  const additionalConfigurations =
    getAdditionalDocumentConfigurations();


  setDocumentLabel(
    resumeLabel,
    "Resume",
    resumeConfiguration?.required === true
  );


  setDocumentLabel(
    coverLetterLabel,
    "Cover Letter",
    coverLetterConfiguration?.required === true
  );


  const hasRequiredAdditionalDocument =
    additionalConfigurations.some(
      (documentConfiguration) =>
        documentConfiguration.required === true
    );


  setDocumentLabel(
    additionalDocumentsLabel,
    "Additional Documents",
    hasRequiredAdditionalDocument
  );

}


// ==========================================================
// Resume Selection
// ==========================================================

function renderResumeSelection() {
  const resume = resumeFile.files?.[0] || profileResume;

  resumeFileName.textContent = resume?.name || "No file uploaded";
  resumeFileName.classList.toggle("has-file", Boolean(resume));
}

resumeFile.addEventListener("change", () => {
  if (resumeFile.files?.[0]) {
    profileResume = null;
    resumeFile.setCustomValidity("");
  }

  renderResumeSelection();
});

// ==========================================================
// Load Saved Profile Documents
// ==========================================================

function preloadProfileDocuments() {
  const documents = getCurrentUser()?.profileDocuments;

  if (documents?.resume?.fileName) {
    profileResume = { name: documents.resume.fileName };
    renderResumeSelection();
  }

  if (Array.isArray(documents?.attachments)) {
    const attachments = documents.attachments
      .filter((document) => document?.fileName)
      .map((document) => ({
        name: document.fileName,
        size: document.size,
        lastModified: document.updatedAt
      }));

    addAdditionalFiles(attachments);
  }
}


// ==========================================================
// Cover Letter Selection
// ==========================================================

coverLetterFile.addEventListener(
  "change",
  () => {

    const file =
      coverLetterFile.files?.[0];


    coverLetterFileName.textContent =
      file
        ? file.name
        : "No file uploaded";


    coverLetterFileName.classList.toggle(
      "has-file",
      Boolean(file)
    );

  }
);


// ==========================================================
// Additional File Identity
// ==========================================================

function getFileIdentity(
  file
) {

  return [
    file.name,
    file.size,
    file.lastModified
  ].join("::");

}


// ==========================================================
// Add Additional Files
// ==========================================================

function addAdditionalFiles(
  files
) {

  files.forEach(
    (file) => {

      const fileIdentity =
        getFileIdentity(
          file
        );


      const alreadySelected =
        selectedAdditionalFiles.some(
          (selectedFile) =>
            getFileIdentity(
              selectedFile
            ) === fileIdentity
        );


      if (!alreadySelected) {

        selectedAdditionalFiles.push(
          file
        );

      }

    }
  );


  renderAdditionalFiles();

}


// ==========================================================
// Remove Additional File
// ==========================================================

function removeAdditionalFile(
  index
) {

  selectedAdditionalFiles.splice(
    index,
    1
  );


  renderAdditionalFiles();

}


// ==========================================================
// Render Additional Files
// ==========================================================

function renderAdditionalFiles() {

  additionalFileNames.innerHTML =
    "";


  const fileCount =
    selectedAdditionalFiles.length;


  if (
    fileCount === 0
  ) {

    additionalPickerStatus.textContent =
      "No files chosen";


    additionalPickerStatus.classList.remove(
      "has-file"
    );


    return;

  }


  additionalPickerStatus.textContent =
    fileCount === 1
      ? "1 file selected"
      : `${fileCount} files selected`;


  additionalPickerStatus.classList.add(
    "has-file"
  );


  selectedAdditionalFiles.forEach(
    (file, index) => {

      const row =
        document.createElement(
          "div"
        );


      row.classList.add(
        "selected-file-row"
      );


      const name =
        document.createElement(
          "span"
        );


      name.classList.add(
        "selected-file-name"
      );


      name.textContent =
        file.name;


      const removeButton =
        document.createElement(
          "button"
        );


      removeButton.type =
        "button";


      removeButton.classList.add(
        "remove-file-button"
      );


      removeButton.textContent =
        "×";


      removeButton.setAttribute(
        "aria-label",
        `Remove ${file.name}`
      );


      removeButton.addEventListener(
        "click",
        () => {

          removeAdditionalFile(
            index
          );

        }
      );


      row.append(
        name,
        removeButton
      );


      additionalFileNames.appendChild(
        row
      );

    }
  );

}


// ==========================================================
// Additional File Selection
// ==========================================================

additionalFiles.addEventListener(
  "change",
  () => {

    const files =
      Array.from(
        additionalFiles.files || []
      );


    addAdditionalFiles(
      files
    );


    additionalFiles.value =
      "";

  }
);


// ==========================================================
// Format Date
// ==========================================================

function formatDate(
  dateValue
) {

  if (!dateValue) {
    return "";
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
    job.salary === undefined ||
    job.salary === null
  ) {

    return "";

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
// Format Work Term
// ==========================================================

function formatWorkTerm(
  job
) {

  if (
    job.workTermStart &&
    job.workTermEnd
  ) {

    return (
      `${formatDate(job.workTermStart)} - ` +
      `${formatDate(job.workTermEnd)}`
    );

  }


  if (
    job.workTermDates
  ) {

    return job.workTermDates;

  }


  if (
    job.workTerm
  ) {

    return job.workTerm;

  }


  return "";

}


// ==========================================================
// Format Duration
// ==========================================================

function formatDuration(
  job
) {

  if (
    job.durationMonths === undefined ||
    job.durationMonths === null
  ) {

    return "";

  }


  const duration =
    Number(
      job.durationMonths
    );


  if (
    Number.isNaN(duration) ||
    duration <= 0
  ) {

    return "";

  }


  if (
    duration === 1
  ) {

    return "1 month";

  }


  return `${duration} months`;

}


// ==========================================================
// Format Experience
// ==========================================================

function formatExperience(
  job
) {

  if (
    job.experienceYears === undefined ||
    job.experienceYears === null
  ) {

    return "";

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
// Add Text Detail Section
// ==========================================================

function addTextDetailSection(
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
    "detail-section"
  );


  const heading =
    document.createElement(
      "h3"
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


  detailsSummaryContent.appendChild(
    section
  );

}


// ==========================================================
// Add List Detail Section
// ==========================================================

function addListDetailSection(
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
    "detail-section"
  );


  const heading =
    document.createElement(
      "h3"
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


  detailsSummaryContent.appendChild(
    section
  );

}


// ==========================================================
// Add Flexible Detail Section
// ==========================================================

function addFlexibleDetailSection(
  title,
  value
) {

  if (
    Array.isArray(value)
  ) {

    addListDetailSection(
      title,
      value
    );


    return;

  }


  addTextDetailSection(
    title,
    value
  );

}


// ==========================================================
// Documents to Submit
// ==========================================================

function addDocumentsDetailSection() {

  if (
    applicationDocuments.length === 0
  ) {

    return;

  }


  const section =
    document.createElement(
      "section"
    );


  section.classList.add(
    "detail-section"
  );


  const heading =
    document.createElement(
      "h3"
    );


  heading.textContent =
    "Documents to Submit";


  const list =
    document.createElement(
      "ul"
    );


  applicationDocuments.forEach(
    (documentConfiguration) => {

      const item =
        document.createElement(
          "li"
        );


      const name =
        document.createElement(
          "span"
        );


      name.classList.add(
        "detail-document-name"
      );


      name.textContent =
        documentConfiguration.label;


      item.appendChild(
        name
      );


      if (
        documentConfiguration.required === true
      ) {

        const star =
          document.createElement(
            "span"
          );


        star.classList.add(
          "required-star"
        );


        star.textContent =
          " *";


        item.appendChild(
          star
        );

      }


      list.appendChild(
        item
      );

    }
  );


  section.append(
    heading,
    list
  );


  detailsSummaryContent.appendChild(
    section
  );

}


// ==========================================================
// Render Details Summary
// ==========================================================

function renderDetailsSummary(
  job
) {

  detailsSummaryContent.innerHTML =
    "";


  addTextDetailSection(
    "Job Description",
    job.description
  );


  addTextDetailSection(
    "Job Type",
    job.type
  );


  addTextDetailSection(
    "Location",
    job.location
  );


  addTextDetailSection(
    "Work Term",
    formatWorkTerm(
      job
    )
  );


  addTextDetailSection(
    "Duration",
    formatDuration(
      job
    )
  );


  addTextDetailSection(
    "Salary",
    formatSalary(
      job
    )
  );


  addTextDetailSection(
    "Experience Required",
    formatExperience(
      job
    )
  );


  addTextDetailSection(
    "Application Deadline",
    formatDate(
      job.deadline
    )
  );


  addFlexibleDetailSection(
    "Responsibilities",
    job.responsibilities
  );


  addFlexibleDetailSection(
    "Qualifications",
    job.qualifications
  );


  addFlexibleDetailSection(
    "Requirements",
    job.requirements
  );


  addListDetailSection(
    "Required Skills",
    job.skills
  );


  addFlexibleDetailSection(
    "Schedule",
    job.schedule
  );


  addFlexibleDetailSection(
    "Benefits",
    job.benefits
  );


  addFlexibleDetailSection(
    "Application Instructions",
    job.applicationInstructions
  );


  addDocumentsDetailSection();

}


// ==========================================================
// Render Job Summary
// ==========================================================

function renderJobSummary(
  job
) {

  companyInitials.textContent =
    getCompanyInitials(
      job.company
    );


  jobTitle.textContent =
    job.title || "";


  jobCompany.textContent =
    job.company || "";


  jobLocation.textContent =
    job.location || "";


  document.title =
    `${job.title} Application | UC Careers`;

}


// ==========================================================
// Validate Application
// ==========================================================

function validateApplication() {

  const resumeConfiguration =
    getResumeConfiguration();


  const coverLetterConfiguration =
    getCoverLetterConfiguration();


  const additionalConfigurations =
    getAdditionalDocumentConfigurations();


  if (
    resumeConfiguration?.required === true &&
    !resumeFile.files?.[0] &&
    !profileResume
  ) {

    resumeFile.setCustomValidity(
      "Please upload your resume."
    );


    resumeFile.reportValidity();


    return false;

  }


  resumeFile.setCustomValidity("");


  if (
    coverLetterConfiguration?.required === true &&
    !coverLetterFile.files?.[0]
  ) {

    coverLetterFile.setCustomValidity(
      "Please upload your cover letter."
    );


    coverLetterFile.reportValidity();


    return false;

  }


  coverLetterFile.setCustomValidity("");


  const requiredAdditionalDocuments =
    additionalConfigurations.filter(
      (documentConfiguration) =>
        documentConfiguration.required === true
    );


  if (
    selectedAdditionalFiles.length <
    requiredAdditionalDocuments.length
  ) {

    additionalFiles.setCustomValidity(
      "Please upload all required additional documents."
    );


    additionalFiles.reportValidity();


    return false;

  }


  additionalFiles.setCustomValidity("");


  return true;

}


// ==========================================================
// Open Confirmation Modal
// ==========================================================

function openSubmitModal() {

  submitModalDescription.textContent =
    `Are you sure you want to submit your application for ` +
    `${currentJob.title} at ${currentJob.company}?`;


  submitModal.hidden =
    false;


  document.body.style.overflow =
    "hidden";


  cancelSubmitButton.focus();

}


// ==========================================================
// Close Confirmation Modal
// ==========================================================

function closeSubmitModal() {

  submitModal.hidden =
    true;


  document.body.style.overflow =
    "";

}


// ==========================================================
// Show Submission Success
// ==========================================================

function showSubmissionSuccess() {

  submissionSuccessModal.hidden =
    false;


  document.body.style.overflow =
    "hidden";

}


// ==========================================================
// Get Submitted Documents
// ==========================================================

function getSubmittedDocuments() {

  const documents = [];


  const resume =
    resumeFile.files?.[0] || profileResume;


  const coverLetter =
    coverLetterFile.files?.[0];


  if (resume) {

    documents.push({

      type:
        "Resume",

      fileName:
        resume.name

    });

  }


  if (coverLetter) {

    documents.push({

      type:
        "Cover Letter",

      fileName:
        coverLetter.name

    });

  }


  const additionalConfigurations =
    getAdditionalDocumentConfigurations();


  selectedAdditionalFiles.forEach(
    (file, index) => {

      const configuration =
        additionalConfigurations[
          index
        ];


      documents.push({

        type:
          configuration?.label ||
          "Additional Document",

        fileName:
          file.name

      });

    }
  );


  return documents;

}


// ==========================================================
// Local Date
// ==========================================================

function getLocalDateString() {

  const now =
    new Date();


  const year =
    now.getFullYear();


  const month =
    String(
      now.getMonth() + 1
    ).padStart(
      2,
      "0"
    );


  const day =
    String(
      now.getDate()
    ).padStart(
      2,
      "0"
    );


  return `${year}-${month}-${day}`;

}


// ==========================================================
// Save Application
// ==========================================================

function saveApplication() {

  const user =
    getCurrentUser();


  if (!user) {

    console.error(
      "No current user found."
    );


    return;

  }


  const applications =
    Array.isArray(
      user.applications
    )
      ? user.applications
      : [];


  const application = {

    id:
      `application-${Date.now()}`,

    jobId:
      currentJob.id,

    status:
      "Applied",

    dateApplied:
      getLocalDateString(),

    documents:
      getSubmittedDocuments()

  };


  saveCurrentUser({

    ...user,

    applications: [
      application,
      ...applications
    ]

  });


  /*
    Once the application is submitted, the job
    is no longer something the user is planning
    to apply to in the future.

    Keep the application in Applications, but
    remove the job from Saved Jobs if it was saved.
  */

  removeSavedJob(
    currentJob.id
  );

}


// ==========================================================
// Submit Form
// ==========================================================

applicationForm.addEventListener(
  "submit",
  (event) => {

    event.preventDefault();


    if (
      !currentJob ||
      !validateApplication()
    ) {

      return;

    }


    openSubmitModal();

  }
);


// ==========================================================
// Confirm Submission
// ==========================================================

confirmSubmitButton.addEventListener(
  "click",
  () => {

    if (
      !currentJob ||
      isSubmitting
    ) {

      return;

    }


    isSubmitting = true;


    confirmSubmitButton.disabled =
      true;


    saveApplication();


    closeSubmitModal();


    showSubmissionSuccess();


    window.setTimeout(
      () => {

        window.location.replace(
          "applications.html"
        );

      },
      1500
    );

  }
);


// ==========================================================
// Cancel Submission
// ==========================================================

cancelSubmitButton.addEventListener(
  "click",
  () => {

    closeSubmitModal();

  }
);


// ==========================================================
// Click Outside Modal
// ==========================================================

submitModal.addEventListener(
  "click",
  (event) => {

    if (
      event.target ===
      submitModal
    ) {

      closeSubmitModal();

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
      !submitModal.hidden
    ) {

      closeSubmitModal();

    }

  }
);


// ==========================================================
// Back
// ==========================================================

backToJobButton.addEventListener(
  "click",
  () => {

    navigateBack();

  }
);


// ==========================================================
// Display Error
// ==========================================================

function displayError() {

  applicationContent.hidden =
    true;


  applicationError.hidden =
    false;

}


// ==========================================================
// Display Application
// ==========================================================

function displayApplication(
  job
) {

  currentJob =
    job;


  applicationDocuments =
    getApplicationDocuments(
      job
    );


  renderJobSummary(
    job
  );


  configureUploadFields();


  renderDetailsSummary(
    job
  );


  configureBackButton();


  applicationError.hidden =
    true;


  applicationContent.hidden =
    false;

}


// ==========================================================
// Initialize
// ==========================================================

async function initializeApplicationPage() {

  configureBackButton();


  const jobId =
    getJobIdFromUrl();


  if (!jobId) {

    displayError();

    return;

  }


  const jobs =
    await loadJobs();


  const job =
    jobs.find(
      (job) =>
        job.id === jobId
    );


  if (!job) {

    displayError();

    return;

  }


  displayApplication(
    job
  );

  preloadProfileDocuments();

}


// ==========================================================
// Start
// ==========================================================

initializeApplicationPage();