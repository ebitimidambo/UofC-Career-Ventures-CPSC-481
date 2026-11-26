// ==========================================================
// UC Careers - Calendar
// ==========================================================

import {
  getCurrentUser,
  saveCurrentUser,
  getSavedJobIds
} from "./data-service.js?v=2";


// ==========================================================
// Page Elements
// ==========================================================

const calendarDays =
  document.getElementById(
    "calendar-days"
  );

const calendarMonthLabel =
  document.getElementById(
    "calendar-month-label"
  );

const todayButton =
  document.getElementById(
    "today-button"
  );

const previousMonthButton =
  document.getElementById(
    "previous-month-button"
  );

const nextMonthButton =
  document.getElementById(
    "next-month-button"
  );

const exportCalendarButton =
  document.getElementById(
    "export-calendar-button"
  );


// ==========================================================
// Deadline Overview Elements
// ==========================================================

const deadlineOverview =
  document.getElementById(
    "deadline-overview"
  );

const upcomingDeadlinesList =
  document.getElementById(
    "upcoming-deadlines-list"
  );


// ==========================================================
// Deadline Details Elements
// ==========================================================

const deadlineDetails =
  document.getElementById(
    "deadline-details"
  );

const backToDeadlinesButton =
  document.getElementById(
    "back-to-deadlines-button"
  );

const selectedDeadlineDate =
  document.getElementById(
    "selected-deadline-date"
  );

const selectedDaysLeft =
  document.getElementById(
    "selected-days-left"
  );

const selectedJobTitle =
  document.getElementById(
    "selected-job-title"
  );

const selectedJobCompany =
  document.getElementById(
    "selected-job-company"
  );

const selectedJobLocation =
  document.getElementById(
    "selected-job-location"
  );

const selectedJobType =
  document.getElementById(
    "selected-job-type"
  );

const selectedJobWorkTerm =
  document.getElementById(
    "selected-job-work-term"
  );

const selectedJobSalary =
  document.getElementById(
    "selected-job-salary"
  );

const reminderSevenDays =
  document.getElementById(
    "reminder-seven-days"
  );

const reminderOneDay =
  document.getElementById(
    "reminder-one-day"
  );

const reminderTwoMinutes =
  document.getElementById(
    "reminder-two-minutes"
  );

const applyRemindersButton =
  document.getElementById(
    "apply-reminders-button"
  );

const reminderStatus =
  document.getElementById(
    "reminder-status"
  );

const viewSelectedJobButton =
  document.getElementById(
    "view-selected-job-button"
  );


// ==========================================================
// Page State
// ==========================================================

const today =
  startOfDay(
    new Date()
  );

const currentMonthStart =
  new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  );

const minimumMonth =
  addMonths(
    currentMonthStart,
    -12
  );

const maximumMonth =
  addMonths(
    currentMonthStart,
    24
  );

let displayedMonth =
  new Date(
    currentMonthStart
  );

let currentUser =
  getCurrentUser();

let allJobs = [];

let selectedJob =
  null;

let selectedDateKey =
  null;


// ==========================================================
// Date Helpers
// ==========================================================

function startOfDay(
  date
) {

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

}


function addMonths(
  date,
  amount
) {

  return new Date(
    date.getFullYear(),
    date.getMonth() + amount,
    1
  );

}


function datesMatch(
  first,
  second
) {

  return (
    first.getFullYear() ===
      second.getFullYear() &&
    first.getMonth() ===
      second.getMonth() &&
    first.getDate() ===
      second.getDate()
  );

}


function getLocalDateKey(
  date
) {

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );


  return `${year}-${month}-${day}`;

}


function parseLocalDate(
  value
) {

  if (!value) {

    return null;

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


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return null;

  }


  return date;

}


function getDaysFromToday(
  date
) {

  const millisecondsPerDay =
    1000 *
    60 *
    60 *
    24;


  return Math.round(
    (
      startOfDay(date) -
      today
    ) /
    millisecondsPerDay
  );

}


// ==========================================================
// Display Formatting
// ==========================================================

function formatMonthYear(
  date
) {

  return date.toLocaleDateString(
    "en-CA",
    {
      month: "long",
      year: "numeric"
    }
  );

}


