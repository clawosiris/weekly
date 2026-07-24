# Weekly Checklist Dashboard PRD

## Overview

Weekly is a responsive web dashboard for planning recurring tasks across a week, checking them off per day, and seeing completion trends at a glance. The first version is aimed at Nora's personal planning workflow, with enough structure to grow into a small multi-user or open source product later.

This PRD is based on the requested dashboard concept and the local prototype in `tmp/weekly-dashboard`. The UI sketch is original and intentionally does not reproduce the provided reference image.

## Goals

- Let a user define reusable task definitions.
- Let a user map each task to one or more days of the week.
- Let a user check off scheduled tasks on each day.
- Let a user define habits separately from tasks.
- Let a user map and check off habits in a dedicated habit tracker.
- Show daily and weekly completion aggregation.
- Work well in a desktop browser and on a mobile phone.
- Keep the first version simple enough to run as a local-first web app.

## Non-Goals

- Calendar integrations in the MVP.
- Multi-account login in the MVP.
- Push notifications in the MVP.
- Complex habit analytics, streak scoring, or coaching in the MVP.
- Exact visual reproduction of any reference image.

## Target Users

- Primary: Nora, using the dashboard to manage weekly routines, personal tasks, health tasks, and day-specific checklists.
- Secondary: a future self-hosted or open source user who wants a lightweight weekly task mapper.

## Core User Stories

- As a user, I can add a new task definition so that it appears in the weekly mapper.
- As a user, I can choose which days a task belongs to.
- As a user, I can remove a task definition I no longer need.
- As a user, I can check off tasks for the current day.
- As a user, I can add habits without mixing them into my day-card task counts.
- As a user, I can map habits to weekdays and check them off in a separate habit tracker.
- As a user, I can change weeks and keep separate completion state by date.
- As a user, I can see weekly completion percentage and completed count.
- As a user, I can see completion by day to understand where I am falling behind.
- As a mobile user, I can complete the same workflows without horizontal scrolling through the main checklist.

## MVP Scope

### Dashboard View

- Week selector with previous week, date input, and next week controls.
- Weekly completion summary:
  - completed scheduled items
  - total scheduled items
  - completion percentage
- Day cards for Monday through Sunday.
- Each day card shows:
  - day name
  - date
  - day completion percentage
  - completed count
  - checklist items scheduled for that day
- Checking or unchecking a task immediately updates the dashboard and persistence layer.
- Habit tracker section:
  - weekly habit progress bar chart
  - one row per habit
  - one checkbox per mapped weekday
  - skipped days shown as inactive
  - habit completion stored separately from task completion

### Mapper View

- Add task form:
  - task name
  - category
  - selected days
- Task definition list or matrix:
  - one row per task
  - one toggle per weekday
  - edit action per task
  - delete action per task
- Updating mapped days changes future dashboard rendering for the selected week.
- Editing a task lets the user change its name, category, and mapped days without losing existing completion history.
- Deleting a task removes it from the mapper and checklists.
- Add habit form:
  - habit name
  - selected days
- Habit definition list or matrix:
  - one row per habit
  - one toggle per weekday
  - edit action per habit
  - delete action per habit
- Updating mapped habit days changes the dashboard habit tracker without changing task counts.
- Editing a habit lets the user change its name and mapped days without losing existing habit completion history.
- Deleting a habit removes it from the habit mapper and habit tracker.

### Aggregation

- Weekly completion:
  - sum of all completed scheduled task instances for the visible week
  - divided by all scheduled task instances for the visible week
- Daily completion:
  - completed scheduled tasks for the day
  - divided by scheduled tasks for the day
- Optional MVP visualization:
  - weekly donut or progress ring
  - daily bar chart
  - habit progress bar chart
  - compact task-by-day matrix preview

### Persistence

- MVP can use browser localStorage.
- State shape should be easy to migrate later:

```json
{
  "weekStart": "2026-07-20",
  "tasks": [
    {
      "id": "task-water",
      "name": "Drink water with each meal",
      "category": "Health",
      "days": [0, 1, 2, 3, 4, 5, 6]
    }
  ],
  "habits": [
    {
      "id": "habit-water",
      "name": "Drink water",
      "days": [0, 1, 2, 3, 4, 5, 6]
    }
  ],
  "completions": {
    "2026-07-20": {
      "task-water": true
    }
  },
  "habitCompletions": {
    "2026-07-20": {
      "habit-water": true
    }
  }
}
```

## Functional Requirements

- The app must normalize the selected week to Monday as the start of week.
- The app must support all seven days of the week.
- A task can be mapped to zero, one, or multiple days.
- A habit can be mapped to zero, one, or multiple days.
- If a newly created task has no selected days, the app should either:
  - default it to all seven days, or
  - require at least one selected day before submit.
- If a newly created habit has no selected days, the app should either:
  - default it to all seven days, or
  - require at least one selected day before submit.
- Task names must be required and trimmed.
- Task names should support at least 80 characters.
- Habit names must be required and trimmed.
- Habit names should support at least 80 characters.
- Delete actions must remove old completion records for the deleted task.
- Edit actions must preserve the existing task ID and completion records.
- Habit delete actions must remove old completion records for the deleted habit.
- Habit edit actions must preserve the existing habit ID and completion records.
- Completion state must be date-specific, not only weekday-specific.
- Task and habit completion state must be stored separately.
- The dashboard must update immediately after task, habit, mapping, or completion changes.
- The mobile layout must preserve the same core actions:
  - navigate weeks
  - switch views
  - check off daily tasks
  - check off habits
  - add tasks
  - add habits
  - edit task names and categories
  - edit habit names
  - edit mapped days
  - delete tasks
  - delete habits

