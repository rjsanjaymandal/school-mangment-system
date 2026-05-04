"use client";

import { useState, useRef, useCallback } from "react";
import {
    Users, PieChart as PieChartIcon, BarChart3, FileCheck2,
    Download, ChevronDown, Filter, Image, FileText, Code,
    UserCheck, BookOpen
} from "lucide-react";
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────
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

// ─── Color Palettes ──────────────────────────────────────
const GENDER_COLORS = ["#3b82f6", "#ec4899", "#8b5cf6"];
const CATEGORY_COLORS = ["#0ea5e9", "#f59e0b", "#10b981", "#ef4444", "#6366f1"];
const RELIGION_COLORS = ["#f97316", "#06b6d4", "#8b5cf6", "#ec4899", "#14b8a6", "#eab308", "#64748b", "#a3a3a3"];
const AGE_COLORS = ["#6366f1", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];
const DOC_COLORS = ["#10b981", "#f59e0b", "#ef4444"];

const REQUIRED_DOCS = 7; // Total doc types in schema

// ─── Utilities ───────────────────────────────────────────
function getAgeGroup(dob: string | null): string {
    if (!dob) return "Unknown";
    const age = Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    if (age <= 5) return "3-5";
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

function downloadCSV(data: { name: string; value: number }[], filename: string) {
    const csv = "Category,Count\n" + data.map(d => `${d.name},${d.value}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

function downloadSVG(chartRef: React.RefObject<HTMLDivElement | null>, filename: string) {
    const svg = chartRef.current?.querySelector("svg");
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const blob = new Blob([svgStr], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.svg`;
    a.click();
    URL.revokeObjectURL(url);
}

function downloadPNG(chartRef: React.RefObject<HTMLDivElement | null>, filename: string) {
    const svg = chartRef.current?.querySelector("svg");
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new window.Image();
    img.onload = () => {
        canvas.width = img.width * 2;
        canvas.height = img.height * 2;
        ctx?.scale(2, 2);
        ctx?.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${filename}.png`;
            a.click();
            URL.revokeObjectURL(url);
        });
    };
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgStr);
}

// ─── Custom Tooltip ──────────────────────────────────────
function CustomTooltip({ active, payload }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2.5 rounded-xl shadow-2xl border border-white/10 dark:border-slate-200">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{payload[0].name || payload[0].payload?.name}</p>
            <p className="text-lg font-black">{payload[0].value}</p>
        </div>
    );
}

// ─── Empty State ─────────────────────────────────────────
function EmptyState({ icon: Icon, label }: { icon: any; label: string }) {
    return (
        <div className="h-[280px] flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50">
            <Icon className="h-10 w-10 mb-4 text-slate-200 dark:text-slate-800" />
            <p className="font-bold text-[10px] uppercase tracking-[0.2em] text-slate-400">{label}</p>
        </div>
    );
}

// ─── Download Dropdown ───────────────────────────────────
function ExportMenu({ chartRef, data, filename }: {
    chartRef: React.RefObject<HTMLDivElement | null>;
    data: { name: string; value: number }[];
    filename: string;
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white">
                    <Download className="h-3.5 w-3.5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl p-1.5">
                <DropdownMenuItem onClick={() => downloadSVG(chartRef, filename)} className="rounded-lg text-xs font-bold gap-x-2 cursor-pointer">
                    <Code className="h-3.5 w-3.5" /> SVG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => downloadPNG(chartRef, filename)} className="rounded-lg text-xs font-bold gap-x-2 cursor-pointer">
                    <Image className="h-3.5 w-3.5" /> PNG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => downloadCSV(data, filename)} className="rounded-lg text-xs font-bold gap-x-2 cursor-pointer">
                    <FileText className="h-3.5 w-3.5" /> CSV
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// ─── Main Component ──────────────────────────────────────
export function DemographicsPanel({ students, classes, documentStats }: DemographicsPanelProps) {
    const [selectedClass, setSelectedClass] = useState<string>("all");

    const genderRef = useRef<HTMLDivElement>(null);
    const categoryRef = useRef<HTMLDivElement>(null);
    const religionRef = useRef<HTMLDivElement>(null);
    const ageRef = useRef<HTMLDivElement>(null);
    const docRef = useRef<HTMLDivElement>(null);

    // Filter students by class
    const filtered = selectedClass === "all"
        ? students
        : students.filter(s => s.class_id === selectedClass);

    const filteredIds = new Set(filtered.map(s => s.id));

    // Compute chart data
    const genderData = toChartData(groupBy(filtered, s => s.gender || "Not Specified"));
    const categoryData = toChartData(groupBy(filtered, s => s.category || "General"));
    const religionData = toChartData(groupBy(filtered, s => s.religion || "Not Specified"));
    const ageData = toChartData(groupBy(filtered, s => getAgeGroup(s.date_of_birth)));

    // Document completeness
    const filteredDocs = documentStats.filter(d => filteredIds.has(d.student_id));
    const docGroups = { Complete: 0, Partial: 0, Missing: 0 };
    filteredDocs.forEach(d => {
        if (d.doc_count >= REQUIRED_DOCS) docGroups.Complete++;
        else if (d.doc_count > 0) docGroups.Partial++;
        else docGroups.Missing++;
    });
    // Students with NO document record at all
    const studentsWithDocs = new Set(filteredDocs.map(d => d.student_id));
    docGroups.Missing += filtered.filter(s => !studentsWithDocs.has(s.id)).length;
    const docData = toChartData(docGroups as any);

    // Pie chart label
    const renderLabel = ({ name, percent }: any) =>
        `${name} ${(percent * 100).toFixed(0)}%`;

    return (
        <div className="space-y-8">
            {/* Section Header + Filter */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 reveal-1">
                <div className="flex items-center gap-x-6">
                    <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center indigo-glow shadow-inner">
                        <PieChartIcon className="h-7 w-7 text-indigo-500" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">
                            Advanced Demographics
                        </h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-1">
                            Student population segmentation • {filtered.length} records
                        </p>
                    </div>
                </div>

                <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger className="w-[240px] h-12 rounded-2xl border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 font-black text-[10px] uppercase tracking-widest shadow-sm hover:shadow-md transition-all active:scale-95">
                        <Filter className="h-4 w-4 mr-2 text-slate-400" />
                        <SelectValue placeholder="Filter by class" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800">
                        <SelectItem value="all" className="font-black text-[10px] uppercase tracking-widest">All Classes</SelectItem>
                        {classes.map(c => (
                            <SelectItem key={c.id} value={c.id} className="font-bold text-xs uppercase tracking-wider">
                                {c.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Charts Grid */}
            <div className="grid gap-8 md:grid-cols-2 reveal-2">
                {/* 1. Gender Distribution */}
                <Card className="card-interactive rounded-[3rem] overflow-hidden border-none shadow-2xl">
                    <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-x-3">
                            <div className="h-9 w-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <Users className="h-4.5 w-4.5 text-blue-500" />
                            </div>
                            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                                Gender Distribution
                            </CardTitle>
                        </div>
                        <ExportMenu chartRef={genderRef} data={genderData} filename="gender-distribution" />
                    </CardHeader>
                    <CardContent className="p-6 pt-2" ref={genderRef}>
                        {genderData.length === 0 ? (
                            <EmptyState icon={Users} label="No gender data available" />
                        ) : (
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie
                                        data={genderData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={65}
                                        outerRadius={110}
                                        paddingAngle={4}
                                        dataKey="value"
                                        label={renderLabel}
                                        labelLine={false}
                                        stroke="none"
                                    >
                                        {genderData.map((_, i) => (
                                            <Cell key={i} fill={GENDER_COLORS[i % GENDER_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* 2. Caste/Category Breakdown */}
                <Card className="card-interactive rounded-[3rem] overflow-hidden border-none shadow-2xl">
                    <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-x-3">
                            <div className="h-9 w-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                <UserCheck className="h-4.5 w-4.5 text-amber-500" />
                            </div>
                            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                                Category Breakdown
                            </CardTitle>
                        </div>
                        <ExportMenu chartRef={categoryRef} data={categoryData} filename="category-breakdown" />
                    </CardHeader>
                    <CardContent className="p-6 pt-2" ref={categoryRef}>
                        {categoryData.length === 0 ? (
                            <EmptyState icon={BarChart3} label="No category data available" />
                        ) : (
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={categoryData} layout="vertical" margin={{ left: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(148,163,184,0.15)" />
                                    <XAxis type="number" tick={{ fontSize: 11, fontWeight: 700, fill: "#94a3b8" }} />
                                    <YAxis dataKey="name" type="category" width={60} tick={{ fontSize: 11, fontWeight: 700, fill: "#94a3b8" }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
                                        {categoryData.map((_, i) => (
                                            <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* 3. Religion Distribution */}
                <Card className="card-interactive rounded-[3rem] overflow-hidden border-none shadow-2xl">
                    <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-x-3">
                            <div className="h-9 w-9 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                <BookOpen className="h-4.5 w-4.5 text-purple-500" />
                            </div>
                            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                                Religion Distribution
                            </CardTitle>
                        </div>
                        <ExportMenu chartRef={religionRef} data={religionData} filename="religion-distribution" />
                    </CardHeader>
                    <CardContent className="p-6 pt-2" ref={religionRef}>
                        {religionData.length === 0 ? (
                            <EmptyState icon={BarChart3} label="No religion data available" />
                        ) : (
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={religionData} margin={{ bottom: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.15)" />
                                    <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }} interval={0} angle={-30} textAnchor="end" height={50} />
                                    <YAxis tick={{ fontSize: 11, fontWeight: 700, fill: "#94a3b8" }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={32}>
                                        {religionData.map((_, i) => (
                                            <Cell key={i} fill={RELIGION_COLORS[i % RELIGION_COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* 4. Age Groups */}
                <Card className="card-interactive rounded-[3rem] overflow-hidden border-none shadow-2xl">
                    <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-x-3">
                            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                <BarChart3 className="h-4.5 w-4.5 text-emerald-500" />
                            </div>
                            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                                Age Group Distribution
                            </CardTitle>
                        </div>
                        <ExportMenu chartRef={ageRef} data={ageData} filename="age-groups" />
                    </CardHeader>
                    <CardContent className="p-6 pt-2" ref={ageRef}>
                        {ageData.length === 0 ? (
                            <EmptyState icon={BarChart3} label="No age data available" />
                        ) : (
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={ageData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.15)" />
                                    <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700, fill: "#94a3b8" }} />
                                    <YAxis tick={{ fontSize: 11, fontWeight: 700, fill: "#94a3b8" }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={40}>
                                        {ageData.map((_, i) => (
                                            <Cell key={i} fill={AGE_COLORS[i % AGE_COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* 5. Document Status — Full Width */}
            <Card className="card-premium rounded-[3rem] overflow-hidden reveal-3 shadow-2xl relative border-none">
                <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/5 via-transparent to-transparent pointer-events-none" />
                <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-x-3">
                        <div className="h-9 w-9 rounded-xl bg-teal-500/10 flex items-center justify-center">
                            <FileCheck2 className="h-4.5 w-4.5 text-teal-500" />
                        </div>
                        <div>
                            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                                Document Compliance
                            </CardTitle>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                {REQUIRED_DOCS} required documents per student
                            </p>
                        </div>
                    </div>
                    <ExportMenu chartRef={docRef} data={docData} filename="document-status" />
                </CardHeader>
                <CardContent className="p-6 pt-2" ref={docRef}>
                    {filtered.length === 0 ? (
                        <EmptyState icon={FileCheck2} label="No students to analyze" />
                    ) : (
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="w-full md:w-1/2">
                                <ResponsiveContainer width="100%" height={260}>
                                    <PieChart>
                                        <Pie
                                            data={docData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={4}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {docData.map((_, i) => (
                                                <Cell key={i} fill={DOC_COLORS[i % DOC_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="w-full md:w-1/2 space-y-4">
                                {docData.map((d, i) => (
                                    <div key={d.name} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-x-3">
                                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: DOC_COLORS[i] }} />
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{d.name}</span>
                                        </div>
                                        <div className="flex items-center gap-x-3">
                                            <span className="text-xl font-black text-slate-900 dark:text-white">{d.value}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                                                {filtered.length > 0 ? `${((d.value / filtered.length) * 100).toFixed(0)}%` : "—"}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
