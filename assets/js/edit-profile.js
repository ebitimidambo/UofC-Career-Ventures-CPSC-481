// ==========================================================
// UC Careers - Edit Profile
// ==========================================================

import {
  getCurrentUser,
  saveCurrentUser
} from "./data-service.js?v=2";


// ==========================================================
// Catalogs
// ==========================================================

const CAREER_INTEREST_CATALOG = [
  "Software Engineering",
  "Backend Development",
  "Frontend Development",
  "Full Stack Development",
  "Data Analytics",
  "Data Engineering",
  "Machine Learning",
  "Cybersecurity",
  "DevOps",
  "Cloud Computing",
  "Mobile Development",
  "Quality Assurance",
  "UX Design",
  "UX Research",
  "Product Management",
  "Business Intelligence",
  "Technical Support"
];


const SKILL_CATALOG = [
  "Python",
  "JavaScript",
  "Java",
  "C++",
  "SQL",
  "HTML",
  "CSS",
  "React",
  "React Native",
  "Node.js",
  "Git",
  "Linux",
  "Figma",
  "Excel",
  "Power BI",
  "Testing",
  "Networking",
  "Communication",
  "Machine Learning",
  "Requirements",
  "Troubleshooting",
  "Windows",
  "ETL",
  "CI/CD",
  "Security"
];


const JOB_TYPE_OPTIONS = [
  "Full-time",
  "Part-time",
  "Internship",
  "Entry level"
];


// ==========================================================
// Page Elements
// ==========================================================

const profileTabs =
  document.querySelectorAll(
    "[data-profile-tab]"
  );

const profilePanels =
  document.querySelectorAll(
    "[data-profile-panel]"
  );

const cancelProfileButton =
  document.getElementById(
    "cancel-profile-button"
  );

const saveProfileButton =
  document.getElementById(
    "save-profile-button"
  );


// ==========================================================
// Education
// ==========================================================

const educationEntries =
  document.getElementById(
    "education-entries"
  );

const addEducationButton =
  document.getElementById(
    "add-education-button"
  );


// ==========================================================
// Work Experience
// ==========================================================

const workEntries =
  document.getElementById(
    "work-entries"
  );

const addWorkButton =
  document.getElementById(
    "add-work-button"
  );


// ==========================================================
// Career Interests
// ==========================================================

const interestSearch =
  document.getElementById(
    "interest-search"
  );

const interestSearchResults =
  document.getElementById(
    "interest-search-results"
  );

const selectedInterests =
  document.getElementById(
    "selected-interests"
  );

const preferredJobTypes =
  document.getElementById(
    "preferred-job-types"
  );


// ==========================================================
// Skills
// ==========================================================

const skillSearch =
  document.getElementById(
    "skill-search"
  );

const skillSearchResults =
  document.getElementById(
    "skill-search-results"
  );

const selectedSkills =
  document.getElementById(
    "selected-skills"
  );


// ==========================================================
// Documents
// ==========================================================

const profileResumeFile =
  document.getElementById(
    "profile-resume-file"
  );

const profileAttachmentFiles =
  document.getElementById(
    "profile-attachment-files"
  );

const currentResumeFile =
  document.getElementById(
    "current-resume-file"
  );

const currentAttachmentFiles =
  document.getElementById(
    "current-attachment-files"
  );


// ==========================================================
// Modal Elements
// ==========================================================

const saveProfileModal =
  document.getElementById(
    "save-profile-modal"
  );

const cancelProfileModal =
  document.getElementById(
    "cancel-profile-modal"
  );

const continueEditingSaveButton =
  document.getElementById(
    "continue-editing-save-button"
  );

const confirmSaveProfileButton =
  document.getElementById(
    "confirm-save-profile-button"
  );

const continueEditingCancelButton =
  document.getElementById(
    "continue-editing-cancel-button"
  );

const confirmCancelProfileButton =
  document.getElementById(
    "confirm-cancel-profile-button"
  );


// ==========================================================
// State
// ==========================================================

let currentUser =
  getCurrentUser();

let draftProfile =
  createDraftProfile(
    currentUser
  );

const originalDraftSnapshot =
  JSON.stringify(
    draftProfile
  );


