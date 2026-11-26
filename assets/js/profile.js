// ==========================================================
// UC Careers - My Career Profile
// ==========================================================

import {
  getCurrentUser,
  saveCurrentUser
} from "./data-service.js?v=2";


// ==========================================================
// Configuration
// ==========================================================

const NAME_CHANGE_LIMIT = 3;

const MAX_INTERESTS_ON_OVERVIEW = 4;

const MAX_SKILLS_ON_OVERVIEW = 5;


// ==========================================================
// Page Elements
// ==========================================================

const profileSuccessMessage =
  document.getElementById(
    "profile-success-message"
  );

const editProfileButton =
  document.getElementById(
    "edit-profile-button"
  );

const editNameButton =
  document.getElementById(
    "edit-name-button"
  );

const profileAvatarInitials =
  document.getElementById(
    "profile-avatar-initials"
  );

const profileName =
  document.getElementById(
    "profile-name"
  );

const profileSubtitle =
  document.getElementById(
    "profile-subtitle"
  );

const educationSummary =
  document.getElementById(
    "education-summary"
  );

const workSummary =
  document.getElementById(
    "work-summary"
  );

const interestsSummary =
  document.getElementById(
    "interests-summary"
  );

const skillsSummary =
  document.getElementById(
    "skills-summary"
  );

const documentsSummary =
  document.getElementById(
    "documents-summary"
  );


// ==========================================================
// Edit Name Modal Elements
// ==========================================================

const editNameModal =
  document.getElementById(
    "edit-name-modal"
  );

const firstNameInput =
  document.getElementById(
    "first-name-input"
  );

const lastNameInput =
  document.getElementById(
    "last-name-input"
  );

const nameAttemptMessage =
  document.getElementById(
    "name-attempt-message"
  );

const cancelNameEditButton =
  document.getElementById(
    "cancel-name-edit-button"
  );

const saveNameEditButton =
  document.getElementById(
    "save-name-edit-button"
  );


// ==========================================================
// Confirm Name Modal Elements
// ==========================================================

const confirmNameModal =
  document.getElementById(
    "confirm-name-modal"
  );

const confirmNameAttemptMessage =
  document.getElementById(
    "confirm-name-attempt-message"
  );

const backToNameEditButton =
  document.getElementById(
    "back-to-name-edit-button"
  );

const confirmNameChangeButton =
  document.getElementById(
    "confirm-name-change-button"
  );


// ==========================================================
// Page State
// ==========================================================

let currentUser =
  getCurrentUser();


// ==========================================================
// Utility
// ==========================================================

function escapeHtml(
  value
) {

  const element =
    document.createElement(
      "div"
    );

  element.textContent =
    String(
      value ?? ""
    );

  return element.innerHTML;

}


function createId(
  prefix
) {

  return (
    `${prefix}-${Date.now()}-` +
    `${Math.random().toString(16).slice(2)}`
  );

}


// ==========================================================
// Name Helpers
// ==========================================================

function getNameParts(
  user
) {

  const firstName =
    String(
      user?.firstName ||
      ""
    ).trim();

  const lastName =
    String(
      user?.lastName ||
      ""
    ).trim();


  if (
    firstName ||
    lastName
  ) {

    return {
      firstName,
      lastName
    };

  }


  const fullName =
    String(
      user?.name ||
      ""
    )
      .trim()
      .split(/\s+/)
      .filter(Boolean);


  return {
    firstName:
      fullName[0] ||
      "",

    lastName:
      fullName
        .slice(1)
        .join(" ")
  };

}


function getProfileInitials(
  user
) {

  const {
    firstName,
    lastName
  } =
    getNameParts(
      user
    );


  const firstInitial =
    firstName
      .charAt(0)
      .toUpperCase();

  const lastInitial =
    lastName
      .charAt(0)
      .toUpperCase();


  return (
    `${firstInitial}${lastInitial}` ||
    "UC"
  );

}


function getFullName(
  user
) {

  const {
    firstName,
    lastName
  } =
    getNameParts(
      user
    );


  return (
    [firstName, lastName]
      .filter(Boolean)
      .join(" ") ||
    user?.username ||
    "Student"
  );

}


function getNameChangeCount() {

  const count =
    Number(
      currentUser?.nameChangeCount ||
      0
    );


  return Number.isFinite(count)
    ? count
    : 0;

}


function getRemainingNameChanges() {

  return Math.max(
    0,
    NAME_CHANGE_LIMIT -
    getNameChangeCount()
  );

}


// ==========================================================
// Education Helpers
// ==========================================================

