---
description: EduFox Technology Stack and Application Architecture
---
# Skill Context

This project is a **School Management System (SMS)** built with modern web technologies. 
The AI must act as a Senior Full-Stack Next.js 14 Engineer.

## Frontend
- **Next.js 14** (App Router)
- **React 18+** (Server Components, Suspense boundaries)
- **TypeScript** (Strict Mode enforced, no `any`)
- **Tailwind CSS**
- **Shadcn UI** (Radix UI primitives)

Skills required:
- Advanced App Router component architecture (Server vs. Client boundaries)
- Layouts, `loading.tsx`, `error.tsx`, and Suspense for streamed rendering
- Form handling with React Hook Form & Zod validation
- API integration & Server Actions

Libraries:
- `react-hook-form` + `zod`
- `@tanstack/react-table` (for data grids)
- `recharts` (for analytics and dashboards)
- `lucide-react` (icons)
- `date-fns` (date formatting)
- `clsx` & `tailwind-merge` (utility styling via a `cn` utility)

## Backend

Backend is handled natively by Supabase interacting with Next.js.

Services used:
- **Supabase Auth** (using `@supabase/ssr` for secure Server-Side Rendering)
- **PostgreSQL database** (accessed via Supabase JS Client)
- **Supabase Storage**
- **Row Level Security (RLS)**

The AI must implement:
- Secure CRUD operations exclusively through **Next.js Server Actions**
- Standardized error handling returning `{ error?: string; success?: boolean }`
- Revalidation via `revalidatePath` after server mutations

## Authentication

Authentication system requirements:
- Single login route (`/login`)
- Role-based routing protected via Next.js `middleware.ts`
- Secure sessions stored in HTTP-only cookies
- System accounts are created by Admins (no public registration)

Roles supported: `admin`, `teacher`, `student`, `parent`

## UI / UX Aesthetics

The School Management System features a **Premium, Glassmorphic Aesthetic**:
- Use translucent glass backgrounds (`bg-white/40 backdrop-blur-md border hover:bg-white/60`)
- Consistent smooth borders (`rounded-2xl`, `rounded-3xl`)
- Smooth micro-animations (`transition-all duration-300 hover:scale-[1.02]`)
- Do not use generic block colors; utilize gradients and `slate` themes for depth.

## Deployment

Frontend hosting: **Vercel**
Backend hosting: **Supabase Cloud**
