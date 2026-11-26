// ==========================================================
// UC Careers - Comparison Tool
// ==========================================================

import {
  getSavedJobIds
} from "./data-service.js?v=2";


// ==========================================================
// Page Elements
// ==========================================================

const jobSelectionView =
  document.getElementById(
    "job-selection-view"
  );

const comparisonResultsView =
  document.getElementById(
    "comparison-results-view"
  );

const jobOneSelect =
  document.getElementById(
    "job-one-select"
  );

const jobTwoSelect =
  document.getElementById(
    "job-two-select"
  );

const jobThreeField =
  document.getElementById(
    "job-three-field"
  );

const jobThreeSelect =
  document.getElementById(
    "job-three-select"
  );

const addJobButton =
  document.getElementById(
    "add-job-button"
  );

const compareJobsButton =
  document.getElementById(
    "compare-jobs-button"
  );

const selectionMessage =
  document.getElementById(
    "selection-message"
  );

const editJobsButton =
  document.getElementById(
    "edit-jobs-button"
  );

const comparisonTable =
  document.getElementById(
    "comparison-table"
  );

const resultJobOneTitle =
  document.getElementById(
    "result-job-one-title"
  );

const resultJobOneCompany =
  document.getElementById(
    "result-job-one-company"
  );

const resultJobTwoTitle =
  document.getElementById(
    "result-job-two-title"
  );

const resultJobTwoCompany =
  document.getElementById(
    "result-job-two-company"
  );

const resultJobThreeColumn =
  document.getElementById(
    "result-job-three-column"
  );

const resultJobThreeTitle =
  document.getElementById(
    "result-job-three-title"
  );

const resultJobThreeCompany =
  document.getElementById(
    "result-job-three-company"
  );

const comparisonTableBody =
  document.getElementById(
    "comparison-table-body"
  );

const aiSummaryText =
  document.getElementById(
    "ai-summary-text"
  );

const askAnythingButton =
  document.getElementById(
    "ask-anything-button"
  );

const aiChatSection =
  document.getElementById(
    "ai-chat-section"
  );

const closeChatButton =
  document.getElementById(
    "close-chat-button"
  );

const chatMessages =
  document.getElementById(
    "chat-messages"
  );

const chatForm =
  document.getElementById(
    "chat-form"
  );

const chatInput =
  document.getElementById(
    "chat-input"
  );


// ==========================================================
// State
// ==========================================================

let allJobs = [];
let savedJobs = [];

let thirdJobEnabled = false;

let selectedJobs = [];


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
// Saved Jobs
// ==========================================================

function getSavedJobs() {

  const savedJobIds =
    getSavedJobIds();


  return allJobs.filter(
    (job) =>
      savedJobIds.includes(
        job.id
      )
  );

}


// ==========================================================
// Active Job Selects
// ==========================================================

function getActiveJobSelects() {

  const selects = [
    jobOneSelect,
    jobTwoSelect
  ];


  if (
    thirdJobEnabled
  ) {

    selects.push(
      jobThreeSelect
    );

  }


  return selects;

}


// ==========================================================
// Populate Dropdowns
// ==========================================================

function populateJobSelects() {

  const activeSelects =
    getActiveJobSelects();


  const selectedValues =
    new Map(
      activeSelects.map(
        (select) => [
          select,
          select.value
        ]
      )
    );


  activeSelects.forEach(
    (select) => {

      const selectedValue =
        selectedValues.get(
          select
        ) || "";


      const unavailableValues =
        activeSelects
          .filter(
            (otherSelect) =>
              otherSelect !== select
          )
          .map(
            (otherSelect) =>
              selectedValues.get(
                otherSelect
              )
          )
          .filter(Boolean);


      renderSelectOptions(
        select,
        selectedValue,
        unavailableValues
      );

    }
  );


  updateSelectionControls();

}


