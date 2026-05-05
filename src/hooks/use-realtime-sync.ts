"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * A hook that listens for real-time changes on specified Supabase tables
 * and refreshes the current route to ensure data is "live".
 * 
 * @param tables Array of table names to listen for changes on
 * @param schema The database schema (default: 'public')
 */
export function useRealtimeSync(tables: string[], schema: string = "public") {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Create a channel for real-time updates
    const channel = supabase.channel(`realtime-sync-${tables.join("-")}`);

    // Subscribe to all changes on the specified tables
    tables.forEach((table) => {
      channel.on(
        "postgres_changes" as any,
        {
          event: "*", // Listen for INSERT, UPDATE, and DELETE
          schema: schema,
          table: table,
        },
        (payload) => {
          console.log(`Live Update Detected on ${table}:`, payload);
          // Trigger a silent refresh of the current page's server components
          router.refresh();
        }
      );
    });

    // Actually subscribe
    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        console.log(`Successfully subscribed to live updates for tables: ${tables.join(", ")}`);
      } else if (status === "CHANNEL_ERROR") {
        console.error("Failed to subscribe to live updates. Ensure Realtime is enabled in Supabase.");
      }
    });

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [tables, schema, router, supabase]);
}
