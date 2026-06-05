"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

import { useTheme } from "@/lib/providers/ThemeProvider";

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
    const { theme } = useTheme();

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 pb-2">
                    Platform Engagement (6 Months)
                </p>
                <div className="h-[300px] w-full pt-4">
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
                            <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card)' }}
                                labelStyle={{ color: 'var(--foreground)' }}
                                itemStyle={{ color: 'var(--foreground)', fontWeight: 'bold' }}
                            />
                            <Area type="monotone" dataKey="activeUsers" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                            <Area type="monotone" dataKey="logins" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorLogins)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 pb-2">
                    Academic Performance Index
                </p>
                <div className="h-[300px] w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={performanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <XAxis dataKey="subject" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip
                                cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                                contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card)' }}
                                labelStyle={{ color: 'var(--foreground)' }}
                                itemStyle={{ color: 'var(--foreground)', fontWeight: 'bold' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--foreground)' }} />
                            <Bar dataKey="passRate" name="Pass Rate %" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="avgScore" name="Avg Score" fill={theme === 'dark' ? '#f8fafc' : '#0f172a'} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}