function getEducationEntries(
  user
) {

  if (
    Array.isArray(
      user?.education
    ) &&
    user.education.length > 0
  ) {

    return user.education;

  }


  if (
    user?.program ||
    user?.major
  ) {

    return [
      {
        id:
          createId(
            "education"
          ),


        school:
            user.school ||
            user.university ||
            "University of Calgary",

        areaOfStudy:
            user.program ||
            user.major ||
            "",

        degree:
            user.degree ||
            "Bachelor of Science",

        year:
            user.year ||
            user.yearOfStudy ||
            "",

        startDate:
            "2024-09",

        endDate:
            "",

        current:
            true
        }
    ];

  }


  return [];

}


function getWorkEntries(
  user
) {

  if (
    Array.isArray(
      user?.workExperience
    )
  ) {

    return user.workExperience;

  }


  if (
    Array.isArray(
      user?.workExperiences
    )
  ) {

    return user.workExperiences;

  }


  return [];

}


// ==========================================================
// Interest / Skill Helpers
// ==========================================================

function getCareerInterests(
  user
) {

  if (
    Array.isArray(
      user?.careerInterests
    )
  ) {

    return user.careerInterests;

  }


  if (
    Array.isArray(
      user?.interests
    )
  ) {

    return user.interests;

  }


  return [];

}


function getSkills(
  user
) {

  return Array.isArray(
    user?.skills
  )
    ? user.skills
    : [];

}


// ==========================================================
// Documents Helper
// ==========================================================

function getProfileDocuments(
  user
) {

  const documents =
    user?.profileDocuments;


  if (
    !documents ||
    typeof documents !==
      "object" ||
    Array.isArray(documents)
  ) {

    return {
      resume: null,
      attachments: []
    };

  }


  return {
    resume:
      documents.resume ||
      null,

    attachments:
      Array.isArray(
        documents.attachments
      )
        ? documents.attachments
        : []
  };

}


// ==========================================================
// Date Formatting
// ==========================================================

function formatMonthYear(
  value
) {

  if (!value) {

    return "";

  }


  const parts =
    String(value)
      .slice(
        0,
        10
      )
      .split("-")
      .map(Number);


  if (
    parts.length < 2 ||
    Number.isNaN(parts[0]) ||
    Number.isNaN(parts[1])
  ) {

    return value;

  }


  const date =
    new Date(
      parts[0],
      parts[1] - 1,
      1
    );


  return date.toLocaleDateString(
    "en-CA",
    {
      month: "long",
      year: "numeric"
    }
  );

}


function getDateRange(
  entry
) {

  const start =
    formatMonthYear(
      entry.startDate
    );


  const end =
    entry.current === true
      ? "Present"
      : formatMonthYear(
          entry.endDate
        );


  if (
    start &&
    end
  ) {

    return `${start} - ${end}`;

  }


  return (
    start ||
    end ||
    ""
  );

}


// ==========================================================
// Most Recent Entry
// ==========================================================

function getEntrySortValue(
  entry
) {

  if (
    entry.current === true
  ) {

    return Number.MAX_SAFE_INTEGER;

  }


  const date =
    entry.endDate ||
    entry.startDate ||
    "";


  const timestamp =
    new Date(
      date
    ).getTime();


  return Number.isNaN(timestamp)
    ? 0
    : timestamp;

}


function getMostRecentEntry(
  entries
) {

  if (
    entries.length === 0
  ) {

    return null;

  }


  return [...entries]
    .sort(
      (a, b) =>
        getEntrySortValue(b) -
        getEntrySortValue(a)
    )[0];

}


// ==========================================================
// Empty State
// ==========================================================

function renderEmptyEntry(
  container
) {

  container.innerHTML = `

    <div class="profile-empty-entry">
      Currently no entry
    </div>

  `;

}


// ==========================================================
// Education Summary
// ==========================================================

function renderEducationSummary() {

  const entry =
    getMostRecentEntry(
      getEducationEntries(
        currentUser
      )
    );


  if (!entry) {

    renderEmptyEntry(
      educationSummary
    );

    return;

  }


  const school =
    entry.school ||
    entry.institution ||
    "University of Calgary";


  const areaOfStudy =
    entry.areaOfStudy ||
    entry.program ||
    entry.major ||
    "";


  const degree =
    entry.degree ||
    "";


  const detail =
    [degree, areaOfStudy]
      .filter(Boolean)
      .join(" - ");


  const dateRange =
    getDateRange(
      entry
    );


  educationSummary.innerHTML = `

    <p class="profile-summary-title">
      ${escapeHtml(school)}
    </p>

    ${
      detail
        ? `
          <p class="profile-summary-secondary">
            ${escapeHtml(detail)}
          </p>
        `
        : ""
    }

    ${
      dateRange
        ? `
          <p class="profile-summary-date">
            ${escapeHtml(dateRange)}
          </p>
        `
        : ""
    }

  `;

}