function renderSelectOptions(
  select,
  selectedValue,
  unavailableValues
) {

  select.innerHTML = "";


  const placeholder =
    document.createElement(
      "option"
    );


  placeholder.value = "";

  placeholder.textContent =
    "Select a saved job";


  select.appendChild(
    placeholder
  );


  savedJobs.forEach(
    (job) => {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        job.id;


      option.textContent =
        `${job.title} - ${job.company}`;


      option.disabled =
        unavailableValues.includes(
          job.id
        );


      select.appendChild(
        option
      );

    }
  );


  if (
    savedJobs.some(
      (job) =>
        job.id ===
        selectedValue
    )
  ) {

    select.value =
      selectedValue;

  }

}


// ==========================================================
// Selection Validation
// ==========================================================

function updateSelectionControls() {

  const activeSelects =
    getActiveJobSelects();


  const selectedIds =
    activeSelects
      .map(
        (select) =>
          select.value
      )
      .filter(Boolean);


  if (
    savedJobs.length < 2
  ) {

    compareJobsButton.disabled =
      true;


    selectionMessage.textContent =
      "Save at least two jobs before using the comparison tool.";


  } else {

    const allActiveJobsSelected =
      selectedIds.length ===
      activeSelects.length;


    const allSelectionsUnique =
      new Set(
        selectedIds
      ).size ===
      selectedIds.length;


    compareJobsButton.disabled =
      !(
        allActiveJobsSelected &&
        allSelectionsUnique
      );


    selectionMessage.textContent =
      "";

  }


  addJobButton.disabled =
    !thirdJobEnabled &&
    savedJobs.length < 3;

}


jobOneSelect.addEventListener(
  "change",
  populateJobSelects
);


jobTwoSelect.addEventListener(
  "change",
  populateJobSelects
);


jobThreeSelect.addEventListener(
  "change",
  populateJobSelects
);


// ==========================================================
// Add / Remove Third Job
// ==========================================================

addJobButton.addEventListener(
  "click",
  () => {

    if (
      !thirdJobEnabled
    ) {

      if (
        savedJobs.length < 3
      ) {
        return;
      }


      thirdJobEnabled =
        true;


      jobThreeField.hidden =
        false;


      addJobButton.textContent =
        "− Remove Job";


    } else {

      thirdJobEnabled =
        false;


      jobThreeSelect.value =
        "";


      jobThreeField.hidden =
        true;


      addJobButton.textContent =
        "+ Add Job";

    }


    populateJobSelects();

  }
);


// ==========================================================
// Formatting Helpers
// ==========================================================

function hasUsefulValue(value) {

  if (
    value === null ||
    value === undefined
  ) {
    return false;
  }


  if (
    typeof value === "string"
  ) {

    return (
      value.trim().length > 0
    );

  }


  if (
    Array.isArray(value)
  ) {

    return (
      value.length > 0
    );

  }


  return true;

}


function formatSalary(job) {

  if (
    !hasUsefulValue(
      job.salary
    )
  ) {

    return "Not Provided";

  }


  if (
    typeof job.salary ===
    "number"
  ) {

    return `$${job.salary}/hour`;

  }


  return String(
    job.salary
  );

}


function formatSchedule(job) {

  if (
    !hasUsefulValue(
      job.schedule
    )
  ) {

    return "Not Provided";

  }


  return job.schedule;

}


function formatContractLength(job) {

  const months =
    Number(
      job.durationMonths
    );


  if (
    !Number.isFinite(months) ||
    months <= 0
  ) {

    return "Not Provided";

  }


  return (
    months === 1
      ? "1 month"
      : `${months} months`
  );

}


function formatResponsibilities(job) {

  const responsibilities =
    job.responsibilities;


  if (
    !hasUsefulValue(
      responsibilities
    )
  ) {

    return "Not Provided";

  }


  return responsibilities;

}


function formatExperience(job) {

  if (
    !hasUsefulValue(
      job.experienceYears
    )
  ) {

    return "Not Provided";

  }


  const years =
    Number(
      job.experienceYears
    );


  if (
    !Number.isFinite(years)
  ) {

    return String(
      job.experienceYears
    );

  }


  if (
    years === 0
  ) {

    return "No previous experience required";

  }


  return (
    years === 1
      ? "1 year"
      : `${years} years`
  );

}


