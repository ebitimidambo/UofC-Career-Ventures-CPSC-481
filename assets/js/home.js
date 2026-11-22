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
// Page Elements
// ==========================================================

const welcomeName =
  document.getElementById("welcome-name");

const jobList =
  document.getElementById("job-list");


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

    welcomeName.textContent =
      firstName;

  }

}


// ==========================================================
// Load Jobs
// ==========================================================

async function loadJobs() {

  try {

    const response =
      await fetch("../data/jobs.json");


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

  return String(text)
    .trim()
    .toLowerCase();

}


// ==========================================================
// Find Matching Skills
// ==========================================================

function getMatchingSkills(job, user) {

  const userSkills =
    Array.isArray(user?.skills)
      ? user.skills.map(normalizeText)
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

function isJobRecommended(job, user) {

  const userSkills =
    Array.isArray(user?.skills)
      ? user.skills
      : [];


  /*
    If the user has skills in their profile,
    calculate recommendations dynamically.
  */

  if (userSkills.length > 0) {

    const matchingSkills =
      getMatchingSkills(
        job,
        user
      );


    return (
      matchingSkills.length > 0
    );

  }


  /*
    New or incomplete profile:
    use the default value from jobs.json.
  */

  return (
    job.recommended === true
  );

}


// ==========================================================
// Determine Eligibility
// ==========================================================

function isUserEligible(job, user) {

  /*
    If the user has entered experience information,
    calculate eligibility dynamically.
  */

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


  /*
    New or incomplete profile:
    use the default value from jobs.json.
  */

  return (
    job.eligible === true
  );

}


// ==========================================================
// Calculate Suggested Jobs
// ==========================================================

function getSuggestedJobs(jobs, user) {

  return jobs

    .map((job) => {

      const matchingSkills =
        getMatchingSkills(
          job,
          user
        );


      return {
        ...job,

        matchingSkills:
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

    })


    /*
      Only show jobs that are both
      recommended and eligible.
    */

    .filter(
      (job) =>
        job.recommended === true &&
        job.eligible === true
    )


    /*
      Stronger skill matches appear first.

      If two jobs have the same number of
      matching skills, the earlier deadline
      appears first.
    */

    .sort((a, b) => {

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

    });

}


// ==========================================================
// Display Suggested Jobs
// ==========================================================

function displaySuggestedJobs(jobs) {

  if (!jobList) {
    return;
  }


  jobList.innerHTML = "";


  if (jobs.length === 0) {

    const message =
      document.createElement("p");


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


  jobs.forEach((job) => {

    createJobCard(job);

  });

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
    document.createElement("div");


  jobCard.classList.add(
    "job-card"
  );


  jobCard.innerHTML = `

    <div class="job-logo">
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
        src="../assets/svg/savedJobsIcon.svg"
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


  if (currentlySaved) {

    removeSavedJob(
      job.id
    );


    button.setAttribute(
      "aria-pressed",
      "false"
    );


    button.setAttribute(
      "aria-label",
      `Save ${job.title}`
    );

  } else {

    saveJob(
      job.id
    );


    button.setAttribute(
      "aria-pressed",
      "true"
    );


    button.setAttribute(
      "aria-label",
      `Remove ${job.title} from saved jobs`
    );

  }

}


// ==========================================================
// Initialize Home Page
// ==========================================================

async function initializeHomePage() {

  /*
    User data now comes entirely through
    the shared localStorage data layer.
  */

  const user =
    getCurrentUser();


  displayWelcomeMessage(
    user
  );


  const jobs =
    await loadJobs();


  const suggestedJobs =
    getSuggestedJobs(
      jobs,
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