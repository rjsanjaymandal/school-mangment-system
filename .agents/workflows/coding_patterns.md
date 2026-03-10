---
description: Coding Patterns Guide
---
# Coding Patterns Guide

This document defines the strict, modern Next.js 14 patterns that the AI must follow when building features for the School Management System (SMS).

---

# 1. Component Architecture (RSC Pattern)

Separate data fetching from interactivity by wrapping Client Components within Server Components.

**Server Component (Data Fetcher):**
```tsx
// app/(dashboard)/students/page.tsx
import { getStudents } from "@/app/actions/students";
import { StudentTableClient } from "@/components/students/StudentTableClient";

export default async function StudentsPage() {
  const students = await getStudents(); // Fetched on server
  return <StudentTableClient initialData={students} />;
}
```

**Client Component (Interactive):**
```tsx
// components/students/StudentTableClient.tsx
"use client";
import { useState } from "react";

export function StudentTableClient({ initialData }) {
  const [data, setData] = useState(initialData);
  return <div>...render table with sorting...</div>;
}
```

---

# 2. Server Action Pattern

Use Server Actions for all mutations (Create, Update, Delete). Do not use `/api` routes unless building a public webhook.

```typescript
// app/actions/fees.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const PaymentSchema = z.object({ id: z.string(), amount: z.number() });

export async function processPayment(payload: z.infer<typeof PaymentSchema>) {
  try {
    const data = PaymentSchema.parse(payload);
    const supabase = await createClient();
    
    const { error } = await supabase.from("payments").insert(data);
    if (error) throw error;

    revalidatePath("/fees"); // Crucial: Revalidates the page to show new data
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Payment failed" };
  }
}
```

---

# 3. Form Validation Pattern

Always combine `react-hook-form` with `zod` for flawless client-side validation, combined with a Server Action for submission.

```tsx
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { processPayment } from "@/app/actions/fees";
import { toast } from "sonner"; // or any toast library

export function PaymentForm() {
  const form = useForm({
    resolver: zodResolver(PaymentSchema),
  });

  async function onSubmit(data) {
    const result = await processPayment(data);
    if (result.error) {
       toast.error(result.error);
    } else {
       toast.success("Payment recorded!");
    }
  }
}
```

---

# 4. Styling Pattern

Consistently use the `cn()` utility for conditional Tailwind classes.

```tsx
import { cn } from "@/lib/utils";

export function Badge({ active, className }) {
  return (
    <span className={cn(
      "px-3 py-1 rounded-full text-xs font-bold",
      active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500",
      className
    )}>
      {active ? "Active" : "Inactive"}
    </span>
  );
}
```

Ensure all glassmorphic dashboard cards follow this premium styling:
`className="glass border-white/20 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all"`