// ==========================================================
// Utility
// ==========================================================

function createId(
  prefix
) {

  return (
    `${prefix}-${Date.now()}-` +
    `${Math.random().toString(16).slice(2)}`
  );

}


function deepClone(
  value
) {

  return JSON.parse(
    JSON.stringify(
      value
    )
  );

}


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


// ==========================================================
// Normalize Existing User Data
// ==========================================================

function normalizeEducation(
  user
) {

  if (
    Array.isArray(
      user?.education
    ) &&
    user.education.length > 0
  ) {

    return deepClone(
      user.education
    ).map(
      (entry) => ({
        id:
          entry.id ||
          createId(
            "education"
          ),

        school:
          entry.school ||
          entry.institution ||
          "",

        areaOfStudy:
          entry.areaOfStudy ||
          entry.program ||
          entry.major ||
          "",

        degree:
          entry.degree ||
          "",

        startDate:
          entry.startDate ||
          "",

        endDate:
          entry.endDate ||
          "",

        current:
          entry.current === true
      })
    );

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

        startDate:
          "",

        endDate:
          "",

        current:
          true
      }
    ];

  }


  return [];

}


function normalizeWorkExperience(
  user
) {

  const work =
    Array.isArray(
      user?.workExperience
    )
      ? user.workExperience
      : Array.isArray(
          user?.workExperiences
        )
        ? user.workExperiences
        : [];


  return deepClone(
    work
  ).map(
    (entry) => ({
      id:
        entry.id ||
        createId(
          "work"
        ),

      company:
        entry.company ||
        entry.employer ||
        "",

      jobTitle:
        entry.jobTitle ||
        entry.role ||
        entry.position ||
        "",

      description:
        entry.description ||
        entry.responsibilities ||
        "",

      startDate:
        entry.startDate ||
        "",

      endDate:
        entry.endDate ||
        "",

      current:
        entry.current === true
    })
  );

}


function normalizeCareerInterests(
  user
) {

  const interests =
    Array.isArray(
      user?.careerInterests
    )
      ? user.careerInterests
      : Array.isArray(
          user?.interests
        )
        ? user.interests
        : [];


  return [
    ...new Set(
      interests
        .map(
          (interest) =>
            String(interest).trim()
        )
        .filter(Boolean)
    )
  ];

}


function normalizeSkills(
  user
) {

  const skills =
    Array.isArray(
      user?.skills
    )
      ? user.skills
      : [];


  return [
    ...new Set(
      skills
        .map(
          (skill) =>
            String(skill).trim()
        )
        .filter(Boolean)
    )
  ];

}


function normalizePreferredJobTypes(
  user
) {

  if (
    Array.isArray(
      user?.preferredJobTypes
    )
  ) {

    return [
      ...new Set(
        user.preferredJobTypes
      )
    ];

  }


  if (
    typeof user?.preferredJobType ===
    "string" &&
    user.preferredJobType.trim()
  ) {

    return [
      user.preferredJobType.trim()
    ];

  }


  return [];

}


function normalizeProfileDocuments(
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
      documents.resume
        ? deepClone(
            documents.resume
          )
        : null,

    attachments:
      Array.isArray(
        documents.attachments
      )
        ? deepClone(
            documents.attachments
          )
        : []
  };

}


// ==========================================================
// Create Draft
// ==========================================================

function createDraftProfile(
  user
) {

  return {
    education:
      normalizeEducation(
        user
      ),

    workExperience:
      normalizeWorkExperience(
        user
      ),

    careerInterests:
      normalizeCareerInterests(
        user
      ),

    preferredJobTypes:
      normalizePreferredJobTypes(
        user
      ),

    skills:
      normalizeSkills(
        user
      ),

    profileDocuments:
      normalizeProfileDocuments(
        user
      )
  };

}


// ==========================================================
// Dirty State
// ==========================================================

function hasUnsavedChanges() {

  return (
    JSON.stringify(
      draftProfile
    ) !==
    originalDraftSnapshot
  );

}


// ==========================================================
// Tabs
// ==========================================================

