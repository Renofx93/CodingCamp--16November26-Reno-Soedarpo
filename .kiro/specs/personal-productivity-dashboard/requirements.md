# Requirements Document

## Introduction

The Personal Productivity Dashboard is a browser-based single-page application built with HTML, CSS, and vanilla JavaScript. It provides users with a centralized interface containing a digital clock with a dynamic greeting, a focus timer, a task manager, and a quick links panel. All user data persists locally in the browser via the Local Storage API, requiring no backend server. The dashboard features a purple gradient background with white dashboard cards, a clean minimal interface, and a responsive layout supporting both desktop and mobile devices across Chrome, Firefox, Edge, and Safari. The visual layout shall follow the user-provided reference image as closely as possible; specific layout details will be resolved in the design phase.

## Glossary

- **Dashboard**: The main application interface that contains all productivity widgets
- **Digital_Clock**: The component that displays the current time and date
- **Focus_Timer**: The countdown timer component used for focus sessions
- **Task_Manager**: The component that allows users to create, complete, and delete tasks
- **Quick_Links**: The component that stores and displays user-saved website shortcuts
- **Local_Storage**: The browser's Local Storage API used for persistent data storage
- **Task**: A user-created to-do item with a text description and a completion status
- **Quick_Link**: A saved shortcut containing a display name and a target URL
- **Greeting**: A time-based salutation displayed alongside the clock
- **Focus_Session**: A single countdown period of the Focus_Timer
- **User**: The person interacting with the Dashboard

## Requirements

### Requirement 1: Digital Clock with Date and Dynamic Greeting

**User Story:** As a user, I want to see the current time, date, and a contextual greeting, so that I have an at-a-glance awareness of the time of day when I open the dashboard.

#### Acceptance Criteria

1. THE Digital_Clock SHALL display the current time in 12-hour format with hours shown as two digits (01 through 12), minutes shown as two digits (00 through 59), and an AM/PM indicator.
2. THE Digital_Clock SHALL display the current date as the full weekday name, followed by the full month name, followed by the day-of-month number.
3. THE Digital_Clock SHALL update the displayed time at intervals of no more than 1 second such that the displayed time never lags the system clock by more than 1 second.
4. WHILE the current hour is in the range 5 through 11, THE Digital_Clock SHALL display the greeting "Good Morning".
5. WHILE the current hour is in the range 12 through 16, THE Digital_Clock SHALL display the greeting "Good Afternoon".
6. WHILE the current hour is in the range 17 through 20, THE Digital_Clock SHALL display the greeting "Good Evening".
7. WHILE the current hour is in the range 21 through 23 or 0 through 4, THE Digital_Clock SHALL display the greeting "Good Night".
8. THE Digital_Clock SHALL display the greeting, time, and date within a single dashboard card.
9. WHEN the dashboard card is first displayed, THE Digital_Clock SHALL display the current time, date, and greeting corresponding to the system clock at that moment.
10. THE Digital_Clock SHALL use the user's local system timezone for the current time, date, and hour.

#### Correctness Properties

1. **Greeting-time consistency property**: For all valid hours of the day (0 through 23) in the user's local system timezone, the displayed greeting matches exactly one expected time-of-day range with no gaps and no overlaps.

### Requirement 2: Focus Timer

**User Story:** As a user, I want a countdown timer with a default 25-minute duration, so that I can run structured focus sessions.

#### Acceptance Criteria

1. THE Focus_Timer SHALL initialize with a default duration of 25 minutes displayed in MM:SS format as "25:00".
2. WHEN the User clicks the start button, THE Focus_Timer SHALL begin counting down from the current remaining duration.
3. WHEN the User clicks the pause button, THE Focus_Timer SHALL stop counting down and retain the remaining duration.
4. WHEN the User clicks the reset button, THE Focus_Timer SHALL restore the duration to 25:00 and stop counting down.
5. WHILE the Focus_Timer is counting down, THE Focus_Timer SHALL display the remaining duration in MM:SS format, updating every second.
6. WHEN the Focus_Timer reaches 00:00, THE Focus_Timer SHALL stop counting down, display "00:00", and present a visible completion indication that remains until the User clicks the reset button.
7. WHILE the Focus_Timer is paused, THE Focus_Timer SHALL preserve the remaining duration exactly.
8. IF the User clicks the start button while the Focus_Timer is already running, THEN THE Focus_Timer SHALL ignore the duplicate start action.
9. THE Focus_Timer SHALL provide start, pause, and reset controls.

