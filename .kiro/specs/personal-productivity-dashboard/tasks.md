# Implementation Plan: Personal Productivity Dashboard

## Overview

The Personal Productivity Dashboard is a browser-based single-page application built with HTML, CSS, and vanilla JavaScript — no frameworks, no build step, no backend. It displays four white cards on a purple gradient background: a Digital Clock with date and dynamic greeting, a Focus Timer, a Task Manager, and a Quick Links panel. All user data (tasks and quick links) persists across sessions via the browser Local Storage API.

The implementation follows the design's layered architecture: each widget module has a pure logic layer (functions with no DOM or storage side effects) and a thin controller layer (DOM ownership, event listeners, intervals, localStorage calls). All modules attach to a shared `window.App` namespace using IIFEs and load as classic `<script>` tags in dependency order so the app runs via `file://` without a server.

## Tasks

- [ ] 1. Create project folder structure
  - Create the root project directory with `css/` and `js/` subdirectories
  - Create `index.html` at the project root
  - Create `css/styles.css` in the `css/` directory
  - Create all JavaScript module files in the `js/` directory: `util.js`, `storage.js`, `clock.js`, `timer.js`, `tasks.js`, `links.js`, `app.js`
  - In each JavaScript file, set up the IIFE pattern that initializes the shared namespace and attaches the module: `window.App = window.App || {};` followed by the module assignment (e.g., `App.Clock = (function() { ... })();`)
  - _Requirements: 7.2 (vanilla JavaScript, no external frameworks or libraries)_

- [ ] 2. Build index.html
  - [ ] 2.1 Create HTML document structure, dashboard grid container, and four card containers
    - Add `<!DOCTYPE html>`, `<html>`, `<head>`, and `<body>` tags
    - In `<head>`: link `css/styles.css`, add `<meta name="viewport" content="width=device-width, initial-scale=1.0">` for responsive layout
    - In `<body>`: add a main grid container `<div class="dashboard">` to hold all cards
    - Add four card containers in DOM order, each with a unique ID and a shared `card` class: clock card (`id="clock-card"`), timer card (`id="timer-card"`), tasks card (`id="tasks-card"`), links card (`id="links-card"`)
    - At the end of `<body>`, include `<script>` tags in dependency order: `js/util.js`, `js/storage.js`, `js/clock.js`, `js/timer.js`, `js/tasks.js`, `js/links.js`, `js/app.js`
    - _Requirements: 5.2 (each widget in a card), 5.4 (no decorative elements beyond gradient, four cards, and their content), 7.2 (HTML and vanilla JavaScript only)_

  - [ ] 2.2 Add widget-specific markup within each card
    - Clock card: add elements for the greeting (e.g., `<p id="greeting">`), time display (e.g., `<h2 id="clock-time">`), and date display (e.g., `<p id="clock-date">`) within the single card
    - Timer card: add a time display element (e.g., `<h2 id="timer-display">`), three button elements with IDs for start (`#timer-start`), pause (`#timer-pause`), and reset (`#timer-reset`), and a hidden completion indication element (e.g., `<span id="timer-complete" class="hidden">Time's up!</span>`)
    - Tasks card: add a text input field (with `maxlength="200"`) and an add button, an empty task list container (e.g., `<ul id="task-list">`), and a status message element (e.g., `<p id="task-status">`) for validation and save-error notifications
    - Links card: add input fields for link name and URL, an add button, an empty links list container (e.g., `<ul id="link-list">`), and a status message element (e.g., `<p id="link-status">`) for save-error notifications
    - _Requirements: 1.8 (greeting, time, date in a single card), 2.1 (default 25:00 display), 2.9 (start, pause, reset controls), 3.1 (input field and add button), 3.4 (list with checkbox and delete button per task), 4.1 (name input, URL input, add button), 4.4 (links as clickable text with delete button)_

