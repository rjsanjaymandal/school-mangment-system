---
description: Development Rules and Guidelines
---
# Development Rules

The AI must follow these rules when generating code to guarantee robust, senior-level software delivery.

## Code Quality & Types

- **Strict TypeScript**: Use TypeScript strictly. Do NOT use `any`. Always define explicit interfaces or Zod schemas for database rows, component props, and state.
- **Relative & Absolute Imports**: Prefer absolute imports (`@/components/...`) over long relative paths.
- **DRY Principle**: Extract shared UI into components and shared logic into utility functions. Only write a piece of complex logic once.
- **Clean Naming**: Variables and functions must have descriptive, verb-based names (e.g., `fetchRecentStudents`, `handleFeePayment`).

## Performance & Rendering

- **Server Components by Default**: All `.tsx` files in the `app` directory must be Server Components unless they require state or hooks.
- **Targeted `'use client'`**: Only add `'use client'` at the top of a file if you absolutely need `useState`, `useEffect`, `useForm`, or DOM event handlers like `onClick`. Keep client components as small as possible.
- **No useEffect for Data Fetching**: Fetch data natively in Server Components using `await supabase.from(...)`. Pass the data down to Client Components as props.
- **Cache Invalidation**: Always use `revalidatePath()` in your Server Actions to ensure the UI instantly updates after data mutations (e.g., adding a student, paying a fee).

## Security & Database

- **Service Role Control**: Never expose the Supabase `SERVICE_ROLE_KEY` to the client. Only use it in specific backend Server Actions (`createAdminClient`) when explicitly bypassing RLS is required for admin-only operations.
- **Row Level Security (RLS)**: Design systems assuming RLS is active. The user's JWT dictates what data they can see.
- **Input Validation**: EVERY Server Action must validate its input arguments using `zod` before executing database queries. Do not trust client payloads.

## Project Organization

Maintain this clear folder structure:

`app/` - Next.js routing, pages, layouts, and API routes
`app/actions/` - Reusable Next.js Server Actions
`components/ui/` - Reusable Shadcn base primitives
`components/[module]/` - Feature-specific components (e.g., `components/students`, `components/fees`)
`lib/` - Utilities, formatters, and global instances
`lib/supabase/` - Supabase client instantiations (browser, server, admin)
`middleware.ts` - Top-level route protection and session management
