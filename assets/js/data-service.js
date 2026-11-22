// ==========================================================
// UC Careers - Shared Local Storage Data
// ==========================================================

const USERS_KEY =
  "ucCareersUsers";

const CURRENT_USER_KEY =
  "ucCareersCurrentUserId";


// ==========================================================
// Get All Stored Users
// ==========================================================

function getStoredUsers() {

  const storedUsers =
    localStorage.getItem(USERS_KEY);


  if (!storedUsers) {
    return {};
  }


  try {

    return JSON.parse(storedUsers);

  } catch (error) {

    console.error(
      "Unable to read stored users:",
      error
    );

    return {};

  }

}


// ==========================================================
// Save All Stored Users
// ==========================================================

function saveStoredUsers(users) {

  localStorage.setItem(
    USERS_KEY,
    JSON.stringify(users)
  );

}


// ==========================================================
// Initialize / Update User From Default Data
// ==========================================================

export function initializeUser(user) {

  if (!user || !user.id) {
    return null;
  }


  const users =
    getStoredUsers();


  const storedUser =
    users[user.id];


  /*
    If this is the user's first login,
    copy their complete default profile
    from user.json.
  */

  if (!storedUser) {

    users[user.id] =
      structuredClone(user);

  } else {

    /*
      If the user already exists in localStorage:

      1. Start with the complete default profile
         from user.json.

      2. Put the stored profile on top.

      This adds any missing fields such as skills,
      careerInterests, stats, etc. without replacing
      profile information the user may have edited.
    */

    users[user.id] = {
      ...structuredClone(user),
      ...storedUser
    };

  }


  saveStoredUsers(users);


  return users[user.id];

}


// ==========================================================
// Set Current User
// ==========================================================

export function setCurrentUser(user) {

  const savedUser =
    initializeUser(user);


  if (!savedUser) {
    return null;
  }


  localStorage.setItem(
    CURRENT_USER_KEY,
    savedUser.id
  );


  return savedUser;

}


// ==========================================================
// Get Current User
// ==========================================================

export function getCurrentUser() {

  const currentUserId =
    localStorage.getItem(
      CURRENT_USER_KEY
    );


  if (!currentUserId) {
    return null;
  }


  const users =
    getStoredUsers();


  return (
    users[currentUserId] ||
    null
  );

}


// ==========================================================
// Save Current User
// ==========================================================

export function saveCurrentUser(updatedUser) {

  const currentUserId =
    localStorage.getItem(
      CURRENT_USER_KEY
    );


  if (!currentUserId) {
    return null;
  }


  const users =
    getStoredUsers();


  const currentUser =
    users[currentUserId];


  if (!currentUser) {
    return null;
  }


  users[currentUserId] = {
    ...currentUser,
    ...updatedUser,
    id: currentUserId
  };


  saveStoredUsers(users);


  return users[currentUserId];

}


// ==========================================================
// Saved Jobs
// ==========================================================

export function getSavedJobIds() {

  const user =
    getCurrentUser();


  if (!user) {
    return [];
  }


  return Array.isArray(
    user.savedJobIds
  )
    ? user.savedJobIds
    : [];

}


// ==========================================================
// Save Job
// ==========================================================

export function saveJob(jobId) {

  const user =
    getCurrentUser();


  if (!user) {
    return;
  }


  const savedJobs =
    new Set(
      user.savedJobIds || []
    );


  savedJobs.add(jobId);


  saveCurrentUser({
    savedJobIds:
      [...savedJobs]
  });

}


// ==========================================================
// Remove Saved Job
// ==========================================================

export function removeSavedJob(jobId) {

  const user =
    getCurrentUser();


  if (!user) {
    return;
  }


  const savedJobs =
    (user.savedJobIds || [])
      .filter(
        (id) =>
          id !== jobId
      );


  saveCurrentUser({
    savedJobIds:
      savedJobs
  });

}


// ==========================================================
// Logout
// ==========================================================

export function logoutUser() {

  /*
    Only end the current login session.

    The user's saved profile, saved jobs,
    preferences, etc. remain in localStorage.
  */

  localStorage.removeItem(
    CURRENT_USER_KEY
  );

}


// ==========================================================
// Migration From Old Storage Setup
// ==========================================================

function migrateOldCurrentUser() {

  const oldUser =
    localStorage.getItem(
      "currentUser"
    );


  const currentUserId =
    localStorage.getItem(
      CURRENT_USER_KEY
    );


  if (
    !oldUser ||
    currentUserId
  ) {
    return;
  }


  try {

    const user =
      JSON.parse(oldUser);


    if (user?.id) {

      const users =
        getStoredUsers();


      /*
        This may be only a partial old profile.

        That is okay. On the user's next login,
        initializeUser() will fill in anything
        missing from user.json.
      */

      if (!users[user.id]) {

        users[user.id] =
          user;


        saveStoredUsers(users);

      }


      localStorage.setItem(
        CURRENT_USER_KEY,
        user.id
      );

    }


    localStorage.removeItem(
      "currentUser"
    );


  } catch (error) {

    console.error(
      "Unable to migrate old user data:",
      error
    );

  }

}


migrateOldCurrentUser();