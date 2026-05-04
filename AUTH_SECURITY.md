# 🛡️ Edu Maysan ERP | Auth & Security

This document outlines the security architecture and administrative "Super-Permissions" implemented in the Edu Maysan school management system.

---

## 🔐 Authentication Ecosystem

Edu Maysan ERP uses **Supabase SSR** for its core auth layer. This ensures that session tokens are stored in secure, `HttpOnly` cookies that are inaccessible to client-side scripts (preventing XSS-based token theft).

### Key Security Layers:
1. **SSR Middleware Protection**: Every server-side request is intercepted by `middleware.ts`, which verifies the JWT (JSON Web Token) freshness.
2. **Server-Side Authorization**: All data mutations (Creating, Editing, Deleting users) happen via **Next.js Server Actions** which re-verify the user's `admin` status on the server before execution.
3. **Role-Based Access Control (RBAC)**: The system enforces strict boundaries between:
    - `admin`: Full system control and user management.
    - `teacher`: Academic management for assigned classes.
    - `student`: View-only access to academic and personal progress.
    - `parent`: View-only access to linked student progress.

---

## 👥 Administrative Impersonation: 'Shadow Mode'

The **Shadow View** (User Impersonation) feature allows system administrators to view and navigate the application as another user for troubleshooting and support.

### 🛡️ Security Boundaries:
- **Admin-Only**: The ability to initiate a View As session is strictly restricted to users with the `admin` role. The `startViewAs` action explicitly calls `isAdmin()` before setting the cookie.
- **Session Context Override**: When active, the system uses the targeted `user_id` to retrieve data, giving the Administrator the exact View/Edit permissions of that user. This is deliberate for high-tier support ("Show me what's broken in your view").
- **Visual Alerting**: A persistent, high-visibility neon banner is displayed globally during any active Shadow session. This ensures the Administrator is always aware they are in "Shadow Mode" and not in their own account.
- **Termination**: Shadow sessions can be instantly terminated via the "Exit session" button, which clears the `impersonation_user_id` cookie.

### 🚨 Risk Management:
While Shadow Mode allows "Edit" permissions (essential for resolving student/teacher data entry issues), it is restricted to the highest level of system trust (the Admin).

---

## 📝 Audit & Compliance

To maintain transparency, the system is designed to log all major administrative actions:
- User Creation/Deletion.
- Role Changes.
- **Impersonation Events**: Whenever an Admin starts or stops a Shadow session, an audit record should be created in the `audit_logs` table (Planned/Implementation in progress).

---

## 🛡️ Hardened Session Recovery

The middleware is hardened against "Invalid Refresh Token" errors. If a session token becomes stale or invalid (e.g., due to a password change or database manual cleanup), the system proactively detects the failure, clears the secure cookies, and redirects the user to `/login` to prevent a broken experience or security leak.

---

### Security Support
If you identify any security vulnerabilities or have concerns about permission boundaries, please contact the **Maysan Labs** security team.