function formatShortDeadline(
  date
) {

  return date
    .toLocaleDateString(
      "en-CA",
      {
        month: "short",
        day: "numeric"
      }
    )
    .toUpperCase();

}


function formatLongDeadline(
  date
) {

  return date.toLocaleDateString(
    "en-CA",
    {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric"
    }
  );

}


function formatDaysLeft(
  daysLeft
) {

  if (
    daysLeft < 0
  ) {

    const daysPast =
      Math.abs(
        daysLeft
      );


    return daysPast === 1
      ? "1 day ago"
      : `${daysPast} days ago`;

  }


  if (
    daysLeft === 0
  ) {

    return "Today";

  }


  if (
    daysLeft === 1
  ) {

    return "1 day";

  }


  return `${daysLeft} days`;

}


function formatSalary(
  job
) {

  if (
    job.salary === undefined ||
    job.salary === null
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


  return `$${salary.toFixed(2)}/hr`;

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
// Saved Jobs with Valid Deadlines
// ==========================================================

function getJobsWithDeadlines() {

  /*
    The Calendar only tracks jobs the current
    user has intentionally saved.

    Saved job IDs are stored in localStorage
    through data-service.js.
  */

  const savedJobIds =
    new Set(
      getSavedJobIds()
    );


  return allJobs

    .filter(
      (job) =>
        savedJobIds.has(
          job.id
        )
    )

    .map(
      (job) => {

        const deadlineDate =
          parseLocalDate(
            job.deadline
          );


        if (!deadlineDate) {

          return null;

        }


        return {
          job,

          deadlineDate,

          dateKey:
            getLocalDateKey(
              deadlineDate
            ),

          daysLeft:
            getDaysFromToday(
              deadlineDate
            )
        };

      }
    )

    .filter(Boolean)

    .sort(
      (a, b) =>
        a.deadlineDate -
        b.deadlineDate
    );

}


// ==========================================================
// Upcoming Deadlines
// ==========================================================

function getUpcomingDeadlines() {

  return getJobsWithDeadlines()
    .filter(
      (entry) =>
        entry.daysLeft >= 0 &&
        entry.daysLeft <= 30
    );

}


// ==========================================================
// Jobs for Date
// ==========================================================

function getJobsForDate(
  date
) {

  const dateKey =
    getLocalDateKey(
      date
    );


  return getJobsWithDeadlines()
    .filter(
      (entry) =>
        entry.dateKey ===
        dateKey
    );

}


// ==========================================================
// Nearest Upcoming Job ID
// ==========================================================

function getNearestUpcomingJobId() {

  const upcoming =
    getUpcomingDeadlines();


  return upcoming[0]?.job.id ||
    null;

}


// ==========================================================
// Calendar Grid Range
// ==========================================================

function getCalendarDatesForMonth(
  monthStart
) {

  const firstOfMonth =
    new Date(
      monthStart.getFullYear(),
      monthStart.getMonth(),
      1
    );


  const lastOfMonth =
    new Date(
      monthStart.getFullYear(),
      monthStart.getMonth() + 1,
      0
    );


  /*
    JavaScript:
      Sunday = 0
      Monday = 1

    Calendar:
      Monday = first column
  */

  const leadingDays =
    (
      firstOfMonth.getDay() + 6
    ) % 7;


  const trailingDays =
    (
      7 -
      (
        (
          lastOfMonth.getDay() + 6
        ) % 7 +
        1
      )
    ) % 7;


  const totalDays =
    leadingDays +
    lastOfMonth.getDate() +
    trailingDays;


  const rowCount =
    totalDays / 7;


  const startDate =
    new Date(
      firstOfMonth.getFullYear(),
      firstOfMonth.getMonth(),
      1 - leadingDays
    );


  const dates = [];


  for (
    let index = 0;
    index < totalDays;
    index += 1
  ) {

    dates.push(
      new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate() + index
      )
    );

  }


  return {
    dates,
    rowCount
  };

}


// ==========================================================
// Render Calendar
// ==========================================================

function renderCalendar() {

  calendarMonthLabel.textContent =
    formatMonthYear(
      displayedMonth
    );


  const {
    dates,
    rowCount
  } =
    getCalendarDatesForMonth(
      displayedMonth
    );


  calendarDays.style.setProperty(
    "--calendar-row-count",
    rowCount
  );


  calendarDays.innerHTML =
    "";


  const nearestJobId =
    getNearestUpcomingJobId();


  dates.forEach(
    (date, index) => {

      const jobsForDate =
        getJobsForDate(
          date
        );


      const dateKey =
        getLocalDateKey(
          date
        );


      const isOutsideMonth =
        date.getMonth() !==
        displayedMonth.getMonth();


      const isToday =
        datesMatch(
          date,
          today
        );


      const isSelected =
        selectedDateKey ===
        dateKey;


      const day =
        document.createElement(
          jobsForDate.length > 0
            ? "button"
            : "div"
        );


      day.classList.add(
        "calendar-day"
      );


      if (
        isOutsideMonth
      ) {

        day.classList.add(
          "outside-month"
        );

      }


      if (
        jobsForDate.length > 0
      ) {

        day.classList.add(
          "has-deadline"
        );


        day.type =
          "button";


        day.setAttribute(
          "aria-label",
          `${formatLongDeadline(date)}: ${jobsForDate.length} job deadline${jobsForDate.length === 1 ? "" : "s"}`
        );


        day.addEventListener(
          "click",
          () => {

            selectDeadlineEntry(
              jobsForDate[0]
            );

          }
        );

      }


      if (
        isSelected
      ) {

        day.classList.add(
          "selected"
        );

      }


      if (
        index >=
        dates.length - 7
      ) {

        day.classList.add(
          "last-row"
        );

      }


      const dayNumber =
        document.createElement(
          "span"
        );


      dayNumber.classList.add(
        "calendar-day-number"
      );


      if (
        isToday
      ) {

        dayNumber.classList.add(
          "today"
        );

      }


      dayNumber.textContent =
        date.getDate();


      day.appendChild(
        dayNumber
      );


      if (
        jobsForDate.length > 0
      ) {

        const events =
          document.createElement(
            "div"
          );


        events.classList.add(
          "calendar-events"
        );


        jobsForDate
          .slice(
            0,
            2
          )
          .forEach(
            (entry) => {

              const event =
                document.createElement(
                  "span"
                );


              event.classList.add(
                "calendar-event"
              );


              if (
                entry.job.id ===
                nearestJobId
              ) {

                event.classList.add(
                  "nearest"
                );

              }


              event.textContent =
                entry.job.company;


              events.appendChild(
                event
              );

            }
          );


        if (
          jobsForDate.length > 2
        ) {

          const more =
            document.createElement(
              "span"
            );


          more.classList.add(
            "calendar-more-events"
          );


          more.textContent =
            `+${jobsForDate.length - 2} more`;


          events.appendChild(
            more
          );

        }


        day.appendChild(
          events
        );

      }


      calendarDays.appendChild(
        day
      );

    }
  );


  updateMonthNavigationButtons();

}


// ==========================================================
// Month Navigation State
// ==========================================================

function compareMonths(
  first,
  second
) {

  const firstValue =
    first.getFullYear() *
      12 +
    first.getMonth();


  const secondValue =
    second.getFullYear() *
      12 +
    second.getMonth();


  return (
    firstValue -
    secondValue
  );

}


function updateMonthNavigationButtons() {

  previousMonthButton.disabled =
    compareMonths(
      displayedMonth,
      minimumMonth
    ) <= 0;


  nextMonthButton.disabled =
    compareMonths(
      displayedMonth,
      maximumMonth
    ) >= 0;

}


// ==========================================================
// Render Upcoming Deadlines
// ==========================================================

function renderUpcomingDeadlines() {

  upcomingDeadlinesList.innerHTML =
    "";


  const upcoming =
    getUpcomingDeadlines();


  if (
    upcoming.length === 0
  ) {

    const message =
      document.createElement(
        "p"
      );


    message.classList.add(
      "no-upcoming-deadlines"
    );


    message.textContent =
      "No job deadlines in the next 30 days.";


    upcomingDeadlinesList.appendChild(
      message
    );


    return;

  }


  upcoming.forEach(
    (entry, index) => {

      const card =
        document.createElement(
          "button"
        );


      card.type =
        "button";


      card.classList.add(
        "deadline-card"
      );


      if (
        index === 0
      ) {

        card.classList.add(
          "nearest"
        );

      }


      card.innerHTML = `

        <div class="deadline-card-meta">

          <span class="deadline-card-date">
            ${formatShortDeadline(entry.deadlineDate)}
          </span>

          <span>
            ${formatDaysLeft(entry.daysLeft)}
          </span>

        </div>

        <h3>
          ${escapeHtml(entry.job.title)}
        </h3>

        <p class="deadline-card-company">
          ${escapeHtml(entry.job.company)}
        </p>

      `;


      card.addEventListener(
        "click",
        () => {

          selectDeadlineEntry(
            entry
          );

        }
      );


      upcomingDeadlinesList.appendChild(
        card
      );

    }
  );

}


// ==========================================================
// Reminder Preferences
// ==========================================================

function getCalendarReminderPreferences() {

  const reminders =
    currentUser?.calendarReminders;


  if (
    !reminders ||
    typeof reminders !==
      "object" ||
    Array.isArray(reminders)
  ) {

    return {};

  }


  return reminders;

}


function getReminderPreferencesForJob(
  jobId
) {

  const allReminders =
    getCalendarReminderPreferences();


  const saved =
    allReminders[jobId];


  if (
    !saved ||
    typeof saved !==
      "object"
  ) {

    return {
      sevenDays: false,
      oneDay: false,
      twoMinutes: false
    };

  }


  return {
    sevenDays:
      saved.sevenDays === true,

    oneDay:
      saved.oneDay === true,

    twoMinutes:
      saved.twoMinutes === true
  };

}


// ==========================================================
// Render Selected Deadline
// ==========================================================

function renderSelectedDeadline(
  entry
) {

  selectedJob =
    entry.job;


  selectedDateKey =
    entry.dateKey;


  selectedDeadlineDate.textContent =
    formatShortDeadline(
      entry.deadlineDate
    );


  selectedDaysLeft.textContent =
    formatDaysLeft(
      entry.daysLeft
    );


  selectedJobTitle.textContent =
    entry.job.title ||
    "";


  selectedJobCompany.textContent =
    entry.job.company ||
    "";


  selectedJobLocation.textContent =
    entry.job.location ||
    "Not available";


  selectedJobType.textContent =
    entry.job.type ||
    "Not available";


  selectedJobWorkTerm.textContent =
    entry.job.workTerm ||
    "Not available";


  selectedJobSalary.textContent =
    formatSalary(
      entry.job
    );


  const preferences =
    getReminderPreferencesForJob(
      entry.job.id
    );


  reminderSevenDays.checked =
    preferences.sevenDays;


  reminderOneDay.checked =
    preferences.oneDay;


  reminderTwoMinutes.checked =
    preferences.twoMinutes;


  reminderStatus.textContent =
    "";


  deadlineOverview.hidden =
    true;


  deadlineDetails.hidden =
    false;

}


// ==========================================================
// Select Deadline
// ==========================================================

function selectDeadlineEntry(
  entry
) {

  displayedMonth =
    new Date(
      entry.deadlineDate.getFullYear(),
      entry.deadlineDate.getMonth(),
      1
    );


  renderSelectedDeadline(
    entry
  );


  renderCalendar();

}


// ==========================================================
// Return to Overview
// ==========================================================

function showDeadlineOverview() {

  selectedJob =
    null;


  selectedDateKey =
    null;


  deadlineDetails.hidden =
    true;


  deadlineOverview.hidden =
    false;


  renderCalendar();

}


// ==========================================================
// Save Reminder Preferences
// ==========================================================

function saveReminderPreferences() {

  if (!selectedJob) {

    return;

  }


  const preferences = {
    sevenDays:
      reminderSevenDays.checked,

    oneDay:
      reminderOneDay.checked,

    twoMinutes:
      reminderTwoMinutes.checked
  };


  if (currentUser) {

    const existing =
      getCalendarReminderPreferences();


    currentUser = {
      ...currentUser,

      calendarReminders: {
        ...existing,

        [selectedJob.id]:
          preferences
      }
    };


    saveCurrentUser(
      currentUser
    );

  }


  downloadSingleJobCalendar(
    selectedJob,
    preferences
  );


  reminderStatus.textContent =
    "Reminder preferences saved. Calendar reminder file downloaded.";

}


// ==========================================================
// ICS Helpers
// ==========================================================

function escapeIcsText(
  value
) {

  return String(
    value ?? ""
  )
    .replace(
      /\\/g,
      "\\\\"
    )
    .replace(
      /\n/g,
      "\\n"
    )
    .replace(
      /,/g,
      "\\,"
    )
    .replace(
      /;/g,
      "\\;"
    );

}


function formatIcsDate(
  date
) {

  const year =
    date.getFullYear();


  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );


  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );


  return `${year}${month}${day}`;

}


