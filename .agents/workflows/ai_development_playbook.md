---
description: AI Development Playbook
---
# AI Development Playbook

This document defines how the AI should plan, build, test, and deliver features for the School Management System (SMS). Following these steps ensures zero-downtime, regression-free functionality.

---

# 1. Context Gathering (MANDATORY FIRST STEP)

Before writing *any* new code, the AI must:
1. Use `grep_search` and `view_file` to search the codebase for existing modules related to the request.
2. Verify if a Server Action or database query already exists for this task.
3. Check if an existing UI Component (e.g., `Card`, `Table`, `Badge`) can be reused instead of creating a new one.
4. **DO NOT DUPLICATE** what already exists.

---

# 2. Feature Development Process

For every feature, follow these exact steps:

1. **Database Schema**: Ensure the Supabase table exists and is correct. If editing SQL, use `fix-schema.sql` or run a local query.
2. **Types & Interfaces**: Define exact TypeScript interfaces for the new data structure.
3. **Server Actions (`app/actions/...`)**: Write the backend logic. Include `zod` validation, Supabase inserts/selects, error catching, and `revalidatePath`.
4. **Server Component Page**: Write a page that securely fetches initial data.
5. **Client UI Component**: Write the interactive client components (Forms, Tables) that receive data from the server page.
6. **Aesthetics Pass**: Ensure the UI utilizes the system's signature glassmorphic, premium aesthetic (`glass` class, translucent borders, smooth hover scales).
7. **Test & Verify**: Run terminal checks (e.g., `npm run build` or TS checks) if dealing with complex types.

---

# 3. Defensive Programming

When you build features, act as a **Senior Engineer**:
- **Assume Nulls**: The database might return null. Always use optional chaining (`user?.name`) or provide fallback defaults (`records || []`).
- **Handle Async Errors**: If a Server Action fails, the frontend must dynamically render the error to the user gracefully. Never crash the app.
- **Role Verification**: Admin components should never be rendered for Students.

---

# 4. Feature Enhancements

If asked to "enhance", "refine", or "beautify" a module:
- Update raw tables to use Shadcn `Table` components or `TanStack` data grids.
- Add `lucide-react` icons to headers and buttons.
- Introduce empty states (e.g., "No records found" with an illustrative icon).
- Add loading states using Next.js `loading.tsx` or skeleton loaders.

---

# 5. Final Output Guarantee

The AI must guarantee that any code written:
- Will not break the build (no TypeScript errors, no missing module imports).
- Accurately adheres to the Next.js 14 App Router paradigm.
- Will immediately work for the user upon saving the file.
