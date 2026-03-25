"use server";

import { runAllSeeding } from "@/lib/seed-data";
import { revalidatePath } from "next/cache";

export async function triggerAllSeeding() {
  try {
    const results = await runAllSeeding();
    revalidatePath("/library");
    revalidatePath("/conduct");
    revalidatePath("/health");
    return { success: true, results };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