#### Correctness Properties

1. **Non-negative countdown property**: For all countdown states, the displayed remaining duration is greater than or equal to 00:00 and never goes negative.
2. **Pause preservation property**: Pausing then resuming the Focus_Timer preserves the same total elapsed countdown as running continuously.
3. **Idempotent start property**: Clicking start multiple times while the Focus_Timer is running produces the same remaining duration as clicking start once.

### Requirement 3: Task Manager

**User Story:** As a user, I want to add, complete, and delete tasks, so that I can track my to-do items within the dashboard.

#### Acceptance Criteria

1. THE Task_Manager SHALL display an input field and an add button for creating new Tasks.
2. WHEN the User enters text of at most 200 characters that contains at least one non-whitespace character and clicks the add button, THE Task_Manager SHALL create a new Task with the entered text and an incomplete completion status.
3. WHEN the User clicks the add button with an input field that is empty or contains only whitespace characters, THE Task_Manager SHALL leave the Task list unchanged.
4. THE Task_Manager SHALL display all Tasks in a list, each with a completion checkbox and a delete button.
5. WHEN the User clicks the completion checkbox of a Task, THE Task_Manager SHALL toggle the completion status of that Task.
6. WHEN the User clicks the delete button of a Task, THE Task_Manager SHALL remove that Task from the list.
7. THE Task_Manager SHALL display completed Tasks with at least one visual style property whose rendered value differs from the same property applied to incomplete Tasks.
8. WHEN a Task is created, completed, or deleted, THE Task_Manager SHALL save the current Task list to Local_Storage.
9. WHEN the Dashboard loads, THE Task_Manager SHALL load the saved Task list from Local_Storage and display it.
10. EACH Task SHALL have a unique identifier.
11. IF the User enters text exceeding 200 characters and clicks the add button, THEN THE Task_Manager SHALL not create a Task and SHALL indicate that the Task text exceeds the maximum allowed length.
12. IF no saved Task list exists in Local_Storage when the Dashboard loads, THEN THE Task_Manager SHALL display an empty Task list.

#### Correctness Properties

1. **Round-trip persistence property**: For all valid Task lists, loading from Local_Storage after saving produces a Task list equivalent to the original.
2. **Idempotent completion property**: Completing a Task that is already complete leaves the Task complete with no additional effect.
3. **Delete-count property**: Deleting a Task reduces the total number of Tasks by exactly one; deleting a non-existent Task leaves the list unchanged.
4. **Unique ID property**: For all Task lists, every Task has a unique identifier across the list.

### Requirement 4: Quick Links

**User Story:** As a user, I want to save, open, and delete website shortcuts, so that I can quickly access frequently used sites from the dashboard.

#### Acceptance Criteria

1. THE Quick_Links SHALL display input fields for a link name and a URL, and an add button.
2. WHEN the User enters a name of 1 to 100 characters and a URL of 1 to 2048 characters and clicks the add button, THE Quick_Links SHALL create a new Quick_Link with the entered values.
3. WHEN the User clicks the add button with an empty name field, an empty URL field, a whitespace-only name field, a whitespace-only URL field, a name exceeding 100 characters, or a URL exceeding 2048 characters, THE Quick_Links SHALL leave the Quick_Link list unchanged.
4. THE Quick_Links SHALL display all saved Quick_Links, each showing the link name as clickable text and a delete button.
5. WHEN the User clicks a Quick_Link, THE Dashboard SHALL open the link URL in a new browser tab.
6. WHEN the User clicks the delete button of a Quick_Link, THE Quick_Links SHALL remove that Quick_Link from the list.
7. WHEN a Quick_Link is created or deleted, THE Quick_Links SHALL save the current list to Local_Storage.
8. IF saving the current list to Local_Storage fails, THEN THE Quick_Links SHALL retain the current list in memory and display a visible indication that the save was not completed.
9. WHEN the Dashboard loads, THE Quick_Links SHALL load the saved list from Local_Storage and display it.
10. IF no saved list exists in Local_Storage or the saved list cannot be read, THEN THE Quick_Links SHALL display an empty Quick_Link list.
11. EACH Quick_Link SHALL have a unique identifier.