- [ ] 3. Build CSS styling and responsive layout
  - [ ] 3.1 Style gradient background, base typography, and card components
    - Set `body` background to a `linear-gradient` transitioning between at least two shades of purple, with `min-height: 100vh` to cover the full viewport
    - Reset default margins and padding; set `box-sizing: border-box` on all elements
    - Apply a single font family across all widgets (e.g., a system font stack or a web-safe sans-serif)
    - Style `.card` with a white background, rounded corners (`border-radius`), internal padding, and a subtle box shadow
    - Apply the same text size to equivalent elements across all cards (e.g., all card titles share one size, all body text another)
    - Style timer buttons, task input, link inputs, and list items to match the clean minimal aesthetic
    - _Requirements: 5.1 (purple gradient background covering full viewport), 5.2 (white card backgrounds), 5.3 (rounded corners and uniform spacing), 5.4 (single font family, consistent text sizes, no decorative elements)_

  - [ ] 3.2 Implement responsive grid layout and widget-specific element styles
    - Set `.dashboard` to `display: grid` with a single column (`grid-template-columns: 1fr`) and a uniform `gap` value for default (mobile) layout
    - Add a media query at `min-width: 768px` setting the grid to two columns (`repeat(2, 1fr)`)
    - Add a media query at `min-width: 1024px` setting the grid to three columns (`repeat(3, 1fr)`) with the clock card spanning full width via `grid-column: 1 / -1`
    - Ensure the layout reflows between single-column and multi-column without requiring a page reload when resizing across the 768px breakpoint
    - Add a completed-task visual style whose rendered property value differs from incomplete tasks (e.g., `text-decoration: line-through` and reduced `opacity`)
    - Style the timer completion indication (e.g., accent color and badge styling), and hide it by default
    - _Requirements: 3.7 (completed tasks have differing visual style), 5.3 (uniform spacing via grid gap), 5.5 (>=1024px at least two columns), 5.6 (<768px single column), 7.4 (mobile single-column), 7.5 (>=768px multi-column at least two columns), 7.6 (reflow without reload)_

- [ ] 4. Implement Digital Clock
  - [ ] 4.1 Implement the clock logic layer in `js/clock.js`
    - Implement `App.Clock.getGreeting(hour)`: return "Good Morning" for hours 5–11, "Good Afternoon" for 12–16, "Good Evening" for 17–20, "Good Night" for 21–23 or 0–4
    - Implement `App.Clock.formatTime(date)`: return 12-hour time as two-digit hours (01–12), two-digit minutes (00–59), and an AM/PM indicator; hour 0 maps to "12 AM", hour 12 maps to "12 PM"
    - Implement `App.Clock.formatDate(date)`: return the full weekday name, full month name, and day-of-month number (e.g., "Monday, January 15"), using the user's local system timezone (default `Date` behavior)
    - These functions must be pure (no DOM access, no side effects)
    - _Requirements: 1.1, 1.2, 1.4, 1.5, 1.6, 1.7, 1.10_

  - [ ] 4.2 Implement the clock controller in `js/clock.js`
    - Implement `App.Clock.init(root)`: render the greeting, time, and date immediately from `new Date()` on first display
    - Start a `setInterval` at 1000 ms that re-renders the greeting, time, and date from `new Date()` each tick so the displayed time never lags the system clock by more than 1 second
    - Recomputing from `new Date()` each tick prevents drift accumulation and self-corrects after background-tab throttling
    - _Requirements: 1.3, 1.8, 1.9, 1.10_

  - [ ]* 4.3 Write unit tests for the clock logic layer
    - Test `getGreeting` for all 24 hours (0–23) to verify each returns the correct greeting with no gaps and no overlaps between ranges
    - Test `formatTime` for midnight (hour 0 → "12 AM"), noon (hour 12 → "12 PM"), and boundary minutes (00, 59)
    - Test `formatDate` returns the expected format with full weekday and month names
    - _Requirements: 1.1–1.7, Correctness Property: Greeting-time consistency_