// ==========================================================
// Work Summary
// ==========================================================

function renderWorkSummary() {

  const entry =
    getMostRecentEntry(
      getWorkEntries(
        currentUser
      )
    );


  if (!entry) {

    renderEmptyEntry(
      workSummary
    );

    return;

  }


  const jobTitle =
    entry.jobTitle ||
    entry.role ||
    entry.position ||
    "Work Experience";


  const company =
    entry.company ||
    entry.employer ||
    "";


  const dateRange =
    getDateRange(
      entry
    );


  workSummary.innerHTML = `

    <p class="profile-summary-title">
      ${escapeHtml(jobTitle)}
    </p>

    ${
      company
        ? `
          <p class="profile-summary-secondary">
            ${escapeHtml(company)}
          </p>
        `
        : ""
    }

    ${
      dateRange
        ? `
          <p class="profile-summary-date">
            ${escapeHtml(dateRange)}
          </p>
        `
        : ""
    }

  `;

}


// ==========================================================
// Chip Summary
// ==========================================================

function renderChipSummary(
  container,
  values,
  maximum
) {

  const items =
    values
      .map(
        (value) =>
          String(value).trim()
      )
      .filter(Boolean)
      .slice(
        0,
        maximum
      );


  if (
    items.length === 0
  ) {

    renderEmptyEntry(
      container
    );

    return;

  }


  container.innerHTML = `

    <div class="profile-chip-list">

      ${items
        .map(
          (item) => `
            <span class="profile-chip">
              ${escapeHtml(item)}
            </span>
          `
        )
        .join("")}

    </div>

  `;

}


// ==========================================================
// Documents Summary
// ==========================================================

function renderDocumentsSummary() {

  const documents =
    getProfileDocuments(
      currentUser
    );


  const hasResume =
    Boolean(
      documents.resume?.fileName
    );


  const attachmentCount =
    documents.attachments.filter(
      (attachment) =>
        attachment?.fileName
    ).length;


  if (
    !hasResume &&
    attachmentCount === 0
  ) {

    renderEmptyEntry(
      documentsSummary
    );

    return;

  }


  const rows = [];


  if (hasResume) {

    rows.push(`

      <div class="document-summary-row">

        <strong>
          Resume:
        </strong>

        <span>
          ${escapeHtml(
            documents.resume.fileName
          )}
        </span>

      </div>

    `);

  }


  if (
    attachmentCount > 0
  ) {

    rows.push(`

      <div class="document-summary-row">

        <strong>
          Attachments:
        </strong>

        <span>
          ${attachmentCount}
          ${
            attachmentCount === 1
              ? "file"
              : "files"
          }
        </span>

      </div>

    `);

  }


  documentsSummary.innerHTML = `

    <div class="document-summary-list">
      ${rows.join("")}
    </div>

  `;

}


// ==========================================================
// Identity
// ==========================================================

function renderIdentity() {

  profileAvatarInitials.textContent =
    getProfileInitials(
      currentUser
    );


  profileName.textContent =
    getFullName(
      currentUser
    );


  const year =
    currentUser?.year ||
    currentUser?.yearOfStudy ||
    "";


  const major =
    currentUser?.major ||
    currentUser?.program ||
    "";


  const profileDetails = [];


  if (year) {

    profileDetails.push(
      `Year of Study: ${year}`
    );

  }


  if (major) {

    profileDetails.push(
      `Major: ${major}`
    );

  }


  profileSubtitle.textContent =
    profileDetails.join("\n");


  profileSubtitle.style.whiteSpace =
    "pre-line";

}


// ==========================================================
// Render Profile
// ==========================================================

function renderProfile() {

  currentUser =
    getCurrentUser();


  if (!currentUser) {

    return;

  }


  renderIdentity();


  renderEducationSummary();


  renderWorkSummary();


  renderChipSummary(
    interestsSummary,
    getCareerInterests(
      currentUser
    ),
    MAX_INTERESTS_ON_OVERVIEW
  );


  renderChipSummary(
    skillsSummary,
    getSkills(
      currentUser
    ),
    MAX_SKILLS_ON_OVERVIEW
  );


  renderDocumentsSummary();

}


