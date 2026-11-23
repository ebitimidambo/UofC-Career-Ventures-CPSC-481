// ==========================================================
// UC Careers - Job Search
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

const searchForm =
  document.getElementById("search-form");

const searchInput =
  document.getElementById("job-search");

const filterForm =
  document.getElementById("filter-form");

const locationFilter =
  document.getElementById("location-filter");

const jobTypeFilter =
  document.getElementById("job-type-filter");

const workTermFilter =
  document.getElementById("work-term-filter");

const deadlineFilter =
  document.getElementById("deadline-filter");

const salaryFilter =
  document.getElementById("salary-filter");

const eligibilityFilter =
  document.getElementById("eligibility-filter");

const experienceFilter =
  document.getElementById("experience-filter");

const filterChips =
  document.getElementById("filter-chips");

const resetFiltersButton =
  document.getElementById("reset-filters");

const resultCount =
  document.getElementById("result-count");

const jobResults =
  document.getElementById("job-search-results");


// ==========================================================
// Page State
// ==========================================================

let allJobs = [];

let currentUser =
  getCurrentUser();

let activeSearchTerm = "";

let hasSearched = false;

let activeFilters = {
  location: "",
  jobType: "",
  workTerm: "",
  deadline: "",
  salary: "",
  eligibility: false,
  requiresExperience: false
};


// ==========================================================
// Load Jobs
// ==========================================================

