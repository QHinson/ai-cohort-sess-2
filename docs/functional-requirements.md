# Functional Requirements

## Overview

This document defines the functional requirements for the todo application. The app should allow users to create, manage, and track tasks, including support for scheduling tasks on future dates, assigning priorities, and editing existing tasks.

## Core Task Management

### FR-1 Create Tasks
- The system shall allow a user to create a new task.
- The system shall require a task title when creating a task.
- The system may allow an optional task description.

### FR-2 View Tasks
- The system shall display a list of all saved tasks.
- The system shall show each task's title, status, scheduled date when present, and priority when present.

### FR-3 Complete Tasks
- The system shall allow a user to mark a task as completed.
- The system shall allow a user to change a completed task back to incomplete.

### FR-4 Delete Tasks
- The system shall allow a user to delete an existing task.

## Scheduling

### FR-5 Schedule Tasks for Future Dates
- The system shall allow a user to assign a date to a task.
- The system shall allow the assigned date to be a future date.
- The system shall store and display the scheduled date for each dated task.
- The system shall allow a user to clear or change the scheduled date of an existing task.

## Priority Management

### FR-6 Assign Priorities
- The system shall allow a user to assign a priority level to a task.
- The system shall support at least three priority levels: low, medium, and high.
- The system shall display the selected priority for each task.

## Editing

### FR-7 Edit Existing Tasks
- The system shall allow a user to edit an existing task.
- The system shall allow a user to update the task title.
- The system shall allow a user to update the task description when one exists.
- The system shall allow a user to update the task's scheduled date.
- The system shall allow a user to update the task's priority.

## Validation and Usability

### FR-8 Input Validation
- The system shall prevent creating or saving a task without a title.
- The system shall provide feedback when required task information is missing or invalid.

### FR-9 Task State Persistence
- The system shall persist task data so tasks remain available after the application is refreshed or restarted.

### FR-10 Task Organization
- The system shall present completed and incomplete states clearly.
- The system should support ordering or grouping tasks by scheduled date or priority to improve usability.