// ==========================================================
// UC Careers - Job Details
// ==========================================================

import {
  getCurrentUser
} from "./data-service.js?v=2";


// ==========================================================
// Page Elements
// ==========================================================

const jobDetailsContent =
  document.getElementById(
    "job-details-content"
  );


const jobDetailsError =
  document.getElementById(
    "job-details-error"
  );


const backButton =
  document.getElementById(
    "back-button"
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


const jobDeadline =
  document.getElementById(
    "job-deadline"
  );


const applyButton =
  document.getElementById(
    "apply-button"
  );


const jobInformation =
  document.getElementById(
    "job-information"
  );


const skillList =
  document.getElementById(
    "skill-list"
  );


// ==========================================================
// Page State
// ==========================================================

let currentUser =
  getCurrentUser();


let currentJob = null;


// ==========================================================
// Get Job ID From URL
// ==========================================================

function getJobIdFromUrl() {

  const parameters =
    new URLSearchParams(
      window.location.search
    );


  return parameters.get(
    "jobId"
  );

}


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
// Normalize Text
// ==========================================================

function normalizeText(value) {

  return String(
    value || ""
  )
    .trim()
    .toLowerCase();

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


  /*
    Two or more words:

    Calgary Tech Solutions
    -> CT

    Bow River Digital
    -> BR
  */

  if (
    words.length >= 2
  ) {

    return (
      words[0][0] +
      words[1][0]
    ).toUpperCase();

  }


  /*
    One word:

    AltaWorks
    -> AL
  */

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

function formatSalary(job) {

  if (
    job.salary === undefined ||
    job.salary === null ||
    job.salary === ""
  ) {

    return "";

  }


  return `$${job.salary}/hr`;

}


// ==========================================================
// Format Duration
// ==========================================================

function formatDuration(job) {

  const months =
    Number(
      job.durationMonths
    );


  if (
    !Number.isFinite(months) ||
    months <= 0
  ) {

    return "";

  }


  if (
    months === 1
  ) {

    return "1 month";

  }


  return `${months} months`;

}


// ==========================================================
// Format Experience
// ==========================================================

function formatExperience(job) {

  const experienceYears =
    Number(
      job.experienceYears || 0
    );


  if (
    experienceYears <= 0
  ) {

    return (
      "No previous experience required."
    );

  }


  if (
    experienceYears === 1
  ) {

    return (
      "1 year of previous experience required."
    );

  }


  return (
    `${experienceYears} years of previous experience required.`
  );

}


// ==========================================================
// Add Text Section
// ==========================================================

function addTextSection(
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
    "job-info-section"
  );


  const heading =
    document.createElement(
      "h3"
    );


  heading.textContent =
    title;


  section.appendChild(
    heading
  );


  /*
    Multiple paragraphs can be supplied
    using line breaks.
  */

  const paragraphs =
    String(value)
      .split(/\n+/)
      .map(
        (paragraph) =>
          paragraph.trim()
      )
      .filter(Boolean);


  paragraphs.forEach(
    (paragraphText) => {

      const paragraph =
        document.createElement(
          "p"
        );


      paragraph.textContent =
        paragraphText;


      section.appendChild(
        paragraph
      );

    }
  );


  jobInformation.appendChild(
    section
  );

}


// ==========================================================
// Add List Section
// ==========================================================

function addListSection(
  title,
  values
) {

  let items = [];


  if (
    Array.isArray(values)
  ) {

    items =
      values
        .map(
          (value) =>
            String(value).trim()
        )
        .filter(Boolean);

  } else if (
    typeof values === "string"
  ) {

    items =
      values
        .split(/\n|;/)
        .map(
          (value) =>
            value.trim()
        )
        .filter(Boolean);

  }


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
    "job-info-section"
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


  jobInformation.appendChild(
    section
  );

}


// ==========================================================
// Render Job Information
// ==========================================================

function renderJobInformation(
  job
) {

  jobInformation.innerHTML = "";


  // --------------------------------------------------------
  // Description
  // --------------------------------------------------------

  addTextSection(
    "Description",
    job.description
  );


  // --------------------------------------------------------
  // Job Type
  // --------------------------------------------------------

  addTextSection(
    "Job Type",
    job.type
  );


  // --------------------------------------------------------
  // Work Term
  // --------------------------------------------------------

  let workTermText =
    job.workTerm || "";


  /*
    Future jobs may have actual start and
    end dates.
  */

  if (
    job.workTermStart &&
    job.workTermEnd
  ) {

    workTermText =
      `${formatDate(job.workTermStart)} - ${formatDate(job.workTermEnd)}`;

  } else if (
    job.workTermDates
  ) {

    workTermText =
      job.workTermDates;

  }


  addTextSection(
    "Work Term",
    workTermText
  );


  // --------------------------------------------------------
  // Duration
  // --------------------------------------------------------

  addTextSection(
    "Duration",
    formatDuration(job)
  );


  // --------------------------------------------------------
  // Salary
  // --------------------------------------------------------

  addTextSection(
    "Salary",
    formatSalary(job)
  );


  // --------------------------------------------------------
  // Experience
  // --------------------------------------------------------

  addTextSection(
    "Experience Required",
    formatExperience(job)
  );


  // --------------------------------------------------------
  // Responsibilities
  // --------------------------------------------------------

  addListSection(
    "Responsibilities",
    job.responsibilities
  );


  // --------------------------------------------------------
  // Qualifications
  // --------------------------------------------------------

  addListSection(
    "Qualifications",
    job.qualifications
  );


  // --------------------------------------------------------
  // Requirements
  // --------------------------------------------------------

  addListSection(
    "Requirements",
    job.requirements
  );


  // --------------------------------------------------------
  // Required Skills
  // --------------------------------------------------------

  addListSection(
    "Required Skills",
    job.skills
  );


  // --------------------------------------------------------
  // Schedule
  // --------------------------------------------------------

  addTextSection(
    "Schedule",
    job.schedule
  );


  // --------------------------------------------------------
  // Benefits
  // --------------------------------------------------------

  addListSection(
    "Benefits",
    job.benefits
  );


  // --------------------------------------------------------
  // Application Instructions
  // --------------------------------------------------------

  addTextSection(
    "Application Instructions",
    job.applicationInstructions
  );

}


// ==========================================================
// Get User Skills
// ==========================================================

function getUserSkills() {

  if (
    !Array.isArray(
      currentUser?.skills
    )
  ) {

    return [];

  }


  return currentUser.skills.map(
    normalizeText
  );

}


// ==========================================================
// Render Skill Match
// ==========================================================

function renderSkillMatch(
  job
) {

  skillList.innerHTML = "";


  const requiredSkills =
    Array.isArray(job.skills)
      ? job.skills
      : [];


  if (
    requiredSkills.length === 0
  ) {

    const message =
      document.createElement(
        "p"
      );


    message.classList.add(
      "no-skills"
    );


    message.textContent =
      "No specific skills are listed for this job.";


    skillList.appendChild(
      message
    );


    return;

  }


  const userSkills =
    getUserSkills();


  requiredSkills.forEach(
    (skillName) => {

      const normalizedSkill =
        normalizeText(
          skillName
        );


      const isMatched =
        userSkills.includes(
          normalizedSkill
        );


      const skill =
        document.createElement(
          "span"
        );


      skill.classList.add(
        "skill",
        isMatched
          ? "matched"
          : "missing"
      );


      const status =
        document.createElement(
          "span"
        );


      status.classList.add(
        "skill-status"
      );


      status.setAttribute(
        "aria-hidden",
        "true"
      );


      status.textContent =
        isMatched
          ? "✓"
          : "×";


      const name =
        document.createElement(
          "span"
        );


      name.textContent =
        skillName;


      skill.append(
        status,
        name
      );


      skillList.appendChild(
        skill
      );

    }
  );

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
    job.title ||
    "Job Posting";


  jobCompany.textContent =
    job.company ||
    "Company";


  jobLocation.textContent =
    job.location ||
    "Location not listed";


  jobDeadline.textContent =
    formatDate(
      job.deadline
    );


  document.title =
    `${job.title} | UC Careers`;

}


// ==========================================================
// Display Job
// ==========================================================

function displayJob(
  job
) {

  currentJob =
    job;


  renderJobSummary(
    job
  );


  renderJobInformation(
    job
  );


  renderSkillMatch(
    job
  );


  jobDetailsError.hidden =
    true;


  jobDetailsContent.hidden =
    false;

}


// ==========================================================
// Display Error
// ==========================================================

function displayError() {

  jobDetailsContent.hidden =
    true;


  jobDetailsError.hidden =
    false;

}


// ==========================================================
// Back Button
// ==========================================================

backButton.addEventListener(
  "click",
  () => {

    /*
      If the user came from another UC Careers
      page, return to that exact page.
    */

    if (
      document.referrer &&
      new URL(
        document.referrer
      ).origin ===
      window.location.origin
    ) {

      window.history.back();

      return;

    }


    /*
      Direct URL fallback.
    */

    window.location.href =
      "job-search.html";

  }
);


// ==========================================================
// Apply Button
// ==========================================================

applyButton.addEventListener(
  "click",
  () => {

    if (!currentJob) {
      return;
    }


    /*
      FUTURE:

      This will navigate directly to:

      job-application.html

      using the current job ID.

      Example:

      window.location.href =
        `job-application.html?jobId=${currentJob.id}`;
    */


    console.log(
      "Future application page:",
      currentJob.id
    );

  }
);


// ==========================================================
// Initialize Job Details
// ==========================================================

async function initializeJobDetails() {

  currentUser =
    getCurrentUser();


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
      (currentJob) =>
        currentJob.id ===
        jobId
    );


  if (!job) {

    displayError();

    return;

  }


  displayJob(
    job
  );

}


// ==========================================================
// Start
// ==========================================================

initializeJobDetails();