async function loadJobs() {

  try {

    const response =
      await fetch("../data/jobs.json?v=3");

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

  return String(value || "")
    .trim()
    .toLowerCase();

}


// ==========================================================
// Company Initials
// ==========================================================

function getCompanyInitials(companyName) {

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


  // Two or more words:
  // Calgary Tech Solutions -> CT

  if (words.length >= 2) {

    return (
      words[0][0] +
      words[1][0]
    ).toUpperCase();

  }


  // One word:
  // AltaWorks -> AL

  if (words.length === 1) {

    return words[0]
      .slice(0, 2)
      .toUpperCase();

  }


  return "UC";

}


// ==========================================================
// Search Score
// ==========================================================

function getSearchScore(job) {

  const query =
    normalizeText(
      activeSearchTerm
    );

  if (!query) {
    return 0;
  }


  const searchTerms =
    query
      .split(/\s+/)
      .filter(Boolean);


  const title =
    normalizeText(job.title);

  const company =
    normalizeText(job.company);

  const location =
    normalizeText(job.location);

  const type =
    normalizeText(job.type);

  const workTerm =
    normalizeText(job.workTerm);

  const description =
    normalizeText(job.description);


  const searchableText = [
    title,
    company,
    location,
    type,
    workTerm,
    description
  ].join(" ");


  let score = 0;


  // Exact title

  if (
    title === query
  ) {

    score += 100;

  }


  // Full phrase in title

  else if (
    title.includes(query)
  ) {

    score += 70;

  }


  // Full phrase elsewhere

  else if (
    searchableText.includes(query)
  ) {

    score += 50;

  }


  // Individual words

  searchTerms.forEach(
    (term) => {

      if (
        title.includes(term)
      ) {

        score += 20;

      }


      if (
        company.includes(term)
      ) {

        score += 10;

      }


      if (
        location.includes(term)
      ) {

        score += 8;

      }


      if (
        type.includes(term)
      ) {

        score += 6;

      }


      if (
        workTerm.includes(term)
      ) {

        score += 6;

      }


      if (
        description.includes(term)
      ) {

        score += 4;

      }

    }
  );


  return score;

}


// ==========================================================
// Search Matching
// ==========================================================

function matchesSearch(job) {

  if (!hasSearched) {
    return false;
  }

  return (
    getSearchScore(job) > 0
  );

}


// ==========================================================
// Location Filter
// ==========================================================

function matchesLocation(job) {

  if (!activeFilters.location) {
    return true;
  }

  return normalizeText(
    job.location
  ).includes(
    normalizeText(
      activeFilters.location
    )
  );

}


// ==========================================================
// Job Type Filter
// ==========================================================

function matchesJobType(job) {

  if (!activeFilters.jobType) {
    return true;
  }

  return (
    normalizeText(job.type) ===
    normalizeText(
      activeFilters.jobType
    )
  );

}


// ==========================================================
// Work Term Filter
// ==========================================================

function matchesWorkTerm(job) {

  if (!activeFilters.workTerm) {
    return true;
  }

  return (
    normalizeText(job.workTerm) ===
    normalizeText(
      activeFilters.workTerm
    )
  );

}


// ==========================================================
// Deadline Filter
// ==========================================================

function matchesDeadline(job) {

  if (!activeFilters.deadline) {
    return true;
  }

  if (!job.deadline) {
    return false;
  }

  return (
    new Date(job.deadline) <=
    new Date(activeFilters.deadline)
  );

}


// ==========================================================
// Salary
// ==========================================================

function getJobSalary(job) {

  if (
    job.salary !== undefined &&
    job.salary !== null
  ) {

    return Number(job.salary);

  }

  return null;

}


// ==========================================================
// Salary Filter
// ==========================================================

function matchesSalary(job) {

  if (!activeFilters.salary) {
    return true;
  }

  const jobSalary =
    getJobSalary(job);

  if (jobSalary === null) {
    return false;
  }

  return (
    jobSalary >=
    Number(activeFilters.salary)
  );

}


// ==========================================================
// Eligibility Scan
// ==========================================================

function passesEligibilityScan(job) {

  if (!activeFilters.eligibility) {
    return true;
  }


  const userSkills =
    Array.isArray(currentUser?.skills)
      ? currentUser.skills.map(
          normalizeText
        )
      : [];


  if (userSkills.length === 0) {

    return (
      job.eligible === true
    );

  }


  const requiredSkills =
    Array.isArray(job.skills)
      ? job.skills
      : [];


  return requiredSkills.every(
    (skill) =>
      userSkills.includes(
        normalizeText(skill)
      )
  );

}


// ==========================================================
// Requires Experience Filter
// ==========================================================

function matchesExperience(job) {

  if (
    !activeFilters.requiresExperience
  ) {

    return true;

  }

  return (
    Number(
      job.experienceYears || 0
    ) > 0
  );

}


// ==========================================================
// Get Filtered Jobs
// ==========================================================

function getFilteredJobs() {

  if (!hasSearched) {
    return [];
  }


  const filteredJobs =
    allJobs.filter(
      (job) =>

        matchesSearch(job) &&

        matchesLocation(job) &&

        matchesJobType(job) &&

        matchesWorkTerm(job) &&

        matchesDeadline(job) &&

        matchesSalary(job) &&

        passesEligibilityScan(job) &&

        matchesExperience(job)
    );


  filteredJobs.sort(
    (a, b) => {

      const scoreDifference =
        getSearchScore(b) -
        getSearchScore(a);


      if (
        scoreDifference !== 0
      ) {

        return scoreDifference;

      }


      return (
        new Date(a.deadline) -
        new Date(b.deadline)
      );

    }
  );


  return filteredJobs;

}


// ==========================================================
// Initial Search State
// ==========================================================

function displayInitialSearchState() {

  resultCount.hidden = true;

  jobResults.innerHTML = "";


  const message =
    document.createElement("p");


  message.classList.add(
    "no-results"
  );


  message.textContent =
    "Search for jobs to see results.";


  jobResults.appendChild(
    message
  );

}


// ==========================================================
// Display Jobs
// ==========================================================

function displayJobs() {

  if (!hasSearched) {

    displayInitialSearchState();

    return;

  }


  const filteredJobs =
    getFilteredJobs();


  resultCount.hidden = false;


  displayResultCount(
    filteredJobs.length
  );


  jobResults.innerHTML = "";


  if (
    filteredJobs.length === 0
  ) {

    const message =
      document.createElement("p");


    message.classList.add(
      "no-results"
    );


    message.textContent =
      "No jobs found. Try a different search or adjust your filters.";


    jobResults.appendChild(
      message
    );


    return;

  }


  filteredJobs.forEach(
    (job) => {

      createJobCard(job);

    }
  );


  jobResults.scrollTop = 0;

}


// ==========================================================
// Result Count
// ==========================================================

function displayResultCount(count) {

  resultCount.textContent =
    count === 1
      ? "1 job found"
      : `${count} jobs found`;

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
      "article"
    );


  jobCard.classList.add(
    "job-card"
  );


  // --------------------------------------------------------
  // Company Initials
  // --------------------------------------------------------

  const logo =
    document.createElement(
      "div"
    );


  logo.classList.add(
    "company-logo"
  );


  logo.setAttribute(
    "aria-label",
    job.company || "Company"
  );


  const initials =
    document.createElement(
      "span"
    );


  initials.classList.add(
    "company-logo-initials"
  );


  initials.textContent =
    getCompanyInitials(
      job.company
    );


  logo.appendChild(
    initials
  );


  // --------------------------------------------------------
  // Details
  // --------------------------------------------------------

  const details =
    document.createElement(
      "div"
    );


  details.classList.add(
    "job-details"
  );


  const title =
    document.createElement(
      "h3"
    );


  title.textContent =
    job.title;


  const company =
    document.createElement(
      "p"
    );


  company.classList.add(
    "company-name"
  );


  company.textContent =
    job.company;


  const location =
    document.createElement(
      "p"
    );


  location.classList.add(
    "location"
  );


  location.textContent =
    job.location;


  details.append(
    title,
    company,
    location
  );


  // --------------------------------------------------------
  // Job Tags
  // --------------------------------------------------------

  const tags =
    document.createElement(
      "div"
    );


  tags.classList.add(
    "job-tags"
  );


  if (job.type) {

    addJobTag(
      tags,
      job.type
    );

  }


  const salary =
    getJobSalary(job);


  if (salary !== null) {

    addJobTag(
      tags,
      `$ ${salary}/hr`
    );

  }


  if (job.location) {

    addJobTag(
      tags,
      job.location
    );

  }


  if (job.workTerm) {

    addJobTag(
      tags,
      job.workTerm
    );

  }


  details.appendChild(
    tags
  );


  // --------------------------------------------------------
  // Actions
  // --------------------------------------------------------

  const actions =
    document.createElement(
      "div"
    );


  actions.classList.add(
    "job-actions"
  );


  // --------------------------------------------------------
  // Bookmark
  // --------------------------------------------------------

  const saveButton =
    document.createElement(
      "button"
    );


  saveButton.classList.add(
    "save-job"
  );


  saveButton.type =
    "button";


  saveButton.dataset.jobId =
    job.id;


  saveButton.innerHTML = `

    <img
      src="${
        isSaved
          ? BOOKMARK_FILLED_ICON
          : BOOKMARK_OUTLINE_ICON
      }"
      alt=""
    >

  `;


  updateBookmarkButton(
    saveButton,
    job,
    isSaved
  );


  saveButton.addEventListener(
    "click",
    () => {

      toggleSavedJob(
        job,
        saveButton
      );

    }
  );


  // --------------------------------------------------------
  // View
  // --------------------------------------------------------

  const viewButton =
    document.createElement(
      "button"
    );


  viewButton.classList.add(
    "pill-button",
    "view-button"
  );


  viewButton.type =
    "button";


  viewButton.dataset.jobId =
    job.id;


  viewButton.textContent =
    "View";


  actions.append(
    saveButton,
    viewButton
  );


  // --------------------------------------------------------
  // Complete Card
  // --------------------------------------------------------

  jobCard.append(
    logo,
    details,
    actions
  );


  jobResults.appendChild(
    jobCard
  );

}


