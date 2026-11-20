# UofC Career Ventures - CPSC 481

Static implementation of the Group 1 Student Career Search Portal horizontal prototype.

## Architecture

This project intentionally uses the simplest possible layered front-end architecture:

- **Presentation layer**: `index.html`, `pages/`, `assets/css/`
- **Application/service layer**: `assets/js/`
- **Mock data layer**: `data/*.json`
- **Prototype persistence layer**: browser `localStorage`

There is no backend, database, framework, package manager, or build step.

## Demo login

- Username: `erin.kim`
- Password: `demo123`

These are mock credentials only. Never put real myUCalgary credentials in this repository.

## Run locally

Because browsers block `fetch()` from local JSON when HTML is opened with `file://`, run a tiny local server from the repository root:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

VS Code Live Server also works.

## GitHub Pages

1. Push this repository to `main`.
2. In GitHub, open **Settings -> Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select `main` and `/ (root)`.
5. Save.

`index.html` is at the repository root, so no build configuration is required.

## Persistence

The JSON files are read-only seed data on GitHub Pages. Browser actions such as saved jobs are stored in `localStorage`, which means they survive refreshes and browser restarts on that device/browser. They do not sync between devices or users.

To reset the demo completely, clear this site's browser storage.

## Team integration

Implemented working slice:

- Login
- Home
- Job Search
- shared sidebar/navigation
- saved-job persistence
- lightweight Job Details integration shell

The remaining navigation destinations are intentionally included as placeholder routes so links do not break while teammates merge their pages:

- Applications
- Saved Jobs
- Comparison Tool
- Calendar
- My Career Profile

Replace the placeholder page contents when each teammate implementation is ready. Keep the filenames unchanged so navigation continues to work.
