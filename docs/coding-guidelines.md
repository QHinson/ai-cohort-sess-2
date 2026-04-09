# Coding Guidelines

This document defines baseline coding standards for the project. Follow these rules in backend and frontend code unless a specific file requires a documented exception.

## General Best Practices

- Write clear, readable code over clever shortcuts.
- Keep functions small and focused on one responsibility.
- Prefer descriptive names for variables, functions, and components.
- Avoid dead code, commented-out blocks, and unused exports.
- Add comments only when intent is not obvious from the code itself.

## Import Order Rules

Use a consistent top-down import structure in every file:

1. Node.js built-in modules.
2. Third-party packages from npm.
3. Internal absolute imports (if configured).
4. Relative imports from parent folders.
5. Relative imports from sibling or child folders.
6. Style imports (CSS/SCSS) last.

Additional requirements:

- Leave one blank line between each import group.
- Sort imports alphabetically within each group.
- Prefer named exports/imports when practical.
- Remove unused imports before committing.

## General Formatting Rules

- Use consistent indentation and spacing across the file.
- Always include semicolons.
- Use single quotes for JavaScript and TypeScript strings unless escaping makes double quotes clearer.
- Include trailing commas where valid to reduce noisy diffs.
- Keep line length readable (target around 100 characters).
- Ensure files end with a single newline.
- Use consistent brace style and spacing in objects, arrays, and function declarations.

## Linting Standards

- Linting is required for all new and modified code.
- Resolve lint errors before creating a pull request.
- Warnings should be addressed unless there is a documented reason not to.
- Do not disable lint rules globally to pass checks.
- If a one-off rule disable is necessary, scope it to the smallest possible line/block and include a short reason.

## Quality Expectations

- New features and bug fixes should include or update tests.
- Refactors should preserve behavior and improve readability.
- Keep diffs focused: avoid unrelated formatting-only changes in feature commits.
- Match existing project conventions when working in legacy files.