function activateTab(
  tabName
) {

  profileTabs.forEach(
    (tab) => {

      tab.classList.toggle(
        "active",
        tab.dataset.profileTab ===
          tabName
      );

    }
  );


  profilePanels.forEach(
    (panel) => {

      const active =
        panel.dataset.profilePanel ===
        tabName;


      panel.hidden =
        !active;


      panel.classList.toggle(
        "active",
        active
      );

    }
  );

}


profileTabs.forEach(
  (tab) => {

    tab.addEventListener(
      "click",
      () => {

        activateTab(
          tab.dataset.profileTab
        );

      }
    );

  }
);


// ==========================================================
// Education Rendering
// ==========================================================

function renderEducationEntries() {

  educationEntries.innerHTML =
    "";


  if (
    draftProfile.education.length ===
    0
  ) {

    educationEntries.innerHTML = `

      <div class="no-editor-entries">
        Currently no entry
      </div>

    `;


    return;

  }


  draftProfile.education.forEach(
    (entry) => {

      const card =
        document.createElement(
          "article"
        );


      card.classList.add(
        "profile-entry-card"
      );


      card.innerHTML = `

        <button
          class="entry-remove-button"
          type="button"
          aria-label="Remove education entry"
        >
          ×
        </button>

        <div class="entry-fields-grid">

          <div class="entry-field entry-field-wide">

            <label>
              School:
            </label>

            <input
              type="text"
              data-field="school"
              value="${escapeHtml(entry.school)}"
              placeholder="University of Calgary"
            >

          </div>


          <div class="entry-field">

            <label>
              Area of Study:
            </label>

            <input
              type="text"
              data-field="areaOfStudy"
              value="${escapeHtml(entry.areaOfStudy)}"
              placeholder="Software Engineering"
            >

          </div>


          <div class="entry-field">

            <label>
              Degree:
            </label>

            <input
              type="text"
              data-field="degree"
              value="${escapeHtml(entry.degree)}"
              placeholder="Bachelor of Science"
            >

          </div>


          <div class="entry-field">

            <label>
              Start Date:
            </label>

            <input
              type="month"
              data-field="startDate"
              value="${escapeHtml(entry.startDate)}"
            >

          </div>


          <div class="entry-field entry-field-end-date">

            <label>
              End Date:
            </label>

            <div class="end-date-control-row">

              <input
                type="month"
                data-field="endDate"
                value="${escapeHtml(entry.endDate)}"
                ${entry.current ? "disabled" : ""}
              >

              <label class="current-entry-checkbox">

                <input
                  type="checkbox"
                  data-field="current"
                  ${entry.current ? "checked" : ""}
                >

                <span>
                  I currently study here
                </span>

              </label>

            </div>

          </div>

        </div>

      `;


      const removeButton =
        card.querySelector(
          ".entry-remove-button"
        );


      removeButton.addEventListener(
        "click",
        () => {

          draftProfile.education =
            draftProfile.education.filter(
              (candidate) =>
                candidate.id !==
                entry.id
            );


          renderEducationEntries();

        }
      );


      card
        .querySelectorAll(
          "[data-field]"
        )
        .forEach(
          (control) => {

            const eventName =
              control.type ===
              "checkbox"
                ? "change"
                : "input";


            control.addEventListener(
              eventName,
              () => {

                const field =
                  control.dataset.field;


                entry[field] =
                  control.type ===
                  "checkbox"
                    ? control.checked
                    : control.value;


                if (
                  field === "current"
                ) {

                  if (
                    entry.current
                  ) {

                    entry.endDate =
                      "";

                  }


                  renderEducationEntries();

                }

              }
            );

          }
        );


      educationEntries.appendChild(
        card
      );

    }
  );

}


// ==========================================================
// Add Education
// ==========================================================

addEducationButton.addEventListener(
  "click",
  () => {

    draftProfile.education.push(
      {
        id:
          createId(
            "education"
          ),

        school:
          "",

        areaOfStudy:
          "",

        degree:
          "",

        startDate:
          "",

        endDate:
          "",

        current:
          false
      }
    );


    renderEducationEntries();

  }
);


// ==========================================================
// Work Experience Rendering
// ==========================================================

