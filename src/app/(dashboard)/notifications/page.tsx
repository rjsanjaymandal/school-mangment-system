"use client";

import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { Bell } from "lucide-react";
import { UnifiedPageHeader } from "@/components/shared/UnifiedPageHeader";

export default function NotificationsPage() {
    return (
        <div className="p-6 space-y-0 animate-in fade-in duration-700">
            <UnifiedPageHeader
                title="Notifications"
                subtitle="Manage and send notifications"
                icon={Bell}
                color="blue"
            />
            <NotificationCenter />
        </div>
    );
}