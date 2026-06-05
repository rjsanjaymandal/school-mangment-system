"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Code, Copy, CheckCircle, BookOpen, Smartphone, 
  Server, Key, Globe, Shield
} from "lucide-react";
import { useState } from "react";

const API_ENDPOINTS = [
  { 
    method: "GET", 
    path: "/api/v1/students", 
    description: "List all students with pagination",
    auth: "Required",
    category: "Students"
  },
  { 
    method: "POST", 
    path: "/api/v1/students", 
    description: "Create new student record",
    auth: "Required",
    category: "Students"
  },
  { 
    method: "GET", 
    path: "/api/v1/students/:id", 
    description: "Get student details by ID",
    auth: "Required",
    category: "Students"
  },
  { 
    method: "PUT", 
    path: "/api/v1/students/:id", 
    description: "Update student information",
    auth: "Required",
    category: "Students"
  },
  { 
    method: "GET", 
    path: "/api/v1/attendance", 
    description: "Get attendance records",
    auth: "Required",
    category: "Attendance"
  },
  { 
    method: "POST", 
    path: "/api/v1/attendance", 
    description: "Mark attendance",
    auth: "Required",
    category: "Attendance"
  },
  { 
    method: "GET", 
    path: "/api/v1/fees", 
    description: "Get fee structures",
    auth: "Required",
    category: "Finance"
  },
  { 
    method: "POST", 
    path: "/api/v1/payments", 
    description: "Record payment",
    auth: "Required",
    category: "Finance"
  },
  { 
    method: "GET", 
    path: "/api/v1/marks", 
    description: "Get student marks",
    auth: "Required",
    category: "Academic"
  },
  { 
    method: "POST", 
    path: "/api/v1/marks", 
    description: "Upload exam marks",
    auth: "Required",
    category: "Academic"
  },
];

const METHOD_COLORS = {
  GET: "bg-blue-100 text-blue-700",
  POST: "bg-emerald-100 text-emerald-700",
  PUT: "bg-amber-100 text-amber-700",
  DELETE: "bg-red-100 text-red-700",
};

export function APIDocumentation() {
  const [activeTab, setActiveTab] = useState("endpoints");

  return (
    <div className="space-y-6">
      {/* API Info Banner */}
      <Card className="shadow-sm border-l-4 border-l-purple-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Globe className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">REST API v1</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Base URL: https://api.edumaysan.edu/v1</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-semibold text-slate-900 dark:text-white">10</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Endpoints</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-slate-900 dark:text-white">99.9%</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Uptime</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-slate-900 dark:text-white">1.2s</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Avg Response</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-sm cursor-pointer hover:border-purple-200">
          <CardContent className="p-4 text-center">
            <Key className="h-6 w-6 mx-auto text-purple-500 mb-2" />
            <p className="font-medium text-slate-900 dark:text-white">Authentication</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm cursor-pointer hover:border-purple-200">
          <CardContent className="p-4 text-center">
            <Smartphone className="h-6 w-6 mx-auto text-blue-500 mb-2" />
            <p className="font-medium text-slate-900 dark:text-white">Mobile SDK</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm cursor-pointer hover:border-purple-200">
          <CardContent className="p-4 text-center">
            <Server className="h-6 w-6 mx-auto text-emerald-500 mb-2" />
            <p className="font-medium text-slate-900 dark:text-white">Webhooks</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm cursor-pointer hover:border-purple-200">
          <CardContent className="p-4 text-center">
            <Shield className="h-6 w-6 mx-auto text-amber-500 mb-2" />
            <p className="font-medium text-slate-900 dark:text-white">Rate Limits</p>
          </CardContent>
        </Card>
      </div>

      {/* Endpoints List */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4 border-b bg-slate-50/50 dark:bg-slate-900/50">
          <CardTitle className="text-base flex items-center gap-2">
            <Code className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            API Endpoints
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {API_ENDPOINTS.map((endpoint, i) => (
              <div key={i} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-900">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <Badge className={METHOD_COLORS[endpoint.method as keyof typeof METHOD_COLORS]}>
                      {endpoint.method}
                    </Badge>
                    <div>
                      <code className="text-sm font-mono text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                        {endpoint.path}
                      </code>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{endpoint.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">{endpoint.category}</Badge>
                        <Badge variant="outline" className="text-xs">{endpoint.auth}</Badge>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Example Request */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4 border-b bg-slate-50/50 dark:bg-slate-900/50">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            Example Request
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-slate-300 overflow-x-auto">
            <p className="text-purple-400"># Get all students</p>
            <p className="text-slate-400">curl -X GET https://api.edumaysan.edu/v1/students \</p>
            <p className="text-slate-400">  -H "Authorization: Bearer YOUR_API_KEY" \</p>
            <p className="text-slate-400">  -H "Content-Type: application/json"</p>
            <br/>
            <p className="text-purple-400"># Response</p>
            <p className="text-slate-400">{`{`}</p>
            <p className="text-slate-400">  "data": [</p>
            <p className="text-slate-400">    {"{"}</p>
            <p className="text-slate-400">      "id": "sms-001",</p>
            <p className="text-slate-400">      "name": "Rahul Sharma",</p>
            <p className="text-slate-400">      "class": "Class 10-A",</p>
            <p className="text-slate-400">      "status": "active"</p>
            <p className="text-slate-400">    {"}"}</p>
            <p className="text-slate-400">  ],</p>
            <p className="text-slate-400">  "pagination": {"{"}</p>
            <p className="text-slate-400">    "page": 1,</p>
            <p className="text-slate-400">    "total": 450</p>
            <p className="text-slate-400">  {"}"}</p>
            <p className="text-slate-400">{`}`}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}