function formatIcsTimestamp(
  date
) {

  const year =
    date.getUTCFullYear();


  const month =
    String(
      date.getUTCMonth() + 1
    ).padStart(
      2,
      "0"
    );


  const day =
    String(
      date.getUTCDate()
    ).padStart(
      2,
      "0"
    );


  const hours =
    String(
      date.getUTCHours()
    ).padStart(
      2,
      "0"
    );


  const minutes =
    String(
      date.getUTCMinutes()
    ).padStart(
      2,
      "0"
    );


  const seconds =
    String(
      date.getUTCSeconds()
    ).padStart(
      2,
      "0"
    );


  return (
    `${year}${month}${day}` +
    `T${hours}${minutes}${seconds}Z`
  );

}


function createAlarmLines(
  preferences
) {

  const alarms = [];


  if (
    preferences.sevenDays
  ) {

    alarms.push(
      [
        "BEGIN:VALARM",
        "ACTION:DISPLAY",
        "DESCRIPTION:Job application deadline in one week",
        "TRIGGER:-P7D",
        "END:VALARM"
      ].join("\r\n")
    );

  }


  if (
    preferences.oneDay
  ) {

    alarms.push(
      [
        "BEGIN:VALARM",
        "ACTION:DISPLAY",
        "DESCRIPTION:Job application deadline in 24 hours",
        "TRIGGER:-P1D",
        "END:VALARM"
      ].join("\r\n")
    );

  }


  if (
    preferences.twoMinutes
  ) {

    alarms.push(
      [
        "BEGIN:VALARM",
        "ACTION:DISPLAY",
        "DESCRIPTION:Test job deadline reminder",
        "TRIGGER:-PT2M",
        "END:VALARM"
      ].join("\r\n")
    );

  }


  return alarms;

}