## UX Requirements

- The dashboard should feel like a practical planner, not a marketing page.
- Desktop should prioritize scanability:
  - summary metrics at top
  - habit tracker as its own dashboard section
  - day cards below
  - separate task and habit mapper matrices for efficient editing
- Mobile should prioritize completion:
  - week controls first
  - summary second
  - day cards stacked in order
  - mapper controls stacked and touch-friendly
- Controls should be visible and obvious:
  - icon buttons for week navigation
  - tabs for Dashboard and Mapper
  - checkboxes or toggles for mapped days
  - edit button/action for task name and category changes
  - edit button/action for habit name changes
  - delete icon/button for task removal
- Empty states should be clear:
  - no tasks yet
  - no tasks mapped to this day
- The app should avoid using the original reference image directly.

## Original UI Sketch

See `ui-sketch.html` for a standalone visual wireframe.

### Desktop Sketch

```text
+------------------------------------------------------------------------+
| Weekly                                  [<] [ Week of Jul 20 ] [>]     |
+------------------------------------------------------------------------+
| [ Dashboard ] [ Mapper ]                                                |
+------------------------------------------------------------------------+
| +----------------+ +----------------------+ +------------------------+  |
| | Weekly         | | Completion by Day    | | Weekly Matrix          |  |
| | 68%            | | Mon |||||||          | | Task       M T W T F S |  |
| | 43 / 63 done   | | Tue ||||||           | | Water      x x x x x x |  |
| +----------------+ +----------------------+ +------------------------+  |
|                                                                        |
| +----------+ +----------+ +----------+ +----------+ +----------+       |
| | Monday   | | Tuesday  | | Wednesday| | Thursday | | Friday   |       |
| | 5/7 done | | 4/7 done | | 6/8 done | | 3/7 done | | 6/7 done |       |
| | [x] Walk | | [ ] Walk | | [x] Walk | | [x] Walk | | [x] Walk |       |
| | [x] Meal | | [x] Meal | | [ ] Meal | | [ ] Meal | | [x] Meal |       |
| +----------+ +----------+ +----------+ +----------+ +----------+       |
| +----------+ +----------+                                             |
| | Saturday | | Sunday   |                                             |
| +----------+ +----------+                                             |
+------------------------------------------------------------------------+
```

### Mobile Sketch

```text
+--------------------------+
| Weekly                   |
| [<] Week of Jul 20 [>]   |
+--------------------------+
| [ Dashboard ] [ Mapper ] |
+--------------------------+
| Weekly Progress          |
| 68%    43 / 63 done      |
+--------------------------+
| Monday        5/7 done   |
| [x] Walk                 |
| [x] Drink water          |
| [ ] Stretch              |
+--------------------------+
| Tuesday       4/7 done   |
| [ ] Walk                 |
| [x] Drink water          |
| [x] Review priorities    |
+--------------------------+
| ...                      |
+--------------------------+
```

## Data Model

### Task

- `id`: stable string identifier.
- `name`: user-visible task title.
- `category`: optional grouping label.
- `days`: weekday indexes where Monday is `0` and Sunday is `6`.

### Habit

- `id`: stable string identifier.
- `name`: user-visible habit title.
- `days`: weekday indexes where Monday is `0` and Sunday is `6`.

### Completion

- Keyed by ISO date string.
- Contains task IDs completed on that date.

### Habit Completion

- Keyed by ISO date string.
- Contains habit IDs completed on that date.

### Derived Metrics

- `scheduledTasksForDay = tasks where task.days includes weekdayIndex`
- `dayDone = scheduledTasksForDay completed for ISO date`
- `dayPercent = dayDone / scheduledTasksForDay.length`
- `weekPercent = sum(dayDone) / sum(scheduledTasksForDay.length)`
- `scheduledHabitsForDay = habits where habit.days includes weekdayIndex`
- `habitDayDone = scheduledHabitsForDay completed for ISO date`
- `habitDayPercent = habitDayDone / scheduledHabitsForDay.length`

## Acceptance Criteria

- A user can add a task and immediately see it in the mapper.
- A user can map that task to selected days and immediately see it on those day cards.
- A user can edit an existing task's name, category, and mapped days without losing previous checkoffs.
- A user can check off a mapped task and see day and week completion update.
- A user can delete a task and no longer see it in any day checklist or mapper row.
- A user can add a habit and immediately see it in the habit mapper and dashboard habit tracker.
- A user can map that habit to selected days without changing task counts.
- A user can edit an existing habit's name and mapped days without losing previous habit checkoffs.
- A user can check off a mapped habit and preserve that habit state by date.
- A user can delete a habit and no longer see it in the habit mapper or habit tracker.
- Refreshing the browser preserves tasks, habits, mapped days, selected week, and completions.
- Switching to a different week shows completion state for that specific week.
- The app is usable at desktop width and at phone width.
- The UI sketch is original and not a copy of the supplied reference image.

## Future Enhancements

- Named templates, such as "work week", "recovery week", or "travel week".
- Drag and drop ordering for task definitions and day checklists.
- Task notes, links, or time-of-day hints.
- Export/import JSON backup.
- Optional cloud sync.
- User accounts and sharing.
- Calendar export or integration.
- Streaks and trend charts.
- PWA install support.

## Open Questions

- Should task definitions be global across all weeks, or should each week be able to customize its own task list?
- Should deleting a task erase historical completions, archive the task, or hide it from future weeks only?
- Should categories be editable user-defined labels?
- Should the app support Sunday-start weeks as a setting?
- Should mobile mapper use a table, stacked task rows, or a dedicated edit screen per task?