function renderWorkEntries() {

  workEntries.innerHTML =
    "";


  if (
    draftProfile.workExperience.length ===
    0
  ) {

    workEntries.innerHTML = `

      <div class="no-editor-entries">
        Currently no entry
      </div>

    `;


    return;

  }


  draftProfile.workExperience.forEach(
    (entry) => {

      const card =
        document.createElement(
          "article"
        );


      card.classList.add(
        "profile-entry-card"
      );


      card.innerHTML = `

        <button
          class="entry-remove-button"
          type="button"
          aria-label="Remove work experience entry"
        >
          ×
        </button>

        <div class="entry-fields-grid">

          <div class="entry-field">

            <label>
              Company:
            </label>

            <input
              type="text"
              data-field="company"
              value="${escapeHtml(entry.company)}"
              placeholder="Company name"
            >

          </div>


          <div class="entry-field">

            <label>
              Job Title:
            </label>

            <input
              type="text"
              data-field="jobTitle"
              value="${escapeHtml(entry.jobTitle)}"
              placeholder="Job title"
            >

          </div>


          <div class="entry-field">

            <label>
              Start Date:
            </label>

            <input
              type="month"
              data-field="startDate"
              value="${escapeHtml(entry.startDate)}"
            >

          </div>


          <div class="entry-field entry-field-end-date">

            <label>
              End Date:
            </label>

            <div class="end-date-control-row">

              <input
                type="month"
                data-field="endDate"
                value="${escapeHtml(entry.endDate)}"
                ${entry.current ? "disabled" : ""}
              >

              <label class="current-entry-checkbox">

                <input
                  type="checkbox"
                  data-field="current"
                  ${entry.current ? "checked" : ""}
                >

                <span>
                  I currently work here
                </span>

              </label>

            </div>

          </div>


          <div class="entry-field entry-field-wide">

            <label>
              Description:
            </label>

            <textarea
              data-field="description"
              placeholder="My responsibilities during the role..."
            >${escapeHtml(entry.description)}</textarea>

          </div>

        </div>

      `;


      const removeButton =
        card.querySelector(
          ".entry-remove-button"
        );


      removeButton.addEventListener(
        "click",
        () => {

          draftProfile.workExperience =
            draftProfile.workExperience.filter(
              (candidate) =>
                candidate.id !==
                entry.id
            );


          renderWorkEntries();

        }
      );


      card
        .querySelectorAll(
          "[data-field]"
        )
        .forEach(
          (control) => {

            const eventName =
              control.type ===
              "checkbox"
                ? "change"
                : "input";


            control.addEventListener(
              eventName,
              () => {

                const field =
                  control.dataset.field;


                entry[field] =
                  control.type ===
                  "checkbox"
                    ? control.checked
                    : control.value;


                if (
                  field === "current"
                ) {

                  if (
                    entry.current
                  ) {

                    entry.endDate =
                      "";

                  }


                  renderWorkEntries();

                }

              }
            );

          }
        );


      workEntries.appendChild(
        card
      );

    }
  );

}


// ==========================================================
// Add Work Experience
// ==========================================================

addWorkButton.addEventListener(
  "click",
  () => {

    draftProfile.workExperience.push(
      {
        id:
          createId(
            "work"
          ),

        company:
          "",

        jobTitle:
          "",

        description:
          "",

        startDate:
          "",

        endDate:
          "",

        current:
          false
      }
    );


    renderWorkEntries();

  }
);


// ==========================================================
// Search Results
// ==========================================================

function renderSearchResults(
  container,
  catalog,
  query,
  selectedValues,
  addCallback
) {

  container.innerHTML =
    "";


  const normalizedQuery =
    query
      .trim()
      .toLowerCase();


  /*
    Keep the page clean until the user actually
    starts searching.
  */

  if (!normalizedQuery) {

    container.hidden =
      true;

    return;

  }


  const matches =
    catalog
      .filter(
        (item) =>
          !selectedValues.includes(
            item
          )
      )
      .filter(
        (item) =>
          item
            .toLowerCase()
            .includes(
              normalizedQuery
            )
      )
      .slice(
        0,
        6
      );


  container.hidden =
    false;


  if (
    matches.length ===
    0
  ) {

    const message =
      document.createElement(
        "div"
      );


    message.classList.add(
      "search-no-results"
    );


    message.textContent =
      "No matching results";


    container.appendChild(
      message
    );


    return;

  }


  matches.forEach(
    (item) => {

      const button =
        document.createElement(
          "button"
        );


      button.type =
        "button";


      button.classList.add(
        "search-result-button"
      );


      button.textContent =
        item;


      button.addEventListener(
        "click",
        () => {

          addCallback(
            item
          );

        }
      );


      container.appendChild(
        button
      );

    }
  );

}