// ==========================================================
// Add Job Tag
// ==========================================================

function addJobTag(
  container,
  text
) {

  const tag =
    document.createElement(
      "span"
    );


  tag.classList.add(
    "job-tag"
  );


  tag.textContent =
    text;


  container.appendChild(
    tag
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


  if (currentlySaved) {

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

}


// ==========================================================
// Search
// ==========================================================

searchForm.addEventListener(
  "submit",
  (event) => {

    event.preventDefault();


    activeSearchTerm =
      searchInput.value.trim();


    hasSearched =
      activeSearchTerm.length > 0;


    displayJobs();

  }
);


// ==========================================================
// Clear Search
// ==========================================================

searchInput.addEventListener(
  "input",
  () => {

    if (
      searchInput.value.trim() === ""
    ) {

      activeSearchTerm = "";

      hasSearched = false;

      displayJobs();

    }

  }
);


// ==========================================================
// Apply Filters
// ==========================================================

filterForm.addEventListener(
  "submit",
  (event) => {

    event.preventDefault();


    activeFilters = {

      location:
        locationFilter.value.trim(),

      jobType:
        jobTypeFilter.value,

      workTerm:
        workTermFilter.value,

      deadline:
        deadlineFilter.value,

      salary:
        salaryFilter.value,

      eligibility:
        eligibilityFilter.checked,

      requiresExperience:
        experienceFilter.checked

    };


    displayFilterChips();

    displayJobs();

  }
);


// ==========================================================
// Display Applied Filter Chips
// ==========================================================

function displayFilterChips() {

  filterChips.innerHTML = "";


  if (activeFilters.location) {

    createFilterChip(
      "location",
      activeFilters.location
    );

  }


  if (activeFilters.jobType) {

    createFilterChip(
      "jobType",
      activeFilters.jobType
    );

  }


  if (activeFilters.workTerm) {

    createFilterChip(
      "workTerm",
      activeFilters.workTerm
    );

  }


  if (activeFilters.deadline) {

    createFilterChip(
      "deadline",
      `Deadline by ${activeFilters.deadline}`
    );

  }


  if (activeFilters.salary) {

    createFilterChip(
      "salary",
      `Above $ ${activeFilters.salary}/hr`
    );

  }


  if (activeFilters.eligibility) {

    createFilterChip(
      "eligibility",
      "Eligibility Scan"
    );

  }


  if (
    activeFilters.requiresExperience
  ) {

    createFilterChip(
      "requiresExperience",
      "Requires Experience"
    );

  }

}


// ==========================================================
// Create Filter Chip
// ==========================================================

function createFilterChip(
  filterName,
  label
) {

  const chip =
    document.createElement(
      "button"
    );


  chip.type =
    "button";


  chip.classList.add(
    "filter-chip"
  );


  chip.innerHTML = `

    <span>
      ${label}
    </span>

    <span
      class="remove-filter"
      aria-hidden="true"
    >
      ×
    </span>

  `;


  chip.setAttribute(
    "aria-label",
    `Remove ${label} filter`
  );


  chip.addEventListener(
    "click",
    () => {

      clearIndividualFilter(
        filterName
      );

    }
  );


  filterChips.appendChild(
    chip
  );

}


// ==========================================================
// Remove Individual Filter
// ==========================================================

function clearIndividualFilter(
  filterName
) {

  switch (filterName) {

    case "location":

      activeFilters.location = "";

      locationFilter.value = "";

      break;


    case "jobType":

      activeFilters.jobType = "";

      jobTypeFilter.value = "";

      break;


    case "workTerm":

      activeFilters.workTerm = "";

      workTermFilter.value = "";

      break;


    case "deadline":

      activeFilters.deadline = "";

      deadlineFilter.value = "";

      break;


    case "salary":

      activeFilters.salary = "";

      salaryFilter.value = "";

      break;


    case "eligibility":

      activeFilters.eligibility = false;

      eligibilityFilter.checked = false;

      break;


    case "requiresExperience":

      activeFilters.requiresExperience = false;

      experienceFilter.checked = false;

      break;

  }


  displayFilterChips();

  displayJobs();

}


// ==========================================================
// Reset Filters
// ==========================================================

resetFiltersButton.addEventListener(
  "click",
  () => {

    filterForm.reset();


    activeFilters = {

      location: "",

      jobType: "",

      workTerm: "",

      deadline: "",

      salary: "",

      eligibility: false,

      requiresExperience: false

    };


    displayFilterChips();

    displayJobs();

  }
);


// ==========================================================
// Initialize Job Search
// ==========================================================

async function initializeJobSearch() {

  currentUser =
    getCurrentUser();


  allJobs =
    await loadJobs();


  displayFilterChips();

  displayInitialSearchState();

}


// ==========================================================
// Start
// ==========================================================

initializeJobSearch();