#### Correctness Properties

1. **Round-trip persistence property**: For all valid Quick_Link lists, loading from Local_Storage after saving produces a Quick_Link list equivalent to the original.
2. **Idempotent delete property**: Deleting a Quick_Link that does not exist leaves the remaining list unchanged.
3. **Unique ID property**: For all Quick_Link lists, every Quick_Link has a unique identifier across the list.

### Requirement 5: Visual Design and Layout

**User Story:** As a user, I want a clean, minimal dashboard with a purple gradient background and white cards, so that the interface is visually appealing and easy to use.

#### Acceptance Criteria

1. THE Dashboard SHALL display a purple gradient background covering the full viewport and transitioning between at least two shades of purple.
2. THE Dashboard SHALL display each widget (Digital_Clock, Focus_Timer, Task_Manager, Quick_Links) within a card that has a white background.
3. THE Dashboard SHALL display cards with rounded corners and uniform spacing between adjacent cards within the same grid row and column.
4. THE Dashboard SHALL use a single font family across all widgets, apply the same text size to equivalent elements across all cards, and display no decorative elements beyond the gradient background, the four widget cards, and their content.
5. WHILE the Dashboard is viewed on a screen width of 1024 pixels or greater, THE Dashboard SHALL arrange the cards in a grid of at least two columns.
6. WHILE the Dashboard is viewed on a screen width less than 768 pixels, THE Dashboard SHALL arrange the cards in a single column.

### Requirement 6: Data Persistence

**User Story:** As a user, I want my tasks and quick links to persist between sessions, so that I do not lose my data when I close or reload the browser.

#### Acceptance Criteria

1. WHEN Task data is created, modified, or deleted, THE Dashboard SHALL store all Task data in Local_Storage as serialized JSON.
2. WHEN Quick_Link data is created, modified, or deleted, THE Dashboard SHALL store all Quick_Link data in Local_Storage as serialized JSON.
3. WHEN the Dashboard loads, THE Dashboard SHALL deserialize and restore all persisted Task and Quick_Link data.
4. IF Local_Storage contains no saved data, THEN THE Dashboard SHALL initialize with empty Task and Quick_Link lists.
5. THE Dashboard SHALL use distinct Local_Storage keys for Tasks and for Quick_Links.
6. IF persisted Task or Quick_Link data in Local_Storage cannot be parsed as valid JSON, THEN THE Dashboard SHALL initialize the affected list as empty and indicate to the user that the stored data could not be restored.
7. IF storing Task or Quick_Link data to Local_Storage fails due to storage quota being exceeded, THEN THE Dashboard SHALL retain the current in-session data in memory and indicate to the user that the most recent changes could not be saved.

#### Correctness Properties

1. **Serialization round-trip property**: For all valid Task and Quick_Link data, serializing to JSON and deserializing back produces data equivalent to the original.
2. **Empty initialization property**: When Local_Storage contains no data, the Dashboard initializes empty Task and Quick_Link lists without error.
3. **Corrupted data recovery property**: When persisted data cannot be parsed as valid JSON, the affected list initializes empty and the user is notified, without preventing the unaffected list from loading.
4. **Storage failure property**: When Local_Storage quota is exceeded during a save, in-session data is retained in memory and the user is notified that changes could not be saved.

### Requirement 7: Browser Compatibility and Responsiveness

**User Story:** As a user, I want the dashboard to work across major browsers and adapt to my screen size, so that I can use it on any device.

#### Acceptance Criteria

1. THE Dashboard SHALL render all content elements visible without overlap, truncation, or horizontal scrolling, and provide interactive elements that respond to user input without unhandled errors, in Google Chrome, Mozilla Firefox, Microsoft Edge, and Apple Safari.
2. THE Dashboard SHALL use only HTML, CSS, and vanilla JavaScript without external frameworks or libraries.
3. THE Dashboard SHALL operate entirely in the browser without a backend server.
4. WHILE the viewport width is less than 768 pixels, THE Dashboard SHALL switch to a mobile single-column layout.
5. WHILE the viewport width is 768 pixels or greater, THE Dashboard SHALL use a multi-column desktop layout with at least two columns.
6. WHEN the viewport is resized across the 768-pixel breakpoint, THE Dashboard SHALL update its layout between single-column and multi-column without requiring a page reload.