// ==========================================================
// Selected Chips
// ==========================================================

function renderSelectedChips(
  container,
  values,
  removeCallback
) {

  container.innerHTML =
    "";


  if (
    values.length ===
    0
  ) {

    const message =
      document.createElement(
        "span"
      );


    message.classList.add(
      "no-current-file"
    );


    message.textContent =
      "Currently no entry";


    container.appendChild(
      message
    );


    return;

  }


  values.forEach(
    (value) => {

      const chip =
        document.createElement(
          "span"
        );


      chip.classList.add(
        "selected-chip"
      );


      const label =
        document.createElement(
          "span"
        );


      label.textContent =
        value;


      const removeButton =
        document.createElement(
          "button"
        );


      removeButton.type =
        "button";


      removeButton.classList.add(
        "remove-chip-button"
      );


      removeButton.textContent =
        "×";


      removeButton.setAttribute(
        "aria-label",
        `Remove ${value}`
      );


      removeButton.addEventListener(
        "click",
        () => {

          removeCallback(
            value
          );

        }
      );


      chip.append(
        label,
        removeButton
      );


      container.appendChild(
        chip
      );

    }
  );

}


// ==========================================================
// Career Interests
// ==========================================================

function renderInterests() {

  renderSelectedChips(
    selectedInterests,
    draftProfile.careerInterests,
    (value) => {

      draftProfile.careerInterests =
        draftProfile.careerInterests.filter(
          (interest) =>
            interest !==
            value
        );


      renderInterests();

    }
  );


  renderSearchResults(
    interestSearchResults,
    CAREER_INTEREST_CATALOG,
    interestSearch.value,
    draftProfile.careerInterests,
    (value) => {

      draftProfile.careerInterests.push(
        value
      );


      interestSearch.value =
        "";


      renderInterests();

    }
  );

}


interestSearch.addEventListener(
  "input",
  () => {

    renderInterests();

  }
);


interestSearch.addEventListener(
  "focus",
  () => {

    renderInterests();

  }
);


interestSearch.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key ===
      "Escape"
    ) {

      interestSearch.value =
        "";

      renderInterests();

      interestSearch.blur();

    }

  }
);


// ==========================================================
// Preferred Job Types
// ==========================================================

function renderPreferredJobTypes() {

  preferredJobTypes.innerHTML =
    "";


  JOB_TYPE_OPTIONS.forEach(
    (type) => {

      const option =
        document.createElement(
          "label"
        );


      option.classList.add(
        "job-type-checkbox-option"
      );


      const checkbox =
        document.createElement(
          "input"
        );


      checkbox.type =
        "checkbox";


      checkbox.checked =
        draftProfile.preferredJobTypes.includes(
          type
        );


      checkbox.setAttribute(
        "aria-label",
        type
      );


      const label =
        document.createElement(
          "span"
        );


      label.textContent =
        type;


      checkbox.addEventListener(
        "change",
        () => {

          if (
            checkbox.checked
          ) {

            if (
              !draftProfile.preferredJobTypes.includes(
                type
              )
            ) {

              draftProfile.preferredJobTypes.push(
                type
              );

            }

          } else {

            draftProfile.preferredJobTypes =
              draftProfile.preferredJobTypes.filter(
                (item) =>
                  item !==
                  type
              );

          }

        }
      );


      option.append(
        checkbox,
        label
      );


      preferredJobTypes.appendChild(
        option
      );

    }
  );

}


// ==========================================================
// Skills
// ==========================================================

