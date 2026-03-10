---
description: Engineering Decision Framework
---
# Engineering Decision Framework

This document defines how the AI should make technical decisions when building the School Management System (SMS).

The AI must follow these decision rules before choosing any technology, architecture, or implementation approach.

---

# 1. Core Principles

When making decisions prioritize:

1. Security
2. Simplicity
3. Maintainability
4. Scalability
5. Performance

Avoid complexity unless absolutely necessary.

---

# 2. Technology Decision Rules

## Frontend

Always prefer:

Next.js features before adding external libraries.

Examples:

Use Next.js routing instead of installing a routing library.

Use server components when possible instead of client components.

---

## Styling

Preferred order:

1. Tailwind CSS
2. Shadcn UI components
3. Custom components

Avoid adding new UI frameworks unless required.

---

## Backend

Backend services are provided by Supabase.

Prefer:

Supabase queries  
Supabase server actions  
Supabase policies  

Avoid building unnecessary custom backend servers.

---

# 3. Library Selection Rules

Before adding a new library the AI must ask:

1. Can this be implemented using built-in Next.js features?
2. Can this be implemented using existing libraries already in the project?
3. Is the library widely used and stable?

Only add libraries if they significantly improve development.

---

# 4. Database Design Decisions

When designing database tables:

Follow relational design principles.

Rules:

Use foreign keys for relationships.

Avoid duplicated data.

Normalize tables when possible.

Example:

students table references class_id instead of storing class name directly.

---

# 5. Security Decisions

Security is critical for school data.

Always enforce:

Row Level Security (RLS)

Examples:

Students can only access their own data.

Teachers can only access classes they teach.

Admins have full access.

Never expose private API keys or database secrets.

---

# 6. Authentication Decisions

Authentication must use Supabase Auth.

Rules:

No custom authentication system.

No storing passwords manually.

Use Supabase for:

login  
password reset  
email verification  

---

# 7. Feature Implementation Order

When implementing features prioritize:

1. authentication
2. user roles
3. database schema
4. core modules
5. analytics
6. advanced features

This ensures the foundation is solid before adding complexity.

---

# 8. Performance Decisions

When deciding between client-side and server-side logic:

Prefer server-side logic.

Use server components whenever possible.

Avoid unnecessary client-side state.

Use pagination for large tables.

---

# 9. Code Organization Decisions

Follow modular architecture.

Each feature must be contained in a module.

Example modules:

students  
teachers  
attendance  
exams  
fees  

Each module should include:

UI components  
database queries  
business logic  

---

# 10. Error Handling Decisions

Always implement proper error handling.

Examples:

invalid login attempts  
database query failures  
missing data  

Errors should be handled gracefully.

---

# 11. Future Scalability Decisions

Design the system to support future multi-school support.

Add a school_id column in major tables.

Example:

students  
teachers  
classes  
attendance  

This allows multi-tenant architecture in future.

---

# 12. Documentation

The AI must generate clear documentation for:

database schema  
API endpoints  
module functionality  

This ensures future developers can maintain the system.

---

# 13. Final Decision Rule

When unsure between two solutions choose the one that is:

simpler  
more secure  
easier to maintain  

Avoid overengineering.
