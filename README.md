# 🏫 Edu Maysan ERP | Professional School Management System

**Edu Maysan ERP** is a high-performance, enterprise-grade school management platform designed to streamline academic operations. Built with modern web technologies, it provides a fast, dynamic, and intuitive experience for students, teachers, parents, and administrators.

---

## 🚀 Key Modules

- **User Registry (Elite)**: Advanced RBAC management with administrative impersonation (Shadow Mode).
- **Institutional Analytics**: Real-time dashboards for attendance, academic performance, and financial metrics.
- **Academic Management**: Detailed oversight of classes, teachers, student profiles, and subjects.
- **Automated Attendance**: Multi-role attendance tracking with historical reporting.
- **Financial Suite**: Comprehensive fee management and payroll processing.
- **Inventory & Assets**: Resource management and library tracking.
- **Communication Hub**: Unified portal for teacher-student-parent interaction.

## 🛠️ Tech Stack

- **Frontend**: [Next.js 15](https://nextjs.org/) (Turbopack, App Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Backend/Auth**: [Supabase SSR](https://supabase.com/docs/guides/auth/server-side-rendering)
- **State Management**: React Hooks & Server Components
- **Persistence**: PostgreSQL (Supabase DB)

## 🏗️ Architecture Highlights

### Server-Side Rendering (SSR)
The application leverages the power of Next.js Server Components to keep the data processing on the server, ensuring rapid initial page loads and superior SEO.

### Security First
All dashboard interactions are protected by a hardened **SSR Auth Middleware** that handles session persistence, role-based access control, and secure administrative impersonation.

---

## 🛡️ Administrative Superpowers: Shadow Mode

Edu Maysan ERP includes **Shadow View**, allowing administrators to troubleshoot and support users by viewing the system from their perspective. 

> [!IMPORTANT]
> Shadow Mode is strictly restricted to the `admin` role and is monitored for safety. See `AUTH_SECURITY.md` for full implementation details.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 20+
- Supabase Project (URL & Anon Key)

### Installation
```bash
git clone https://github.com/rjsanjaymandal/school-mangment-system.git
cd edu-maysan-erp
npm install
```

### Environment Setup
Create a `.env.local` file with:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Running Locally
```bash
npm run dev
```

---

## ⚖️ License & Credits
Developed by **Maysan Labs**. All Rights Reserved.