- [ ] 5. Implement Focus Timer
  - [ ] 5.1 Implement the timer state machine logic layer in `js/timer.js`
    - Define `DEFAULT_DURATION_MS = 25 * 60 * 1000` and the initial idle state `{ status: 'idle', remainingMs: DEFAULT_DURATION_MS, endTime: null }`
    - Implement `App.Timer.formatDuration(totalMs)`: convert a non-negative millisecond value to MM:SS format (e.g., 1500000 → "25:00", 90000 → "01:30", 0 → "00:00")
    - Implement `App.Timer.start(state, now)`: idle/paused → running (set `endTime = now + remainingMs`); running → unchanged (idempotent); completed → unchanged
    - Implement `App.Timer.pause(state, now)`: running → paused (set `remainingMs = max(0, endTime - now)`, set `endTime = null`); other states unchanged
    - Implement `App.Timer.reset(state)`: any state → idle with `remainingMs = DEFAULT_DURATION_MS`, `endTime = null`
    - Implement `App.Timer.tick(state, now)`: running → recompute remaining as `max(0, endTime - now)`; when `now >= endTime` → completed with `remainingMs = 0`; non-running states unchanged
    - These functions must be pure (no DOM access, no side effects, no intervals)
    - _Requirements: 2.1, 2.4, 2.5, 2.6, 2.7, 2.8_

  - [ ] 5.2 Implement the timer controller in `js/timer.js`
    - Implement `App.Timer.init(root)`: render "25:00" initially, query and wire the start, pause, and reset button elements
    - Run a 1000 ms `setInterval` that calls `tick` with the current state and `Date.now()`, then re-renders the display from `formatDuration`
    - Start button: call `start` on click; running state ignores duplicate starts
    - Pause button: call `pause` on click; clears the interval effect while preserving remaining duration
    - Reset button: call `reset` on click; restores "25:00" and hides the completion indication
    - Display the persistent completion indication (e.g., "Time's up!" badge with accent color) while in the completed state; it remains visible until the user clicks reset
    - Ensure start and pause while completed are no-ops; only reset leaves the completed state
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 2.6, 2.9_

  - [ ]* 5.3 Write unit tests for the timer state machine
    - Test `formatDuration` for 0, 90000 (01:30), 1500000 (25:00), and values at minute/second boundaries
    - Test `start` from idle (sets endTime), from paused (resumes), from running (idempotent — unchanged), and from completed (no-op)
    - Test `pause` preserves remaining duration exactly; test `reset` restores 25:00 from any state
    - Test `tick` transitions to completed at 00:00 and the remaining value never goes negative
    - _Requirements: 2.1–2.8, Correctness Properties: Non-negative countdown, Pause preservation, Idempotent start_

- [ ] 6. Implement Task Manager with Local Storage
  - [ ] 6.1 Implement `App.util` module in `js/util.js`
    - Implement `createId()`: return `crypto.randomUUID()` when available in the current context; otherwise fall back to a string built from `Date.now()`, a monotonic counter, and `Math.random()` to guarantee uniqueness
    - Implement `assertUnique(ids)`: return `true` if all IDs in the array differ (helper for testing)
    - _Requirements: 3.10 (each task has a unique identifier)_

  - [ ] 6.2 Implement `App.Storage` module in `js/storage.js`
    - Define `KEYS = { TASKS: 'ppd.tasks', LINKS: 'ppd.links' }` as distinct Local Storage keys
    - Implement `isAvailable()`: probe localStorage with a safe `setItem`/`removeItem` round-trip inside try/catch; return `false` when access throws (e.g., disabled, private mode)
    - Implement `save(key, data)`: `JSON.stringify` the data and call `setItem` inside try/catch; return `{ ok: false, error: 'quota' }` on `QuotaExceededError`, `{ ok: false, error: 'unavailable' }` if storage is not available, `{ ok: true }` on success; never mutate the caller's in-memory data
    - Implement `load(key)`: read the key; `null`/missing → `{ status: 'empty', data: [] }`; valid JSON → `{ status: 'ok', data: parsed }`; `JSON.parse` throw → `{ status: 'corrupt', data: [] }`; storage unavailable → `{ status: 'unavailable', data: [] }`
    - All methods must be side-effect-safe and never throw to callers
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [ ] 6.3 Implement the task logic layer in `js/tasks.js`
    - Define the Task shape: `{ id: string, text: string, completed: boolean }`
    - Implement `App.Tasks.validateText(text)`: return `{ valid: true }` when `text.length` is 1–200 and `text` contains at least one non-whitespace character; return `{ valid: false, reason: 'empty' }` for empty or whitespace-only input; return `{ valid: false, reason: 'tooLong' }` when `text.length > 200`
    - Implement `App.Tasks.createTask(text, idGen)`: build `{ id: idGen(), text, completed: false }` for already-validated text; store text verbatim (do not trim)
    - Implement `App.Tasks.toggleById(list, id)`: return a new list with the matching task's `completed` flag flipped; no match → return the list unchanged
    - Implement `App.Tasks.deleteById(list, id)`: return a new list excluding the matching task; no match → return the list unchanged
    - These functions must be pure (no DOM access, no storage access, no side effects)
    - _Requirements: 3.2, 3.3, 3.5, 3.6, 3.7, 3.10, 3.11_

  - [ ] 6.4 Implement the task controller in `js/tasks.js`
    - Implement `App.Tasks.init(root, storage)`: on load, call `storage.load(KEYS.TASKS)`; on `empty`/`corrupt`/`unavailable` start with `[]`; on `corrupt` show a status message indicating stored data could not be restored
    - Render the task list: each task displays a completion checkbox, the task text, and a delete button; completed tasks get the differing visual style (line-through and reduced opacity via CSS class)
    - On add button click: read the input value, call `validateText`; `tooLong` → leave the list unchanged and show an indication that the text exceeds the maximum length; `empty` → leave the list unchanged with no indication; valid → `createTask`, append to the list, call `storage.save(KEYS.TASKS, list)`, re-render
    - On checkbox click: call `toggleById`, call `storage.save`, re-render
    - On delete button click: call `deleteById`, call `storage.save`, re-render
    - When `storage.save` returns `{ ok: false }`: retain the in-memory list and show a status message that the most recent changes could not be saved
    - If no saved task list exists in Local Storage on load, display an empty task list
    - _Requirements: 3.1, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.11, 3.12, 6.3, 6.4, 6.6, 6.7_

  - [ ]* 6.5 Write unit tests for the task logic layer
    - Test `validateText` with empty string, whitespace-only string, valid text, exactly 200 characters (valid), and 201 characters (tooLong)
    - Test `createTask` produces a task with a unique ID, the exact entered text, and `completed: false`
    - Test `toggleById` flips completion status; toggling an already-complete task leaves it complete (idempotent)
    - Test `deleteById` reduces the list length by exactly one; deleting a non-existent ID leaves the list unchanged
    - Test `assertUnique` on IDs generated by many `createId` calls to verify uniqueness
    - _Requirements: 3.2, 3.3, 3.5, 3.6, 3.10, 3.11, Correctness Properties: Idempotent completion, Delete-count, Unique ID_

  - [ ]* 6.6 Write unit tests for the storage module
    - Test `save` then `load` round-trip produces equivalent data for valid task and link lists
    - Test `load` returns `{ status: 'empty', data: [] }` for a missing or null key
    - Test `load` returns `{ status: 'corrupt', data: [] }` when the stored value is invalid JSON
    - Test `save` returns `{ ok: false, error: 'quota' }` when `QuotaExceededError` is thrown (mock the storage)
    - Test `isAvailable` returns `false` when `setItem` throws
    - _Requirements: 6.1–6.7, Correctness Properties: Serialization round-trip, Empty initialization, Corrupted data recovery, Storage failure_