function renderSkills() {

  renderSelectedChips(
    selectedSkills,
    draftProfile.skills,
    (value) => {

      draftProfile.skills =
        draftProfile.skills.filter(
          (skill) =>
            skill !==
            value
        );


      renderSkills();

    }
  );


  renderSearchResults(
    skillSearchResults,
    SKILL_CATALOG,
    skillSearch.value,
    draftProfile.skills,
    (value) => {

      draftProfile.skills.push(
        value
      );


      skillSearch.value =
        "";


      renderSkills();

    }
  );

}


skillSearch.addEventListener(
  "input",
  () => {

    renderSkills();

  }
);


skillSearch.addEventListener(
  "focus",
  () => {

    renderSkills();

  }
);


skillSearch.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key ===
      "Escape"
    ) {

      skillSearch.value =
        "";

      renderSkills();

      skillSearch.blur();

    }

  }
);


// ==========================================================
// File Metadata
// ==========================================================

function createFileMetadata(
  file
) {

  return {
    id:
      createId(
        "document"
      ),

    fileName:
      file.name,

    mimeType:
      file.type ||
      "",

    size:
      file.size ||
      0,

    updatedAt:
      new Date()
        .toISOString()
  };

}


// ==========================================================
// Render Resume
// ==========================================================

function renderResumeFile() {

  currentResumeFile.innerHTML =
    "";


  const resume =
    draftProfile
      .profileDocuments
      .resume;


  if (
    !resume?.fileName
  ) {

    currentResumeFile.innerHTML = `

      <p class="no-current-file">
        Currently no file
      </p>

    `;


    return;

  }


  const row =
    document.createElement(
      "div"
    );


  row.classList.add(
    "current-file-row"
  );


  const name =
    document.createElement(
      "span"
    );


  name.classList.add(
    "current-file-name"
  );


  name.textContent =
    resume.fileName;


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
    `Remove ${resume.fileName}`
  );


  removeButton.addEventListener(
    "click",
    () => {

      draftProfile
        .profileDocuments
        .resume =
          null;


      renderResumeFile();

    }
  );


  row.append(
    name,
    removeButton
  );


  currentResumeFile.appendChild(
    row
  );

}


// ==========================================================
// Resume Upload
// ==========================================================

profileResumeFile.addEventListener(
  "change",
  () => {

    const file =
      profileResumeFile.files?.[0];


    if (!file) {

      return;

    }


    draftProfile
      .profileDocuments
      .resume =
        createFileMetadata(
          file
        );


    profileResumeFile.value =
      "";


    renderResumeFile();

  }
);


// ==========================================================
// Render Attachments
// ==========================================================

function renderAttachmentFiles() {

  currentAttachmentFiles.innerHTML =
    "";


  const attachments =
    draftProfile
      .profileDocuments
      .attachments;


  if (
    attachments.length ===
    0
  ) {

    currentAttachmentFiles.innerHTML = `

      <p class="no-current-file">
        Currently no file
      </p>

    `;


    return;

  }


  attachments.forEach(
    (attachment) => {

      const row =
        document.createElement(
          "div"
        );


      row.classList.add(
        "current-file-row"
      );


      const name =
        document.createElement(
          "span"
        );


      name.classList.add(
        "current-file-name"
      );


      name.textContent =
        attachment.fileName;


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
        `Remove ${attachment.fileName}`
      );


      removeButton.addEventListener(
        "click",
        () => {

          draftProfile
            .profileDocuments
            .attachments =
              draftProfile
                .profileDocuments
                .attachments
                .filter(
                  (candidate) =>
                    candidate.id !==
                    attachment.id
                );


          renderAttachmentFiles();

        }
      );


      row.append(
        name,
        removeButton
      );


      currentAttachmentFiles.appendChild(
        row
      );

    }
  );

}


// ==========================================================
// Attachment Upload
// ==========================================================

profileAttachmentFiles.addEventListener(
  "change",
  () => {

    const files =
      Array.from(
        profileAttachmentFiles.files ||
        []
      );


    files.forEach(
      (file) => {

        const alreadyExists =
          draftProfile
            .profileDocuments
            .attachments
            .some(
              (attachment) =>
                attachment.fileName ===
                file.name
            );


        if (!alreadyExists) {

          draftProfile
            .profileDocuments
            .attachments
            .push(
              createFileMetadata(
                file
              )
            );

        }

      }
    );


    profileAttachmentFiles.value =
      "";


    renderAttachmentFiles();

  }
);