function formatDate(dateValue) {

  if (
    !hasUsefulValue(
      dateValue
    )
  ) {

    return "Not Provided";

  }


  const date =
    new Date(
      `${String(dateValue).slice(0, 10)}T12:00:00`
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return String(
      dateValue
    );

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
// Comparison Criteria
// ==========================================================

function getComparisonRows() {

  return [
    {
      label: "Salary",
      getValue: formatSalary,

      highlight: {
        mode: "max",
        label: "Highest",

        getComparableValue:
          (job) => {

            if (
              !hasUsefulValue(
                job.salary
              )
            ) {
              return null;
            }

            const salary =
              Number(
                job.salary
              );

            return Number.isFinite(
              salary
            )
              ? salary
              : null;

          }
      }
    },
    {
      label: "Work Schedule",
      getValue: formatSchedule
    },
    {
      label: "Contract Length",
      getValue: formatContractLength
    },
    {
      label: "Responsibilities",
      getValue: formatResponsibilities
    },
    {
      label: "Experience Requirements",
      getValue: formatExperience,

      highlight: {
        mode: "min",
        label: "Lowest requirement",

        getComparableValue:
          (job) => {

            if (
              !hasUsefulValue(
                job.experienceYears
              )
            ) {
              return null;
            }

            const years =
              Number(
                job.experienceYears
              );

            return Number.isFinite(
              years
            )
              ? years
              : null;

          }
      }
    },
    {
      label: "Application Deadline",

      getValue:
        (job) =>
          formatDate(
            job.deadline
          ),

      highlight: {
        mode: "max",
        label: "Latest deadline",

        getComparableValue:
          (job) => {

            if (
              !hasUsefulValue(
                job.deadline
              )
            ) {
              return null;
            }

            const deadline =
              new Date(
                `${String(job.deadline).slice(0, 10)}T12:00:00`
              );

            return Number.isNaN(
              deadline.getTime()
            )
              ? null
              : deadline.getTime();

          }
      }
    }
  ];

}


// ==========================================================
// Selected Jobs
// ==========================================================

function getSelectedJobsFromInputs() {

  const selectedIds =
    getActiveJobSelects()
      .map(
        (select) =>
          select.value
      );


  return selectedIds.map(
    (jobId) =>
      savedJobs.find(
        (job) =>
          job.id ===
          jobId
      ) || null
  );

}


// ==========================================================
// Render Comparison Table
// ==========================================================

function renderComparisonTable() {

  const [
    firstJob,
    secondJob,
    thirdJob
  ] = selectedJobs;


  resultJobOneTitle.textContent =
    firstJob.title;

  resultJobOneCompany.textContent =
    firstJob.company;


  resultJobTwoTitle.textContent =
    secondJob.title;

  resultJobTwoCompany.textContent =
    secondJob.company;


  const hasThirdJob =
    Boolean(
      thirdJob
    );


  resultJobThreeColumn.hidden =
    !hasThirdJob;


  comparisonTable.classList.toggle(
    "three-jobs",
    hasThirdJob
  );


  if (
    hasThirdJob
  ) {

    resultJobThreeTitle.textContent =
      thirdJob.title;

    resultJobThreeCompany.textContent =
      thirdJob.company;

  } else {

    resultJobThreeTitle.textContent =
      "";

    resultJobThreeCompany.textContent =
      "";

  }


  comparisonTableBody.innerHTML =
    "";


  getComparisonRows().forEach(
    (row) => {

      const tableRow =
        document.createElement(
          "tr"
        );


      const labelCell =
        document.createElement(
          "td"
        );


      labelCell.classList.add(
        "comparison-row-label"
      );


      labelCell.textContent =
        row.label;


      tableRow.appendChild(
        labelCell
      );


      const highlightedIndexes =
        getHighlightedJobIndexes(
          row
        );


      selectedJobs.forEach(
        (job, index) => {

          const value =
            row.getValue(
              job
            );


          const highlightLabel =
            highlightedIndexes.has(
              index
            ) &&
            row.highlight
              ? row.highlight.label
              : "";


          tableRow.appendChild(
            createComparisonValueCell(
              value,
              highlightLabel
            )
          );

        }
      );


      comparisonTableBody.appendChild(
        tableRow
      );

    }
  );

}


function getHighlightedJobIndexes(
  row
) {

  if (
    !row.highlight
  ) {
    return new Set();
  }


  const comparableEntries =
    selectedJobs
      .map(
        (job, index) => ({
          index,
          value:
            row.highlight
              .getComparableValue(
                job
              )
        })
      )
      .filter(
        (entry) =>
          entry.value !== null &&
          entry.value !== undefined &&
          Number.isFinite(
            entry.value
          )
      );


  if (
    comparableEntries.length < 2
  ) {
    return new Set();
  }


  const values =
    comparableEntries.map(
      (entry) =>
        entry.value
    );


  const allComparableValuesEqual =
    values.every(
      (value) =>
        value ===
        values[0]
    );


  if (
    allComparableValuesEqual
  ) {
    return new Set();
  }


  const bestValue =
    row.highlight.mode === "min"
      ? Math.min(
          ...values
        )
      : Math.max(
          ...values
        );


  return new Set(
    comparableEntries
      .filter(
        (entry) =>
          entry.value ===
          bestValue
      )
      .map(
        (entry) =>
          entry.index
      )
  );

}


function createComparisonValueCell(
  value,
  highlightLabel = ""
) {

  const cell =
    document.createElement(
      "td"
    );


  cell.classList.add(
    "comparison-value"
  );


  if (
    value === "Not Provided"
  ) {

    cell.classList.add(
      "not-provided"
    );

  }


  if (
    highlightLabel &&
    value !== "Not Provided"
  ) {

    cell.classList.add(
      "best-value"
    );

  }


  if (
    Array.isArray(value)
  ) {

    const list =
      document.createElement(
        "ul"
      );


    value.forEach(
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


    cell.appendChild(
      list
    );

  } else {

    const valueText =
      document.createElement(
        "span"
      );


    valueText.classList.add(
      "comparison-value-text"
    );


    valueText.textContent =
      String(value);


    cell.appendChild(
      valueText
    );

  }


  if (
    highlightLabel &&
    value !== "Not Provided"
  ) {

    const label =
      document.createElement(
        "span"
      );


    label.classList.add(
      "best-value-label"
    );


    label.textContent =
      highlightLabel;


    cell.appendChild(
      label
    );

  }


  return cell;

}


// ==========================================================
// Comparison Helpers
// ==========================================================

function getNumericValues(
  property,
  validator =
    (value) =>
      Number.isFinite(value)
) {

  const entries =
    selectedJobs.map(
      (job) => ({
        job,
        hasValue:
          hasUsefulValue(
            job[property]
          ),
        value:
          Number(
            job[property]
          )
      })
    );


  if (
    entries.some(
      (entry) =>
        !entry.hasValue ||
        !validator(
          entry.value
        )
    )
  ) {

    return null;

  }


  return entries;

}


function allValuesEqual(
  entries
) {

  if (
    !entries ||
    entries.length === 0
  ) {
    return false;
  }


  return entries.every(
    (entry) =>
      entry.value ===
      entries[0].value
  );

}


function getJobsWithExtremeValue(
  entries,
  mode
) {

  const values =
    entries.map(
      (entry) =>
        entry.value
    );


  const extremeValue =
    mode === "min"
      ? Math.min(...values)
      : Math.max(...values);


  return {
    value:
      extremeValue,

    jobs:
      entries
        .filter(
          (entry) =>
            entry.value ===
            extremeValue
        )
        .map(
          (entry) =>
            entry.job
        )
  };

}


function formatJobNames(
  jobs
) {

  const names =
    jobs.map(
      (job) =>
        job.title
    );


  if (
    names.length === 1
  ) {
    return names[0];
  }


  if (
    names.length === 2
  ) {
    return `${names[0]} and ${names[1]}`;
  }


  return (
    `${names.slice(0, -1).join(", ")}, and ` +
    names[names.length - 1]
  );

}


// ==========================================================
// Deterministic Analysis Summary
// ==========================================================

function getAnalysisSummary() {

  const statements = [];


  const salaryEntries =
    getNumericValues(
      "salary"
    );


  if (
    salaryEntries
  ) {

    if (
      allValuesEqual(
        salaryEntries
      )
    ) {

      statements.push(
        `All selected jobs list the same salary of $${salaryEntries[0].value}/hour.`
      );

    } else {

      const highestSalary =
        getJobsWithExtremeValue(
          salaryEntries,
          "max"
        );


      statements.push(
        `${formatJobNames(highestSalary.jobs)} ${highestSalary.jobs.length === 1 ? "has" : "have"} the highest listed salary at $${highestSalary.value}/hour.`
      );

    }

  }


  const durationEntries =
    getNumericValues(
      "durationMonths",
      (value) =>
        Number.isFinite(value) &&
        value > 0
    );


  if (
    durationEntries
  ) {

    if (
      allValuesEqual(
        durationEntries
      )
    ) {

      statements.push(
        `All selected jobs list the same contract length of ${durationEntries[0].value} months.`
      );

    } else {

      const longestContract =
        getJobsWithExtremeValue(
          durationEntries,
          "max"
        );


      statements.push(
        `${formatJobNames(longestContract.jobs)} ${longestContract.jobs.length === 1 ? "has" : "have"} the longest listed contract at ${longestContract.value} months.`
      );

    }

  }


  const experienceEntries =
    getNumericValues(
      "experienceYears"
    );


  if (
    experienceEntries &&
    !allValuesEqual(
      experienceEntries
    )
  ) {

    const lowestExperience =
      getJobsWithExtremeValue(
        experienceEntries,
        "min"
      );


    statements.push(
      `${formatJobNames(lowestExperience.jobs)} ${lowestExperience.jobs.length === 1 ? "has" : "have"} the lowest listed experience requirement.`
    );

  }


  const deadlineEntries =
    selectedJobs.map(
      (job) => ({
        job,
        value:
          new Date(
            `${String(job.deadline || "").slice(0, 10)}T12:00:00`
          )
      })
    );


  const validDeadlines =
    deadlineEntries.every(
      (entry) =>
        !Number.isNaN(
          entry.value.getTime()
        )
    );


  if (
    validDeadlines
  ) {

    const deadlineTimes =
      deadlineEntries.map(
        (entry) => ({
          job:
            entry.job,

          value:
            entry.value.getTime()
        })
      );


    if (
      !allValuesEqual(
        deadlineTimes
      )
    ) {

      const earliestDeadline =
        getJobsWithExtremeValue(
          deadlineTimes,
          "min"
        );


      statements.push(
        `${formatJobNames(earliestDeadline.jobs)} ${earliestDeadline.jobs.length === 1 ? "has" : "have"} the earliest application deadline.`
      );

    }

  }


  if (
    selectedJobs.some(
      (job) =>
        !hasUsefulValue(
          job.schedule
        ) ||
        !hasUsefulValue(
          job.responsibilities
        )
    )
  ) {

    statements.push(
      "Some comparison details were not included in the original job postings, so those fields are marked Not Provided."
    );

  }


  if (
    statements.length === 0
  ) {

    statements.push(
      "The available information for these jobs is very similar. Review the table above and the original postings before deciding which role to prioritize."
    );

  }


  return statements;

}


function renderAnalysisSummary() {

  const statements =
    getAnalysisSummary();


  aiSummaryText.innerHTML =
    "";


  statements.forEach(
    (statement) => {

      const paragraph =
        document.createElement(
          "p"
        );


      paragraph.textContent =
        statement;


      aiSummaryText.appendChild(
        paragraph
      );

    }
  );

}


// ==========================================================
// Compare Jobs
// ==========================================================

compareJobsButton.addEventListener(
  "click",
  () => {

    const activeSelects =
      getActiveJobSelects();


    const selectedIds =
      activeSelects.map(
        (select) =>
          select.value
      );


    if (
      selectedIds.some(
        (jobId) =>
          !jobId
      )
    ) {

      selectionMessage.textContent =
        thirdJobEnabled
          ? "Select three saved jobs to continue."
          : "Select two saved jobs to continue.";


      return;

    }


    if (
      new Set(
        selectedIds
      ).size !==
      selectedIds.length
    ) {

      selectionMessage.textContent =
        "Choose different jobs for each comparison slot.";


      return;

    }


    selectedJobs =
      getSelectedJobsFromInputs();


    if (
      selectedJobs.some(
        (job) =>
          !job
      )
    ) {

      selectionMessage.textContent =
        "One of the selected jobs is no longer available in Saved Jobs.";


      return;

    }


    renderComparisonTable();
    renderAnalysisSummary();
    resetChat();


    jobSelectionView.hidden =
      true;

    comparisonResultsView.hidden =
      false;


    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  }
);


// ==========================================================
// Edit Jobs
// ==========================================================

editJobsButton.addEventListener(
  "click",
  () => {

    aiChatSection.hidden =
      true;


    comparisonResultsView.hidden =
      true;

    jobSelectionView.hidden =
      false;


    populateJobSelects();


    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  }
);


// ==========================================================
// AI Chat
// ==========================================================

askAnythingButton.addEventListener(
  "click",
  () => {

    aiChatSection.hidden =
      false;


    aiChatSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });


    chatInput.focus();

  }
);


closeChatButton.addEventListener(
  "click",
  () => {

    aiChatSection.hidden =
      true;


    askAnythingButton.focus();

  }
);


function resetChat() {

  chatMessages.innerHTML =
    "";


  const jobCount =
    selectedJobs.length;


  addChatMessage(
    "assistant",
    `Hi! Ask a follow-up question about the ${jobCount} jobs above. This prototype uses simple rule-based responses to demonstrate how the planned AI chat will behave.`
  );


  chatInput.value =
    "";


  aiChatSection.hidden =
    true;

}


function addChatMessage(
  sender,
  message
) {

  const messageElement =
    document.createElement(
      "div"
    );


  messageElement.classList.add(
    "chat-message",
    sender === "user"
      ? "chat-message-user"
      : "chat-message-assistant"
  );


  messageElement.textContent =
    message;


  chatMessages.appendChild(
    messageElement
  );


  chatMessages.scrollTop =
    chatMessages.scrollHeight;

}


chatForm.addEventListener(
  "submit",
  (event) => {

    event.preventDefault();


    if (
      selectedJobs.length < 2
    ) {
      return;
    }


    const question =
      chatInput.value.trim();


    if (
      !question
    ) {
      return;
    }


    addChatMessage(
      "user",
      question
    );


    chatInput.value =
      "";


    const response =
      getMockChatResponse(
        question
      );


    addChatMessage(
      "assistant",
      response
    );

  }
);


// ==========================================================
// Rule-Based Prototype Responses
// ==========================================================

function getMockChatResponse(
  question
) {

  const normalizedQuestion =
    question.toLowerCase();


  if (
    normalizedQuestion.includes(
      "salary"
    ) ||
    normalizedQuestion.includes(
      "pay"
    ) ||
    normalizedQuestion.includes(
      "money"
    )
  ) {

    return getSalaryResponse();

  }


  if (
    normalizedQuestion.includes(
      "deadline"
    ) ||
    normalizedQuestion.includes(
      "apply"
    )
  ) {

    return getDeadlineResponse();

  }


  if (
    normalizedQuestion.includes(
      "experience"
    ) ||
    normalizedQuestion.includes(
      "requirement"
    )
  ) {

    return getExperienceResponse();

  }


  if (
    normalizedQuestion.includes(
      "contract"
    ) ||
    normalizedQuestion.includes(
      "duration"
    ) ||
    normalizedQuestion.includes(
      "length"
    )
  ) {

    return getContractResponse();

  }


  if (
    normalizedQuestion.includes(
      "location"
    ) ||
    normalizedQuestion.includes(
      "remote"
    ) ||
    normalizedQuestion.includes(
      "calgary"
    )
  ) {

    return getLocationResponse();

  }


  return (
    "Hello! This is a prototype, so this chat is only demonstrating the planned interaction. " +
    "A production version can replace these rule-based responses with an AI model that answers detailed questions about the compared jobs."
  );

}


function getSalaryResponse() {

  const salaryEntries =
    getNumericValues(
      "salary"
    );


  if (
    !salaryEntries
  ) {

    return (
      "A complete salary comparison is not available because at least one of the selected job postings does not provide salary information."
    );

  }


  if (
    allValuesEqual(
      salaryEntries
    )
  ) {

    return `All selected jobs list the same salary of $${salaryEntries[0].value}/hour.`;

  }


  const highestSalary =
    getJobsWithExtremeValue(
      salaryEntries,
      "max"
    );

  const lowestSalary =
    getJobsWithExtremeValue(
      salaryEntries,
      "min"
    );


  const difference =
    highestSalary.value -
    lowestSalary.value;


  return `${formatJobNames(highestSalary.jobs)} ${highestSalary.jobs.length === 1 ? "has" : "have"} the highest listed salary at $${highestSalary.value}/hour, which is $${difference}/hour above the lowest listed salary in this comparison.`;

}


function getDeadlineResponse() {

  const entries =
    selectedJobs.map(
      (job) => ({
        job,
        date:
          new Date(
            `${String(job.deadline || "").slice(0, 10)}T12:00:00`
          )
      })
    );


  if (
    entries.some(
      (entry) =>
        Number.isNaN(
          entry.date.getTime()
        )
    )
  ) {

    return (
      "A complete deadline comparison is not available because at least one selected job does not provide a valid application deadline."
    );

  }


  const comparable =
    entries.map(
      (entry) => ({
        job:
          entry.job,

        value:
          entry.date.getTime()
      })
    );


  if (
    allValuesEqual(
      comparable
    )
  ) {

    return `All selected jobs have the same application deadline: ${formatDate(entries[0].job.deadline)}.`;

  }


  const earliest =
    getJobsWithExtremeValue(
      comparable,
      "min"
    );


  return `${formatJobNames(earliest.jobs)} ${earliest.jobs.length === 1 ? "closes" : "close"} first, with an application deadline of ${formatDate(earliest.jobs[0].deadline)}.`;

}


function getExperienceResponse() {

  const experienceEntries =
    getNumericValues(
      "experienceYears"
    );


  if (
    !experienceEntries
  ) {

    return (
      "A complete experience comparison is not available because at least one selected posting does not provide an experience requirement."
    );

  }


  if (
    allValuesEqual(
      experienceEntries
    )
  ) {

    return `All selected jobs list the same experience requirement: ${formatExperience(selectedJobs[0])}.`;

  }


  const lowestExperience =
    getJobsWithExtremeValue(
      experienceEntries,
      "min"
    );


  return `${formatJobNames(lowestExperience.jobs)} ${lowestExperience.jobs.length === 1 ? "has" : "have"} the lowest listed experience requirement at ${formatExperience(lowestExperience.jobs[0])}.`;

}


function getContractResponse() {

  const durationEntries =
    getNumericValues(
      "durationMonths",
      (value) =>
        Number.isFinite(value) &&
        value > 0
    );


  if (
    !durationEntries
  ) {

    return (
      "A complete contract-length comparison is not available because at least one selected posting does not provide a fixed contract length."
    );

  }


  if (
    allValuesEqual(
      durationEntries
    )
  ) {

    return `All selected jobs list the same contract length of ${durationEntries[0].value} months.`;

  }


  const longestContract =
    getJobsWithExtremeValue(
      durationEntries,
      "max"
    );


  return `${formatJobNames(longestContract.jobs)} ${longestContract.jobs.length === 1 ? "has" : "have"} the longest listed contract at ${longestContract.value} months.`;

}


function getLocationResponse() {

  return selectedJobs
    .map(
      (job) =>
        `${job.title}: ${job.location || "location not provided"}`
    )
    .join("; ") + ".";

}


// ==========================================================
// Initialize
// ==========================================================

async function initializeComparisonTool() {

  allJobs =
    await loadJobs();


  savedJobs =
    getSavedJobs();


  savedJobs.sort(
    (a, b) =>
      String(a.title).localeCompare(
        String(b.title)
      )
  );


  jobThreeField.hidden =
    true;


  addJobButton.textContent =
    "+ Add Job";


  populateJobSelects();


  if (
    savedJobs.length < 2
  ) {

    jobOneSelect.disabled =
      savedJobs.length === 0;

    jobTwoSelect.disabled =
      savedJobs.length < 2;

  }


  jobThreeSelect.disabled =
    savedJobs.length < 3;

}


initializeComparisonTool();