- [ ] 7. Implement Quick Links with Local Storage
  - [ ] 7.1 Implement the links logic layer in `js/links.js`
    - Define the QuickLink shape: `{ id: string, name: string, url: string }`
    - Implement `App.Links.validateLink(name, url)`: return `{ valid: true }` when `name` is 1–100 characters with at least one non-whitespace character AND `url` is 1–2048 characters with at least one non-whitespace character; otherwise return `{ valid: false }`
    - Implement `App.Links.createLink(name, url, idGen)`: build `{ id: idGen(), name, url }` for validated input; store values verbatim
    - Implement `App.Links.normalizeUrl(url)`: if `url` does not match a scheme pattern (`/^[a-z][a-z0-9+.-]*:/i`), prepend `https://`; otherwise return `url` unchanged
    - Implement `App.Links.deleteById(list, id)`: return a new list excluding the matching link; no match → return the list unchanged
    - These functions must be pure (no DOM access, no storage access, no side effects)
    - _Requirements: 4.2, 4.3, 4.6, 4.11_

  - [ ] 7.2 Implement the links controller in `js/links.js`
    - Implement `App.Links.init(root, storage)`: on load, call `storage.load(KEYS.LINKS)`; on `empty`/`corrupt`/`unavailable` start with `[]`; on `corrupt`/`unavailable` show a status message indicating the saved list could not be restored
    - Render each link as clickable name text and a delete button
    - On link name click: open `normalizeUrl(url)` in a new browser tab via `window.open(url, '_blank', 'noopener,noreferrer')`
    - On add button click: read name and URL inputs, call `validateLink`; invalid → leave the list unchanged with no indication shown; valid → `createLink`, append to the list, call `storage.save(KEYS.LINKS, list)`, re-render
    - On delete button click: call `deleteById`, call `storage.save`, re-render
    - When `storage.save` returns `{ ok: false }`: retain the in-memory list and show a status message that the save was not completed
    - If no saved list exists or cannot be read on load, display an empty Quick_Link list
    - _Requirements: 4.1, 4.3, 4.4, 4.5, 4.7, 4.8, 4.9, 4.10_

  - [ ]* 7.3 Write unit tests for the links logic layer
    - Test `validateLink` with valid name+URL, empty name, empty URL, whitespace-only fields, name over 100 characters, and URL over 2048 characters
    - Test `createLink` produces a link with a unique ID and the exact entered values
    - Test `normalizeUrl` prepends `https://` for bare hostnames (e.g., "github.com" → "https://github.com") and leaves schemed URLs unchanged (e.g., "https://example.com" → "https://example.com")
    - Test `deleteById` removes the matching link; deleting a non-existent ID leaves the list unchanged
    - _Requirements: 4.2, 4.3, 4.6, 4.11, Correctness Properties: Idempotent delete, Unique ID_

