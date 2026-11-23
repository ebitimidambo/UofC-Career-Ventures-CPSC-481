// ==========================================================
// UC Careers - Job Application Navigation
// ==========================================================


// ==========================================================
// Current Page Reference
// ==========================================================

function getCurrentPageReference() {

  const pageName =
    window.location.pathname
      .split("/")
      .pop();


  return (
    `${pageName}${window.location.search}`
  );

}


// ==========================================================
// Apply Navigation
// ==========================================================

document.addEventListener(
  "click",
  (event) => {

    const applyButton =
      event.target.closest(`
        .apply-job-button[data-job-id],
        .apply-button[data-job-id],
        [data-action="apply-job"][data-job-id],
        #apply-button
      `);


    if (!applyButton) {
      return;
    }


    let jobId =
      applyButton.dataset.jobId;


    /*
      The Job Details page already contains
      the job ID in its URL.
    */

    if (
      !jobId &&
      applyButton.id === "apply-button"
    ) {

      const parameters =
        new URLSearchParams(
          window.location.search
        );


      jobId =
        parameters.get(
          "jobId"
        );

    }


    if (!jobId) {
      return;
    }


    event.preventDefault();


    const sourcePage =
      getCurrentPageReference();


    const parameters =
      new URLSearchParams();


    parameters.set(
      "jobId",
      jobId
    );


    parameters.set(
      "from",
      sourcePage
    );


    window.location.href =
      `job-application.html?${parameters.toString()}`;

  }
);