// ==========================================================
// Create Job Calendar Event
// ==========================================================

function createJobIcsEvent(
  job,
  preferences = {}
) {

  const deadline =
    parseLocalDate(
      job.deadline
    );


  if (!deadline) {

    return "";

  }


  const nextDay =
    new Date(
      deadline.getFullYear(),
      deadline.getMonth(),
      deadline.getDate() + 1
    );


  const descriptionParts = [
    `${job.title} at ${job.company}`,

    job.location
      ? `Location: ${job.location}`
      : "",

    job.type
      ? `Job type: ${job.type}`
      : "",

    job.workTerm
      ? `Work term: ${job.workTerm}`
      : "",

    job.salary !== undefined &&
    job.salary !== null
      ? `Salary: ${formatSalary(job)}`
      : ""
  ].filter(Boolean);


  const eventLines = [
    "BEGIN:VEVENT",

    `UID:${escapeIcsText(job.id)}-deadline@uc-careers`,

    `DTSTAMP:${formatIcsTimestamp(new Date())}`,

    `DTSTART;VALUE=DATE:${formatIcsDate(deadline)}`,

    `DTEND;VALUE=DATE:${formatIcsDate(nextDay)}`,

    `SUMMARY:${escapeIcsText(
      `Application Deadline: ${job.title}`
    )}`,

    `DESCRIPTION:${escapeIcsText(
      descriptionParts.join("\n")
    )}`
  ];


  createAlarmLines(
    preferences
  ).forEach(
    (alarm) => {

      eventLines.push(
        alarm
      );

    }
  );


  eventLines.push(
    "END:VEVENT"
  );


  return eventLines.join(
    "\r\n"
  );

}