// ==========================================================
// Success Message
// ==========================================================

function showSuccessMessage() {

  profileSuccessMessage.hidden =
    false;


  window.setTimeout(
    () => {

      profileSuccessMessage.hidden =
        true;

    },
    5000
  );

}


function checkForSavedProfileMessage() {

  if (
    sessionStorage.getItem(
      "ucCareersProfileUpdated"
    ) === "true"
  ) {

    sessionStorage.removeItem(
      "ucCareersProfileUpdated"
    );


    showSuccessMessage();

  }

}


// ==========================================================
// Open Name Edit
// ==========================================================

function openNameEditModal() {

  const {
    firstName,
    lastName
  } =
    getNameParts(
      currentUser
    );


  firstNameInput.value =
    firstName;


  lastNameInput.value =
    lastName;


  const remaining =
    getRemainingNameChanges();


  nameAttemptMessage.textContent =
    remaining > 0
      ? `You have ${remaining} name change${remaining === 1 ? "" : "s"} remaining.`
      : "You have no name changes remaining.";


  saveNameEditButton.disabled =
    remaining <= 0;


  editNameModal.hidden =
    false;


  document.body.style.overflow =
    "hidden";


  firstNameInput.focus();

}


// ==========================================================
// Close Name Edit
// ==========================================================

function closeNameEditModal() {

  editNameModal.hidden =
    true;


  document.body.style.overflow =
    "";

}


// ==========================================================
// Open Name Confirmation
// ==========================================================

function openNameConfirmation() {

  const firstName =
    firstNameInput.value.trim();


  const lastName =
    lastNameInput.value.trim();


  if (
    !firstName ||
    !lastName
  ) {

    nameAttemptMessage.textContent =
      "Please enter both your first and last name.";

    return;

  }


  const remaining =
    getRemainingNameChanges();


  if (
    remaining <= 0
  ) {

    nameAttemptMessage.textContent =
      "You have no name changes remaining.";

    return;

  }


  const remainingAfter =
    remaining - 1;


  confirmNameAttemptMessage.textContent =
    `You will have ${remainingAfter} name change${remainingAfter === 1 ? "" : "s"} remaining after this update.`;


  editNameModal.hidden =
    true;


  confirmNameModal.hidden =
    false;


  confirmNameChangeButton.focus();

}


// ==========================================================
// Confirm Name Change
// ==========================================================

function confirmNameChange() {

  const firstName =
    firstNameInput.value.trim();


  const lastName =
    lastNameInput.value.trim();


  if (
    !firstName ||
    !lastName ||
    !currentUser
  ) {

    return;

  }


  const newCount =
    getNameChangeCount() + 1;


  currentUser = {
    ...currentUser,

    firstName,

    lastName,

    name:
      `${firstName} ${lastName}`,

    nameChangeCount:
      newCount
  };


  saveCurrentUser(
    currentUser
  );


  confirmNameModal.hidden =
    true;


  document.body.style.overflow =
    "";


  renderProfile();


  showSuccessMessage();

}


// ==========================================================
// Events
// ==========================================================

editProfileButton.addEventListener(
  "click",
  () => {

    window.location.href =
      "edit-profile.html";

  }
);


editNameButton.addEventListener(
  "click",
  () => {

    openNameEditModal();

  }
);


cancelNameEditButton.addEventListener(
  "click",
  () => {

    closeNameEditModal();

  }
);


saveNameEditButton.addEventListener(
  "click",
  () => {

    openNameConfirmation();

  }
);


backToNameEditButton.addEventListener(
  "click",
  () => {

    confirmNameModal.hidden =
      true;


    editNameModal.hidden =
      false;


    firstNameInput.focus();

  }
);


confirmNameChangeButton.addEventListener(
  "click",
  () => {

    confirmNameChange();

  }
);


editNameModal.addEventListener(
  "click",
  (event) => {

    if (
      event.target ===
      editNameModal
    ) {

      closeNameEditModal();

    }

  }
);


confirmNameModal.addEventListener(
  "click",
  (event) => {

    if (
      event.target ===
      confirmNameModal
    ) {

      confirmNameModal.hidden =
        true;


      editNameModal.hidden =
        false;

    }

  }
);


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
      !confirmNameModal.hidden
    ) {

      confirmNameModal.hidden =
        true;


      editNameModal.hidden =
        false;


      return;

    }


    if (
      !editNameModal.hidden
    ) {

      closeNameEditModal();

    }

  }
);


// ==========================================================
// Initialize
// ==========================================================

renderProfile();


checkForSavedProfileMessage();