// ==========================================================
// Clean Entries Before Save
// ==========================================================

function cleanEducationEntries() {

  return draftProfile.education.filter(
    (entry) =>
      Boolean(
        entry.school.trim() ||
        entry.areaOfStudy.trim() ||
        entry.degree.trim() ||
        entry.startDate ||
        entry.endDate
      )
  );

}


function cleanWorkEntries() {

  return draftProfile.workExperience.filter(
    (entry) =>
      Boolean(
        entry.company.trim() ||
        entry.jobTitle.trim() ||
        entry.description.trim() ||
        entry.startDate ||
        entry.endDate
      )
  );

}


// ==========================================================
// Save Profile
// ==========================================================

function persistProfileChanges() {

  if (!currentUser) {

    return;

  }


  const cleanedEducation =
    cleanEducationEntries();


  const cleanedWork =
    cleanWorkEntries();


  const updatedUser = {
    ...currentUser,

    education:
      cleanedEducation,

    workExperience:
      cleanedWork,

    careerInterests:
      [
        ...draftProfile
          .careerInterests
      ],

    /*
      Keep interests synchronized because
      existing recommendation code may already
      read this older field.
    */

    interests:
      [
        ...draftProfile
          .careerInterests
      ],

    preferredJobTypes:
      [
        ...draftProfile
          .preferredJobTypes
      ],

    skills:
      [
        ...draftProfile
          .skills
      ],

    profileDocuments:
      deepClone(
        draftProfile
          .profileDocuments
      )
  };


  saveCurrentUser(
    updatedUser
  );


  sessionStorage.setItem(
    "ucCareersProfileUpdated",
    "true"
  );


  window.location.replace(
    "profile.html"
  );

}


// ==========================================================
// Save Modal
// ==========================================================

function openSaveModal() {

  saveProfileModal.hidden =
    false;


  document.body.style.overflow =
    "hidden";


  continueEditingSaveButton.focus();

}


function closeSaveModal() {

  saveProfileModal.hidden =
    true;


  document.body.style.overflow =
    "";

}


// ==========================================================
// Cancel Modal
// ==========================================================

function openCancelModal() {

  cancelProfileModal.hidden =
    false;


  document.body.style.overflow =
    "hidden";


  continueEditingCancelButton.focus();

}


function closeCancelModal() {

  cancelProfileModal.hidden =
    true;


  document.body.style.overflow =
    "";

}


// ==========================================================
// Page Actions
// ==========================================================

saveProfileButton.addEventListener(
  "click",
  () => {

    openSaveModal();

  }
);


cancelProfileButton.addEventListener(
  "click",
  () => {

    if (
      hasUnsavedChanges()
    ) {

      openCancelModal();

      return;

    }


    window.location.href =
      "profile.html";

  }
);


continueEditingSaveButton.addEventListener(
  "click",
  () => {

    closeSaveModal();

  }
);


confirmSaveProfileButton.addEventListener(
  "click",
  () => {

    persistProfileChanges();

  }
);


continueEditingCancelButton.addEventListener(
  "click",
  () => {

    closeCancelModal();

  }
);


confirmCancelProfileButton.addEventListener(
  "click",
  () => {

    window.location.replace(
      "profile.html"
    );

  }
);


// ==========================================================
// Click Outside Modals
// ==========================================================

saveProfileModal.addEventListener(
  "click",
  (event) => {

    if (
      event.target ===
      saveProfileModal
    ) {

      closeSaveModal();

    }

  }
);


cancelProfileModal.addEventListener(
  "click",
  (event) => {

    if (
      event.target ===
      cancelProfileModal
    ) {

      closeCancelModal();

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
      !saveProfileModal.hidden
    ) {

      closeSaveModal();

      return;

    }


    if (
      !cancelProfileModal.hidden
    ) {

      closeCancelModal();

    }

  }
);


// ==========================================================
// Initial Render
// ==========================================================

renderEducationEntries();


renderWorkEntries();


renderInterests();


renderPreferredJobTypes();


renderSkills();


renderResumeFile();


renderAttachmentFiles();
