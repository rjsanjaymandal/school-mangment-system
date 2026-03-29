# 🏗️ Edu Maysan ERP | System Architecture

This document outlines the technical design, data flow, and architectural patterns used in the Edu Maysan school management system.

---

## 🏛️ High-Level Technical Stack

- **Framework**: `Next.js 15` (Turbopack, App Router).
- **Styling**: `Tailwind CSS v4` + **Glassmorphism** and **Elite UI** principles.
- **Backend/Auth**: `Supabase SSR` (Server-Side Rendering).
- **Database**: `PostgreSQL` via Supabase.
- **State Management**: Mixed approach using `React Server Components` for initial data fetching and `React Client Hooks` for interactive UI elements.
- **Type Safety**: Fully typed with `TypeScript`.

---

## 🔐 Authentication & Session Flow

The application uses an advanced **SSR Auth Pattern** to ensure high security and performance.

### 1. The Middleware (`src/lib/supabase/middleware.ts`)
The core session engine. Before any request is fulfilled, the middleware:
- Refreshes the Supabase Auth session if necessary.
- Detects stale or invalid sessions (handling `Refresh Token Not Found` errors gracefully).
- Verifies the user's role for protected dashboard routes.
- **Shadow Mode**: Checks for the `impersonation_user_id` cookie to override the current user's session context for administrators.

### 2. Administrative Impersonation (Shadow Mode)
This "Elite" feature allows administrators to view the system as another user.
- **Cookie-Based**: A high-security, `HttpOnly` cookie stores the target `user_id`.
- **Server-Side Override**: The Supabase client is configured in the middleware to use the target `user_id` for data fetching, while remaining within the administrator's original secure session.

---

## 💾 Database Relationship Model

Edu Maysan ERP follows a normalized relational structure:

### Core Tables:
- **`profiles`**: The source of truth for user metadata (Role, Full Name, Email). Linked to `auth.users`.
- **`classes`**: Academic groups.
- **`subjects`**: Courses taught within classes.
- **`teachers`**: Detailed professional profiles for academic staff.
- **`students`**: Academic and personal records for learners.

### Operational Tables:
- **`attendance`**: Daily records for students and staff.
- **`exams` & `results`**: Academic assessment tracking.
- **`fees`**: Financial records and invoice status.
- **`audit_logs`**: System-wide event tracking for security compliance.

---

## 🚀 Performance Optimization

- **Turbopack**: Used for lightning-fast incremental builds and hot reloading during development.
- **Streaming & Suspense**: Used to stream high-density data grids while maintaining a responsive UI shell.
- **Server Actions**: All mutations (Creating users, updating attendance) are handled via secure Next.js Server Actions, reducing client-side bundle size.

---

## 🎨 Design Philosophy: 'Elite UI'

The interface is built to feel "alive" and premium:
- **Vibrant Palettes**: Deep primary blues and subtle emerald/indigo accents.
- **Glassmorphism**: Translucent cards with subtle backdrop blurs.
- **Micro-Animations**: Uses `lucide-react` icons with CSS transitions for interactive feedback.
- **Clean Registry**: Tables are designed for high-density data without clutter, prioritizing scanability.

---

### Maintainer Notes
This project is built for scale. When adding new modules, always prioritize **Server Components** for data reading and **Server Actions** for data writing to maintain the SSR advantage.