// ==========================================================
// Create ICS Calendar
// ==========================================================

function createIcsCalendar(
  events
) {

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//UC Careers//Job Deadline Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...events,
    "END:VCALENDAR",
    ""
  ].join(
    "\r\n"
  );

}


// ==========================================================
// Download Text File
// ==========================================================

function downloadTextFile(
  fileName,
  contents,
  mimeType
) {

  const blob =
    new Blob(
      [contents],
      {
        type: mimeType
      }
    );


  const url =
    URL.createObjectURL(
      blob
    );


  const link =
    document.createElement(
      "a"
    );


  link.href =
    url;


  link.download =
    fileName;


  document.body.appendChild(
    link
  );


  link.click();


  link.remove();


  window.setTimeout(
    () => {

      URL.revokeObjectURL(
        url
      );

    },
    0
  );

}


// ==========================================================
// Download Selected Job Calendar
// ==========================================================

function downloadSingleJobCalendar(
  job,
  preferences
) {

  const event =
    createJobIcsEvent(
      job,
      preferences
    );


  if (!event) {

    return;

  }


  const calendar =
    createIcsCalendar(
      [event]
    );


  const safeCompanyName =
    String(
      job.company ||
      "job"
    )
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /^-|-$/g,
        ""
      );


  downloadTextFile(
    `${safeCompanyName}-deadline.ics`,
    calendar,
    "text/calendar;charset=utf-8"
  );

}


