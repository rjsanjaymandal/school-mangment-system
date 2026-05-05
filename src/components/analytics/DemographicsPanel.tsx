"use client";

import { useState } from "react";
import { Users, BarChart3, FileCheck2 } from "lucide-react";
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { ERPCard } from "@/components/ui/erp-card";

interface StudentDemographic {
    id: string;
    gender: string | null;
    date_of_birth: string | null;
    category: string | null;
    religion: string | null;
    class_id: string | null;
    class?: { name: string } | null;
}

interface ClassOption {
    id: string;
    name: string;
}

interface DocumentStat {
    student_id: string;
    doc_count: number;
}

interface DemographicsPanelProps {
    students: StudentDemographic[];
    classes: ClassOption[];
    documentStats: DocumentStat[];
}

const GENDER_COLORS = ["#3b82f6", "#ec4899"];
const CATEGORY_COLORS = ["#0ea5e9", "#f59e0b", "#10b981", "#ef4444"];
const RELIGION_COLORS = ["#f97316", "#06b6d4", "#8b5cf6", "#ec4899"];
const AGE_COLORS = ["#6366f1", "#3b82f6", "#10b981", "#f59e0b"];

function getAgeGroup(dob: string | null): string {
    if (!dob) return "Unknown";
    const age = Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    if (age <= 9) return "6-9";
    if (age <= 13) return "10-13";
    if (age <= 17) return "14-17";
    return "18+";
}

function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, number> {
    return arr.reduce((acc, item) => {
        const k = key(item) || "Not Specified";
        acc[k] = (acc[k] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
}

function toChartData(groups: Record<string, number>): { name: string; value: number }[] {
    return Object.entries(groups)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
}

export function DemographicsPanel({ students, classes, documentStats }: DemographicsPanelProps) {
    const [selectedClass, setSelectedClass] = useState<string>("all");

    const filtered = selectedClass === "all"
        ? students
        : students.filter(s => s.class_id === selectedClass);

    const filteredIds = new Set(filtered.map(s => s.id));

    const genderData = toChartData(groupBy(filtered, s => s.gender || "Not Specified"));
    const categoryData = toChartData(groupBy(filtered, s => s.category || "General"));
    const religionData = toChartData(groupBy(filtered, s => s.religion || "Not Specified"));
    const ageData = toChartData(groupBy(filtered, s => getAgeGroup(s.date_of_birth)));

    return (
        <div className="space-y-6">
            {/* Class Filter */}
            <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-slate-600">Filter by Class:</label>
                <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="border border-slate-200 rounded-md px-3 py-2 text-sm"
                >
                    <option value="all">All Classes</option>
                    {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
                <span className="text-sm text-slate-500">{filtered.length} students</span>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Gender */}
                <ERPCard title="Gender" description="Student distribution" color="blue">
                    {genderData.length === 0 ? (
                        <div className="h-48 flex items-center justify-center text-slate-400">No data</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={genderData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={70}
                                    paddingAngle={4}
                                    dataKey="value"
                                >
                                    {genderData.map((_, i) => (
                                        <Cell key={i} fill={GENDER_COLORS[i % GENDER_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </ERPCard>

                {/* Category */}
                <ERPCard title="Category" description="Caste category breakdown" color="amber">
                    {categoryData.length === 0 ? (
                        <div className="h-48 flex items-center justify-center text-slate-400">No data</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={categoryData} layout="vertical" margin={{ left: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} />
                                <YAxis dataKey="name" type="category" width={60} tick={{ fontSize: 11, fill: "#64748b" }} />
                                <Tooltip />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                    {categoryData.map((_, i) => (
                                        <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </ERPCard>

                {/* Religion */}
                <ERPCard title="Religion" description="Religious distribution" color="purple">
                    {religionData.length === 0 ? (
                        <div className="h-48 flex items-center justify-center text-slate-400">No data</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={religionData.slice(0, 5)} margin={{ bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-30} textAnchor="end" height={40} />
                                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                                <Tooltip />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={24}>
                                    {religionData.slice(0, 5).map((_, i) => (
                                        <Cell key={i} fill={RELIGION_COLORS[i % RELIGION_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </ERPCard>

                {/* Age Groups */}
                <ERPCard title="Age Groups" description="Student age distribution" color="emerald">
                    {ageData.length === 0 ? (
                        <div className="h-48 flex items-center justify-center text-slate-400">No data</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={ageData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
                                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                                <Tooltip />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={32}>
                                    {ageData.map((_, i) => (
                                        <Cell key={i} fill={AGE_COLORS[i % AGE_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </ERPCard>
            </div>
        </div>
    );
}