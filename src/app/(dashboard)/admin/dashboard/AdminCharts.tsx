"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

const activityData = [
    { name: 'Jan', activeUsers: 400, logins: 240, amt: 2400 },
    { name: 'Feb', activeUsers: 300, logins: 139, amt: 2210 },
    { name: 'Mar', activeUsers: 200, logins: 980, amt: 2290 },
    { name: 'Apr', activeUsers: 278, logins: 390, amt: 2000 },
    { name: 'May', activeUsers: 189, logins: 480, amt: 2181 },
    { name: 'Jun', activeUsers: 239, logins: 380, amt: 2500 },
    { name: 'Jul', activeUsers: 349, logins: 430, amt: 2100 },
];

const performanceData = [
    { subject: 'Math', passRate: 85, avgScore: 78 },
    { subject: 'Science', passRate: 92, avgScore: 84 },
    { subject: 'English', passRate: 78, avgScore: 72 },
    { subject: 'History', passRate: 95, avgScore: 88 },
    { subject: 'Art', passRate: 98, avgScore: 92 },
];

export function AdminCharts() {
    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-none glass futuristic-card bg-white/40 p-2">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">
                        Platform Engagement (6 Months)
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={activityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorLogins" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" stroke="#cbd5e1" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="#cbd5e1" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
                                itemStyle={{ fontWeight: 'bold' }}
                            />
                            <Area type="monotone" dataKey="activeUsers" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                            <Area type="monotone" dataKey="logins" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorLogins)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="border-none glass futuristic-card bg-white/40 p-2">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">
                        Academic Performance Index
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={performanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <XAxis dataKey="subject" stroke="#cbd5e1" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="#cbd5e1" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip
                                cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                                itemStyle={{ fontWeight: 'bold' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                            <Bar dataKey="passRate" name="Pass Rate %" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="avgScore" name="Avg Score" fill="#0f172a" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
