// ==========================================================
// UC Careers - Home Page
// ==========================================================

import {
  getCurrentUser,
  getSavedJobIds,
  saveJob,
  removeSavedJob
} from "./data-service.js?v=2";


// ==========================================================
// Bookmark Icons
// ==========================================================

const BOOKMARK_OUTLINE_ICON =
  "../assets/svg/bookmarkOutlineIcon.svg";

const BOOKMARK_FILLED_ICON =
  "../assets/svg/bookmarkFilledIcon.svg";


// ==========================================================
// Page Elements
// ==========================================================

const welcomeName =
  document.getElementById("welcome-name");

const jobList =
  document.getElementById("job-list");

const upcomingDeadlinesCount =
  document.getElementById("upcoming-deadlines-count");

const pendingApplicationsCount =
  document.getElementById("pending-applications-count");


// ==========================================================
// Page State
// ==========================================================

let allJobs = [];


// ==========================================================
// Welcome Message
// ==========================================================

function displayWelcomeMessage(user) {

  if (!welcomeName || !user) {
    return;
  }

  const firstName =
    user.firstName ||
    user.name?.split(" ")[0] ||
    user.username;

  if (firstName) {
    welcomeName.textContent = firstName;
  }

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

function normalizeText(text) {

  return String(text || "")
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
// Find Matching Skills
// ==========================================================

function getMatchingSkills(
  job,
  user
) {

  const userSkills =
    Array.isArray(user?.skills)
      ? user.skills.map(
          normalizeText
        )
      : [];

  const jobSkills =
    Array.isArray(job.skills)
      ? job.skills
      : [];

  return jobSkills.filter(
    (skill) =>
      userSkills.includes(
        normalizeText(skill)
      )
  );

}


// ==========================================================
// Determine Recommendation
// ==========================================================

function isJobRecommended(
  job,
  user
) {

  const userSkills =
    Array.isArray(user?.skills)
      ? user.skills
      : [];

  if (
    userSkills.length > 0
  ) {

    const matchingSkills =
      getMatchingSkills(
        job,
        user
      );

    return (
      matchingSkills.length > 0
    );

  }

  return (
    job.recommended === true
  );

}


// ==========================================================
// Determine Eligibility
// ==========================================================

function isUserEligible(
  job,
  user
) {

  if (
    user?.experienceYears !== undefined &&
    user?.experienceYears !== null
  ) {

    const userExperience =
      Number(
        user.experienceYears
      );

    const requiredExperience =
      Number(
        job.experienceYears ?? 0
      );

    return (
      userExperience >=
      requiredExperience
    );

  }

  return (
    job.eligible === true
  );

}


// ==========================================================
// Calculate Suggested Jobs
// ==========================================================

function getSuggestedJobs(
  jobs,
  user
) {

  return jobs
    .map(
      (job) => {

        const matchingSkills =
          getMatchingSkills(
            job,
            user
          );

        return {
          ...job,
          matchingSkills,
          matchCount:
            matchingSkills.length,
          recommended:
            isJobRecommended(
              job,
              user
            ),
          eligible:
            isUserEligible(
              job,
              user
            )
        };

      }
    )
    .filter(
      (job) =>
        job.recommended === true &&
        job.eligible === true
    )
    .sort(
      (a, b) => {

        if (
          b.matchCount !==
          a.matchCount
        ) {

          return (
            b.matchCount -
            a.matchCount
          );

        }

        return (
          new Date(a.deadline) -
          new Date(b.deadline)
        );

      }
    );

}


// ==========================================================
// Parse Job Deadline as a Local Date
// ==========================================================

function parseDeadlineDate(
  value
) {

  if (!value) {
    return null;
  }

  const parts =
    String(value)
      .slice(0, 10)
      .split("-")
      .map(Number);

  if (
    parts.length !== 3 ||
    parts.some(
      (part) =>
        Number.isNaN(part)
    )
  ) {
    return null;
  }

  const [
    year,
    month,
    day
  ] = parts;

  const date =
    new Date(
      year,
      month - 1,
      day
    );

  return Number.isNaN(
    date.getTime()
  )
    ? null
    : date;

}


// ==========================================================
// Days Until Deadline
// ==========================================================

function getDaysUntilDeadline(
  deadlineValue
) {

  const deadline =
    parseDeadlineDate(
      deadlineValue
    );

  if (!deadline) {
    return null;
  }

  const now =
    new Date();

  const today =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

  const millisecondsPerDay =
    1000 * 60 * 60 * 24;

  const deadlineUtc =
    Date.UTC(
      deadline.getFullYear(),
      deadline.getMonth(),
      deadline.getDate()
    );

  const todayUtc =
    Date.UTC(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

  return (
    deadlineUtc -
    todayUtc
  ) /
  millisecondsPerDay;

}


// ==========================================================
// Quick Link Counts
// ==========================================================

function updateQuickLinkCounts() {

  const savedJobIds =
    getSavedJobIds();

  const savedJobs =
    allJobs.filter(
      (job) =>
        savedJobIds.includes(
          job.id
        )
    );

  const pendingCount =
    savedJobs.length;

  const upcomingCount =
    savedJobs.filter(
      (job) => {

        const daysUntilDeadline =
          getDaysUntilDeadline(
            job.deadline
          );

        return (
          daysUntilDeadline !== null &&
          daysUntilDeadline >= 0 &&
          daysUntilDeadline <= 7
        );

      }
    ).length;

  if (
    pendingApplicationsCount
  ) {

    pendingApplicationsCount.textContent =
      String(pendingCount);

  }

  if (
    upcomingDeadlinesCount
  ) {

    upcomingDeadlinesCount.textContent =
      String(upcomingCount);

  }

}


// ==========================================================
// Display Suggested Jobs
// ==========================================================

function displaySuggestedJobs(jobs) {

  if (!jobList) {
    return;
  }

  jobList.innerHTML = "";

  if (
    jobs.length === 0
  ) {

    const message =
      document.createElement(
        "p"
      );

    message.classList.add(
      "no-suggested-jobs"
    );

    message.textContent =
      "No suggested jobs are currently available.";

    jobList.appendChild(
      message
    );

    return;

  }

  jobs.forEach(
    (job) => {

      createJobCard(
        job
      );

    }
  );

}


// ==========================================================
// Bookmark Appearance
// ==========================================================

function updateBookmarkButton(
  button,
  job,
  isSaved
) {

  const image =
    button.querySelector("img");

  button.setAttribute(
    "aria-pressed",
    String(isSaved)
  );

  button.setAttribute(
    "aria-label",
    isSaved
      ? `Remove ${job.title} from saved jobs`
      : `Save ${job.title}`
  );

  if (image) {

    image.src =
      isSaved
        ? BOOKMARK_FILLED_ICON
        : BOOKMARK_OUTLINE_ICON;

  }

}


// ==========================================================
// Create Job Card
// ==========================================================

function createJobCard(job) {

  const savedJobIds =
    getSavedJobIds();

  const isSaved =
    savedJobIds.includes(
      job.id
    );

  const jobCard =
    document.createElement(
      "div"
    );

  jobCard.classList.add(
    "job-card"
  );

  jobCard.innerHTML = `

    <div
      class="job-logo"
      aria-label="${job.company || "Company"}"
    >
      <span class="job-logo-initials">
        ${getCompanyInitials(job.company)}
      </span>
    </div>

    <div class="job-information">
      <h3>
        ${job.title}
      </h3>

      <p>
        ${job.company}
      </p>

      <p>
        ${job.location}
      </p>
    </div>

    <button
      class="bookmark-button"
      type="button"
      data-job-id="${job.id}"
      aria-label="${
        isSaved
          ? `Remove ${job.title} from saved jobs`
          : `Save ${job.title}`
      }"
      aria-pressed="${isSaved}"
    >
      <img
        src="${
          isSaved
            ? BOOKMARK_FILLED_ICON
            : BOOKMARK_OUTLINE_ICON
        }"
        alt=""
      >
    </button>

    <button
      class="view-job-button"
      type="button"
      data-job-id="${job.id}"
    >
      View
    </button>

  `;

  const bookmarkButton =
    jobCard.querySelector(
      ".bookmark-button"
    );

  bookmarkButton.addEventListener(
    "click",
    () => {

      toggleSavedJob(
        job,
        bookmarkButton
      );

    }
  );

  jobList.appendChild(
    jobCard
  );

}


// ==========================================================
// Save / Unsave Job
// ==========================================================

function toggleSavedJob(
  job,
  button
) {

  const savedJobIds =
    getSavedJobIds();

  const currentlySaved =
    savedJobIds.includes(
      job.id
    );

  if (
    currentlySaved
  ) {

    removeSavedJob(
      job.id
    );

    updateBookmarkButton(
      button,
      job,
      false
    );

  } else {

    saveJob(
      job.id
    );

    updateBookmarkButton(
      button,
      job,
      true
    );

  }

  updateQuickLinkCounts();

}


// ==========================================================
// Initialize Home Page
// ==========================================================

async function initializeHomePage() {

  const user =
    getCurrentUser();

  displayWelcomeMessage(
    user
  );

  allJobs =
    await loadJobs();

  updateQuickLinkCounts();

  const suggestedJobs =
    getSuggestedJobs(
      allJobs,
      user
    );

  displaySuggestedJobs(
    suggestedJobs
  );

}


// ==========================================================
// Start
// ==========================================================

initializeHomePage();
