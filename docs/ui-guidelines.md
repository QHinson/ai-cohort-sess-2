# UI Guidelines

## Overview

This document defines the core UI design guidelines for the todo application. The interface should use Material-style components, a dark visual theme, and a color system centered on purple and teal.

## Design Goals

- Provide a clean, modern interface that feels calm and easy to scan.
- Favor clarity and usability over decorative complexity.
- Maintain a dark color scheme to reduce eye strain during extended use.
- Keep interactions consistent across task creation, editing, scheduling, and prioritization workflows.

## Component System

- The UI should use Material components as the primary design system.
- Shared interface patterns should favor standard Material behaviors for forms, dialogs, buttons, cards, menus, and alerts.
- Custom styling should extend Material components rather than replace them with inconsistent patterns.
- New UI work should prefer reusable themed components over one-off styles.

## Color System

### Primary Color
- Purple shall be the primary brand and interaction color.
- Purple should be used for primary actions, selected states, active navigation, and key emphasis.

Recommended primary palette:
- Primary main: `#7E57C2`
- Primary light: `#B085F5`
- Primary dark: `#4D2C91`

### Secondary Color
- Teal shall be the secondary accent color.
- Teal should be used for supporting highlights, secondary actions, chips, and informational accents.

Recommended secondary palette:
- Secondary main: `#26A69A`
- Secondary light: `#64D8CB`
- Secondary dark: `#00766C`

### Dark Theme Foundations
- The default application theme shall use a dark color scheme.
- Background surfaces should use dark neutrals with sufficient contrast against text and controls.
- Elevated surfaces should be visually distinct without becoming overly bright.

Recommended dark neutrals:
- App background: `#121212`
- Primary surface: `#1E1E1E`
- Secondary surface: `#2A2A2A`
- Divider or border: `#3A3A3A`
- Primary text: `#F5F5F5`
- Secondary text: `#BDBDBD`

## Typography

- Typography should follow Material hierarchy for page titles, section headings, body text, labels, and helper text.
- Text should remain high contrast against dark backgrounds.
- Font sizes and weights should emphasize readability first, especially for task titles, dates, and priority labels.

## Layout and Spacing

- Layouts should use clear spacing between sections, controls, and task items.
- Task lists should be easy to scan on both desktop and mobile screens.
- Forms for creating and editing tasks should group related fields clearly, including title, description, date, and priority.
- Important actions should remain visually prominent without overcrowding the screen.

## Task Presentation

- Each task item should clearly show title, completion state, scheduled date when present, and priority.
- Priority should have a visible indicator that fits the purple and teal theme without relying on color alone.
- Completed tasks should remain readable but visually de-emphasized.
- Editing a task should feel consistent with task creation, using the same field structure and validation patterns.

## Interaction Patterns

- Primary buttons should use the primary purple styling.
- Secondary or supporting actions may use teal styling where appropriate.
- Forms should use Material input components with consistent labels, helper text, and validation messaging.
- Destructive actions such as delete should remain visually distinct from primary and secondary theme colors.
- Dialogs, snackbars, and inline alerts should use consistent placement and behavior across the app.

## Accessibility and Usability

- Text and UI controls shall meet accessible contrast expectations within the dark theme.
- Interactive elements shall have clear hover, focus, active, and disabled states.
- The interface shall remain usable via keyboard navigation.
- Status, priority, and validation feedback should not depend on color alone.

## Implementation Guidance

- The frontend should define shared theme tokens for color, spacing, typography, and component states.
- Material theme configuration should be the single source of truth for palette and dark mode settings.
- One-off inline styles should be avoided when a shared theme or reusable component can express the same intent.
- Any future visual changes should preserve the dark theme, purple primary color, and teal secondary color unless the design system is intentionally revised.