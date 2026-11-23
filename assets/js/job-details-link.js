// ==========================================================
// UC Careers - Job Details Navigation
// ==========================================================

document.addEventListener(
  "click",
  (event) => {

    const viewButton =
      event.target.closest(
        `
          .view-button[data-job-id],
          .view-job-button[data-job-id],
          [data-action="view-job"][data-job-id]
        `
      );


    if (!viewButton) {
      return;
    }


    const jobId =
      viewButton.dataset.jobId;


    if (!jobId) {
      return;
    }


    event.preventDefault();


    window.location.href =
      `job-details.html?jobId=${encodeURIComponent(jobId)}`;

  }
);