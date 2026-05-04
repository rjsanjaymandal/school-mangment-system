# Edu Maysan ERP - UI Design Standards

> This document defines the visual design system for the Edu Maysan School Management System. All implementations must adhere to these standards.

---

## 1. Typography

### Font Family
- **Primary Font**: Inter (via Next.js `next/font/google`)
- **Fallback**: system-ui, sans-serif

### Font Scale
| Element | Size | Weight | Line Height |
|---------|------|--------|--------------|
| Page Title | 2rem (32px) | font-bold | tight |
| Section Heading | 1.25rem (20px) | font-semibold | tight |
| Body Text | 0.875rem (14px) | font-normal | normal |
| Labels | 0.75rem (12px) | font-medium | normal |
| Small/Caption | 0.625rem (10px) | font-medium | normal |

### Text Utilities
- All headings: `tracking-tight`
- Labels: `uppercase tracking-wider`
- Badges: `uppercase tracking-widest`

---

## 2. Icons

### Library
- **Primary**: Lucide-React
- **Usage**: All icons throughout the application

### Standard Sizes
- Small: `h-4 w-4` (buttons, badges)
- Default: `h-5 w-5` (navigation, inputs)
- Large: `h-6 w-6` (cards, headers)
- XL: `h-8 w-8` (page icons)

---

## 3. Spacing System

### Page Layout
- **Page Padding**: `p-6` (24px)
- **Section Margin**: `mb-6` (24px)
- **Card Spacing**: `p-6` (24px)

### Grid System
- **Item Gaps**: `gap-4` (16px)
- **Section Gaps**: `gap-6` (24px)
- **Card Grid**: `grid-cols-2` to `grid-cols-4`

### Form Layout
- **Form Fields**: 3-4 columns on desktop, 1 column on mobile
- **Input Height**: `h-10` (40px) standard
- **Label to Input**: `gap-2` (8px)

---

## 4. Color Palette

### Primary Colors (Emerald)
```css
--primary: #059669;        /* Emerald-600 - Primary actions */
--primary-hover: #047857;  /* Emerald-700 - Hover state */
--primary-light: #ECFDF5;  /* Emerald-50 - Backgrounds */
```

### Secondary Colors (Slate)
```css
--secondary: #475569;      /* Slate-600 - Secondary text */
--secondary-light: #94A3B8; /* Slate-400 - Muted text */
--slate-50: #F8FAFC;      /* Sidebar background */
--slate-100: #F1F5F9;     /* Card backgrounds */
--slate-200: #E2E8F0;     /* Borders */
```

### Alert Colors
| Status | Background | Text | Border |
|--------|-----------|------|--------|
| Success | bg-emerald-50 | text-emerald-700 | border-emerald-200 |
| Warning | bg-amber-50 | text-amber-700 | border-amber-200 |
| Error | bg-red-50 | text-red-700 | border-red-200 |
| Info | bg-blue-50 | text-blue-700 | border-blue-200 |

---

## 5. Component Standards

### ERP Card
```tsx
<ERPCard
  title="Card Title"
  icon={Icon}
  color="emerald" // emerald | blue | amber | red | purple
>
  {/* Content */}
</ERPCard>
```

**Structure:**
- Background: `bg-white`
- Border: `border border-slate-200`
- Shadow: `shadow-sm`
- Header: `border-l-4 border-{color}-500`
- Padding: `p-6`

### Button Component
```tsx
<Button variant="primary">Label</Button>
<Button variant="secondary">Label</Button>
<Button variant="outline">Label</Button>
<Button variant="danger">Label</Button>
```

**Standards:**
- Border Radius: `rounded-md` (NOT rounded-xl)
- Padding: `px-4 py-2`
- Height: `h-10` (default), `h-8` (small)

### Form Inputs
```tsx
<Input label="Email" placeholder="Enter email" />
<Select label="Class" />
```

**Standards:**
- Background: `bg-slate-50`
- Border: `border border-slate-200`
- Height: `h-10`
- Focus: `ring-2 ring-primary/20`

### Data Table
- Header: `bg-slate-50` or `bg-slate-100`
- Row Hover: `hover:bg-slate-50`
- Border: `divide-y divide-slate-200`

---

## 6. Layout Architecture

### Sidebar
- Width: `w-64` (256px)
- Background: `bg-slate-50`
- Border: `border-r border-slate-200`
- Position: Fixed left

### Navigation Structure
```
Overview
  ├── Dashboard
  ├── Analytics (Admin/Teacher)
  └── Reports (Admin)

Personnel
  ├── Students
  ├── Staff (Admin)
  ├── Attendance
  ├── Conduct
  ├── Health
  └── Alumni (Admin)

Academics
  ├── Classes (Admin/Teacher)
  ├── Subjects (Admin/Teacher)
  ├── Grades
  ├── Exams
  ├── Timetable
  ├── Certificates
  └── Activities

Operations
  ├── Fees
  ├── Library
  ├── Inventory (Admin)
  ├── Transport
  ├── Messages
  └── Guardians (Admin/Teacher)

System (Admin)
  ├── Users
  ├── Settings
  ├── Logs
  ├── Compliance
  └── Gateways
```

### Top Header
- Height: `h-16` (64px)
- Background: `bg-white`
- Border: `border-b border-slate-200`
- Components:
  - Breadcrumb (left)
  - Search (center)
  - User Menu (right)

---

## 7. Breadcrumb Pattern

### Format
```
Home / Module Name / Page Name
```

### Implementation
- Separator: `/` character
- Current page: `text-slate-900 font-medium`
- Links: `text-slate-500 hover:text-slate-700`

---

## 8. Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| Mobile | < 640px | Single column, hamburger menu |
| Tablet | 640-1024px | 2 columns, collapsed sidebar |
| Desktop | > 1024px | Full layout, persistent sidebar |

---

## 9. Implementation Checklist

Before marking a page as complete, verify:

- [ ] Page uses `p-6` padding
- [ ] Cards use `bg-white shadow-sm border-l-4`
- [ ] Forms use grid layout (3-4 columns)
- [ ] Buttons use `rounded-md`
- [ ] Icons are from Lucide-React only
- [ ] Color palette matches defined colors
- [ ] Breadcrumb present in header
- [ ] No mixed border-radius values

---

## 10. Migration Notes

### From Old to New
| Old | New |
|-----|-----|
| `p-8` or `p-12` | `p-6` |
| `rounded-xl` or `rounded-2xl` | `rounded-md` |
| `bg-card` (white) | `bg-white` |
| `border-border` | `border-slate-200` |
| Complex gradients | `bg-slate-50` |
| Various icon libraries | Lucide-React only |

---

*Last Updated: May 2026*
*Maintainer: Maysan Labs*