- [ ] 8. Integrate all components
  - [ ] 8.1 Implement the app entry point in `js/app.js`
    - Add a `DOMContentLoaded` event listener as the application entry point
    - Probe storage availability via `App.Storage.isAvailable()`
    - Resolve each card root element from the DOM by its ID (e.g., `document.getElementById('clock-card')`)
    - Initialize each module by calling its `init` function with the corresponding root: `App.Clock.init(clockRoot)`, `App.Timer.init(timerRoot)`, `App.Tasks.init(tasksRoot)`, `App.Links.init(linksRoot)`
    - Wrap each module initialization in its own `try/catch` so a failure in one widget does not prevent the others from initializing
    - _Requirements: 7.3 (operate entirely in the browser without a backend server), all requirement areas wired together_

  - [ ] 8.2 Verify script load order and namespace wiring
    - Confirm all `<script>` tags in `index.html` are included in dependency order: `util.js`, `storage.js`, `clock.js`, `timer.js`, `tasks.js`, `links.js`, `app.js`
    - Confirm each module correctly attaches to `window.App` and all cross-module references resolve at runtime (e.g., `App.util.createId` called from `tasks.js` and `links.js`, `App.Storage` called from `tasks.js` and `links.js`)
    - Confirm no ES module imports are used (classic scripts only) so the app works when opened via `file://`
    - _Requirements: 7.2 (vanilla JavaScript, no external frameworks or libraries), 7.3 (no backend server)_

- [ ] 9. Checkpoint - Verify the application works locally
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability to the requirements and design documents
- The application uses only HTML, CSS, and vanilla JavaScript with no frameworks, build step, or backend server
- All modules use the shared `window.App` namespace via IIFEs and classic `<script>` tags so the app runs by double-clicking `index.html` (works via `file://`)
- Pure logic functions (greeting, formatting, timer transitions, validation, list mutations) are separated from DOM/storage controllers to enable unit testing
- The `App.Storage` module is the only code that touches `window.localStorage`; task and link controllers depend on it
- Storage failures (quota exceeded, corrupt data, unavailability) degrade gracefully: in-memory data is retained and the user is notified via inline status messages scoped to the affected card
- The Focus Timer tracks an absolute `endTime` timestamp rather than decrementing a counter, keeping it accurate and self-correcting after background-tab throttling
- Task and link IDs use `crypto.randomUUID()` when available, with a fallback generator for non-secure contexts (`file://`)
- The design document does not include a Correctness Properties section; property-based testing is not specified for this feature. Unit tests verify specific examples, edge cases, and error conditions derived from the correctness properties listed in the requirements document.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2"] },
    { "id": 3, "tasks": ["3.1"] },
    { "id": 4, "tasks": ["3.2"] },
    { "id": 5, "tasks": ["4.1"] },
    { "id": 6, "tasks": ["4.2"] },
    { "id": 7, "tasks": ["4.3", "5.1"] },
    { "id": 8, "tasks": ["5.2"] },
    { "id": 9, "tasks": ["5.3", "6.1", "6.2"] },
    { "id": 10, "tasks": ["6.3", "6.6"] },
    { "id": 11, "tasks": ["6.4"] },
    { "id": 12, "tasks": ["6.5", "7.1"] },
    { "id": 13, "tasks": ["7.2"] },
    { "id": 14, "tasks": ["7.3", "8.1"] },
    { "id": 15, "tasks": ["8.2"] },
    { "id": 16, "tasks": ["9"] }
  ]
}
```
