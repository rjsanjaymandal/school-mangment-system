---
description: EduFox Core Architecture and UI Guidelines
---

# EduFox School Management System (SMS) - Development Guide
This document acts as the core "Skill" for AI agents working on the EduFox project. ALWAYS check these rules before building or modifying features to maintain system integrity and aesthetic consistency.

## Tech Stack Overview
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS & generic CSS (Glassmorphism theme)
- **Database/Backend**: Supabase (PostgreSQL)
- **Components**: Radix UI primitives / shadcn/ui style components
- **Icons**: `lucide-react`
- **Notifications**: `sonner` (`toast.success`, `toast.error`)

## 1. Architectural Rules (Strict)

### Data Fetching
- **Server Components (`page.tsx`)**: ALWAYS fetch initial data server-side using the `createClient` from `@/lib/supabase/server`. Pass the raw data down to Client Components as props.
- **NEVER** use Client-side `useEffect` for the initial data page load if it can be fetched server-side.

### Mutations (Database Writes)
- **Server Actions ONLY**: Any operation that Inserts, Updates, or Deletes data MUST be a Server Action located in `src/app/actions/[feature].ts`.
- **Client**: Use `createAdminClient` from `@/lib/supabase/admin` inside Server Actions to bypass RLS for administrative mutations, OR rely on user auth tokens.
- **Return Type**: Every Server Action must return an object of type `{ success: boolean; data?: any; error?: string }`.
- **Revalidation**: Always call `revalidatePath('/feature-route')` upon a successful mutation inside the action.

### Typescript
- **No `any`**: Strictly type your functions. Use the `Database` types from `src/types/database.ts` (e.g., `import { Class, Student } from "@/types/database"`). If you are joining tables (e.g., `students(*, profile:profiles(*))`), create an inline interface or type for the expected result.

## 2. UI / UX Design System (Aesthetic Guidelines)

The EduFox system relies on a **Premium Glassmorphic** layout. When designing new components (`Dashboard`, `Forms`, etc.), you MUST follow these patterns:

### Master Layout & Animation
- **Wrapper**: `div className="space-y-8 animate-in fade-in duration-700"`

### Header Layout
```tsx
<div>
  <h2 className="text-4xl font-black tracking-tight text-slate-900">Module Name</h2>
  <p className="text-slate-500 font-medium tracking-tight">Purpose of module</p>
</div>
```

### Glassmorphic Cards (The "Glass" Theme)
Use these exact classes for Cards to emulate the glass effect:
```tsx
<Card className="border-none glass futuristic-card overflow-hidden">
  <CardHeader>
    <CardTitle className="text-lg font-semibold text-slate-800">Title</CardTitle>
  </CardHeader>
  <CardContent>...</CardContent>
</Card>
```

### Table Layouts
Always place tables inside a Glass Card and configure the headers like this:
```tsx
<Table>
  <TableHeader className="bg-slate-50/50">
    <TableRow className="border-b">
      <TableHead className="py-4 px-6 font-black uppercase tracking-widest text-[10px] text-slate-400">Column Name</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody className="divide-y divide-slate-100">
    {/* rows */}
  </TableBody>
</Table>
```

### Badges, Buttons & Interactive Elements
- **Buttons**: Use standard variants, but for primary actions, you can use custom variants like `variant="neon"` or classes like `bg-slate-900 text-white hover:bg-slate-800 rounded-xl`.
- **Badges**: Use subtle backgrounds. E.g., for success `bg-green-50 text-green-600 border-none font-bold text-[10px]`.

## 3. Workflow Phase Execution
When instructed to build a new module:
1. **Verify DB Schema**: Ensure the table exists in Supabase. Wait for user schema apply if needed.
2. **Server Actions First**: Create the `create`, `update`, `delete` functions in `src/app/actions/[module].ts`.
3. **Data Fetching (Page)**: Write `src/app/(dashboard)/[module]/page.tsx` as a Server Component fetching required data.
4. **Interactive Component**: Build `src/components/[module]/[Module]Dashboard.tsx` with Tabs, Forms, and Data Tables.
5. **Build Verification**: ALWAYS run `npx next build` to ensure Typescript compliance before claiming the task is complete.