// ==========================================================
// Export Complete Calendar
// ==========================================================

function exportCompleteCalendar() {

  const reminders =
    getCalendarReminderPreferences();


  const events =
    getJobsWithDeadlines()
      .filter(
        (entry) =>
          entry.daysLeft >= 0
      )
      .map(
        (entry) => {

          const preferences =
            reminders[
              entry.job.id
            ] || {};


          return createJobIcsEvent(
            entry.job,
            preferences
          );

        }
      )
      .filter(Boolean);


  const calendar =
    createIcsCalendar(
      events
    );


  downloadTextFile(
    "uc-careers-deadlines.ics",
    calendar,
    "text/calendar;charset=utf-8"
  );

}


// ==========================================================
// Escape HTML
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


// ==========================================================
// Month Navigation
// ==========================================================

todayButton.addEventListener(
  "click",
  () => {

    displayedMonth =
      new Date(
        currentMonthStart
      );


    showDeadlineOverview();


    renderUpcomingDeadlines();

  }
);


previousMonthButton.addEventListener(
  "click",
  () => {

    const previous =
      addMonths(
        displayedMonth,
        -1
      );


    if (
      compareMonths(
        previous,
        minimumMonth
      ) < 0
    ) {

      return;

    }


    displayedMonth =
      previous;


    showDeadlineOverview();

  }
);


nextMonthButton.addEventListener(
  "click",
  () => {

    const next =
      addMonths(
        displayedMonth,
        1
      );


    if (
      compareMonths(
        next,
        maximumMonth
      ) > 0
    ) {

      return;

    }


    displayedMonth =
      next;


    showDeadlineOverview();

  }
);


// ==========================================================
// Deadline Panel Events
// ==========================================================

backToDeadlinesButton.addEventListener(
  "click",
  () => {

    showDeadlineOverview();

  }
);


applyRemindersButton.addEventListener(
  "click",
  () => {

    saveReminderPreferences();

  }
);


viewSelectedJobButton.addEventListener(
  "click",
  () => {

    if (!selectedJob) {

      return;

    }


    window.location.href =
      `job-details.html?jobId=${encodeURIComponent(
        selectedJob.id
      )}`;

  }
);


// ==========================================================
// Export
// ==========================================================

exportCalendarButton.addEventListener(
  "click",
  () => {

    exportCompleteCalendar();

  }
);


// ==========================================================
// Initialize
// ==========================================================

async function initializeCalendar() {

  currentUser =
    getCurrentUser();


  allJobs =
    await loadJobs();


  renderCalendar();


  renderUpcomingDeadlines();

}


// ==========================================================
// Start
// ==========================================================

initializeCalendar();