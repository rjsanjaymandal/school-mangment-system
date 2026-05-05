"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Bell, Send, Mail, MessageSquare, Smartphone, 
  Users, BookOpen, Calendar, DollarSign, Clock,
  CheckCircle, XCircle, AlertCircle, Filter
} from "lucide-react";

interface Notification {
  id: string;
  type: "email" | "sms" | "push" | "in_app";
  title: string;
  message: string;
  recipients: number;
  sent_at: string;
  status: "sent" | "pending" | "failed";
  channel: "all" | "students" | "staff" | "parents" | "custom";
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: "1", type: "email", title: "Fee Reminder", message: "Reminder: Fee payment due for May 2025", recipients: 45, sent_at: "2025-05-05 10:00", status: "sent", channel: "parents" },
  { id: "2", type: "sms", title: "Attendance Alert", message: "Your child was absent today", recipients: 12, sent_at: "2025-05-05 09:30", status: "sent", channel: "parents" },
  { id: "3", type: "in_app", title: "Exam Schedule", message: "Final exam timetable published", recipients: 450, sent_at: "2025-05-04 14:00", status: "sent", channel: "students" },
  { id: "4", type: "email", title: "Staff Meeting", message: "Monthly staff meeting scheduled", recipients: 35, sent_at: "2025-05-04 11:00", status: "sent", channel: "staff" },
  { id: "5", type: "push", title: "Holiday Notice", message: "School closed on May 15", recipients: 520, sent_at: "2025-05-03 16:00", status: "sent", channel: "all" },
  { id: "6", type: "email", title: "Payment Received", message: "Fee payment confirmation", recipients: 8, sent_at: "2025-05-05 11:30", status: "pending", channel: "custom" },
];

const CHANNELS = [
  { id: "students", name: "Students", icon: Users, count: 450 },
  { id: "parents", name: "Parents", icon: Users, count: 420 },
  { id: "staff", name: "Staff", icon: BookOpen, count: 35 },
  { id: "all", name: "Everyone", icon: Bell, count: 905 },
];

const TEMPLATES = [
  { id: "fee_reminder", name: "Fee Reminder", category: "Finance" },
  { id: "attendance_alert", name: "Attendance Alert", category: "Attendance" },
  { id: "exam_notice", name: "Exam Notice", category: "Academic" },
  { id: "event_reminder", name: "Event Reminder", category: "Events" },
  { id: "holiday_notice", name: "Holiday Notice", category: "General" },
  { id: "admission_enquiry", name: "Admission Enquiry", category: "Admissions" },
];

export function NotificationCenter() {
  const [showCompose, setShowCompose] = useState(false);
  const [filter, setFilter] = useState("all");

  const getChannelIcon = (type: string) => {
    switch (type) {
      case "email": return Mail;
      case "sms": return MessageSquare;
      case "push": return Smartphone;
      default: return Bell;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent": return CheckCircle;
      case "pending": return Clock;
      case "failed": return XCircle;
      default: return AlertCircle;
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Total Sent</p>
                <p className="text-2xl font-semibold text-slate-900">1,247</p>
              </div>
              <Send className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Delivery Rate</p>
                <p className="text-2xl font-semibold text-slate-900">98.5%</p>
              </div>
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Pending</p>
                <p className="text-2xl font-semibold text-slate-900">3</p>
              </div>
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Templates</p>
                <p className="text-2xl font-semibold text-slate-900">12</p>
              </div>
              <BookOpen className="h-5 w-5 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compose Section */}
        <Card className="shadow-sm lg:col-span-1">
          <CardHeader className="pb-4 border-b bg-slate-50/50">
            <CardTitle className="text-base flex items-center gap-2">
              <Send className="h-4 w-4 text-blue-500" />
              Send Notification
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <Button onClick={() => setShowCompose(true)} className="w-full rounded-md bg-blue-600">
              <Send className="h-4 w-4 mr-2" />
              Compose New
            </Button>

            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Quick Channels</p>
              {CHANNELS.map(channel => (
                <div key={channel.id} className="flex items-center justify-between p-2 rounded hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <channel.icon className="h-4 w-4 text-slate-500" />
                    <span className="text-sm text-slate-700">{channel.name}</span>
                  </div>
                  <Badge variant="outline">{channel.count}</Badge>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Templates</p>
              {TEMPLATES.slice(0, 4).map(template => (
                <div key={template.id} className="p-2 text-sm text-slate-600 hover:bg-slate-50 rounded cursor-pointer flex items-center justify-between">
                  <span>{template.name}</span>
                  <Badge variant="outline" className="text-xs">{template.category}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <Card className="shadow-sm lg:col-span-2">
          <CardHeader className="pb-4 border-b bg-slate-50/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4 text-slate-500" />
                Notification History
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="rounded-md">
                  <Filter className="h-3 w-3 mr-1" />
                  Filter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {MOCK_NOTIFICATIONS.map(notification => {
                const ChannelIcon = getChannelIcon(notification.type);
                const StatusIcon = getStatusIcon(notification.status);
                return (
                  <div key={notification.id} className="p-4 hover:bg-slate-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          notification.type === "email" ? "bg-blue-100" :
                          notification.type === "sms" ? "bg-green-100" :
                          notification.type === "push" ? "bg-purple-100" :
                          "bg-slate-100"
                        }`}>
                          <ChannelIcon className={`h-4 w-4 ${
                            notification.type === "email" ? "text-blue-600" :
                            notification.type === "sms" ? "text-green-600" :
                            notification.type === "push" ? "text-purple-600" :
                            "text-slate-600"
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{notification.title}</p>
                          <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-slate-500">{notification.sent_at}</span>
                            <Badge variant="outline" className="text-xs capitalize">{notification.channel}</Badge>
                            <span className="text-xs text-slate-500">{notification.recipients} recipients</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`h-4 w-4 ${
                          notification.status === "sent" ? "text-emerald-500" :
                          notification.status === "pending" ? "text-amber-500" :
                          "text-red-500"
                        }`} />
                        <span className={`text-xs font-medium ${
                          notification.status === "sent" ? "text-emerald-600" :
                          notification.status === "pending" ? "text-amber-600" :
                          "text-red-600"
                        }`}>{notification.status}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Compose Notification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Title</label>
                <Input placeholder="Notification title" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Message</label>
                <Textarea placeholder="Enter your message..." className="mt-1" rows={4} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Channel</label>
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" size="sm" className="rounded-md">
                    <Mail className="h-4 w-4 mr-1" /> Email
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-md">
                    <MessageSquare className="h-4 w-4 mr-1" /> SMS
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-md">
                    <Smartphone className="h-4 w-4 mr-1" /> Push
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-md">
                    <Bell className="h-4 w-4 mr-1" /> In-App
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Recipients</label>
                <select className="w-full mt-1 h-10 px-3 rounded-md border">
                  <option>All Students</option>
                  <option>All Parents</option>
                  <option>All Staff</option>
                  <option>Custom Selection</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1 rounded-md" onClick={() => setShowCompose(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 rounded-md bg-blue-600" onClick={() => setShowCompose(false)}>
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}