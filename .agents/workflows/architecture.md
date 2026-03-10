---
description: System Architecture and Module Structure
---
# System Architecture

The system follows a **modern full stack architecture**.

Frontend:
Next.js

Backend:
Supabase

Database:
PostgreSQL

Hosting:
Vercel + Supabase

---

## Architecture Flow

User
↓
Next.js Frontend
↓
Supabase Auth
↓
PostgreSQL Database

---

## Modules

The system must be modular.

Core modules:

- User management
- Student management
- Teacher management
- Classes
- Subjects
- Attendance
- Exams
- Fees
- Notifications

Each module must be implemented independently.

---

## Dashboard Structure

Admin dashboard
- manage users
- manage classes
- system analytics

Teacher dashboard
- classes
- attendance
- grades

Student dashboard
- timetable
- results
- attendance

Parent dashboard
- child progress
