import { InstitutionalService } from "@/lib/services/institutional";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    GraduationCap,
    Hash,
    ArrowLeft
} from "lucide-react";
import Link from "next/link";

export default async function StudentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const student = await InstitutionalService.getStudentById(id);

    if (!student) {
        notFound();
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center gap-x-4">
                <Button variant="ghost" size="icon" asChild className="rounded-full">
                    <Link href="/students">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                        Student Profile
                    </h2>
                    <p className="text-slate-500 font-medium tracking-tight">
                        Detailed information and academic record
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Overview */}
                <Card variant="glass" className="p-6 space-y-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="h-24 w-24 rounded-full bg-slate-100 flex items-center justify-center border-4 border-white shadow-lg">
                            <User className="h-12 w-12 text-slate-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">
                                {student.profile?.first_name} {student.profile?.last_name}
                            </h3>
                            <Badge variant="futuristic" className="mt-1">
                                Student
                            </Badge>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-x-3 text-slate-600">
                            <Mail className="h-4 w-4" />
                            <span className="text-sm font-medium">{student.profile?.email}</span>
                        </div>
                        {student.profile?.phone && (
                            <div className="flex items-center gap-x-3 text-slate-600">
                                <Phone className="h-4 w-4" />
                                <span className="text-sm font-medium">{student.profile?.phone}</span>
                            </div>
                        )}
                        {student.profile?.address && (
                            <div className="flex items-start gap-x-3 text-slate-600">
                                <MapPin className="h-4 w-4 mt-1" />
                                <span className="text-sm font-medium leading-relaxed">
                                    {student.profile?.address}
                                </span>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Academic Details */}
                <div className="md:col-span-2 space-y-8">
                    <Card variant="glass" className="p-6">
                        <div className="flex items-center gap-x-2 mb-6">
                            <GraduationCap className="h-5 w-5 text-indigo-500" />
                            <h3 className="text-lg font-bold text-slate-900">Academic Information</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Admission Number</p>
                                <div className="flex items-center gap-x-2">
                                    <Hash className="h-4 w-4 text-slate-400" />
                                    <p className="font-semibold text-slate-900">{student.admission_number}</p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Roll Number</p>
                                <div className="flex items-center gap-x-2">
                                    <Hash className="h-4 w-4 text-slate-400" />
                                    <p className="font-semibold text-slate-900">{student.roll_number || "Not Assigned"}</p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Class</p>
                                <div className="flex items-center gap-x-2">
                                    <Badge variant="futuristic">
                                        {student.class?.name || "Not Enrolled"}
                                    </Badge>
                                </div>
                            </div>
                            {student.date_of_birth && (
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date of Birth</p>
                                    <div className="flex items-center gap-x-2">
                                        <Calendar className="h-4 w-4 text-slate-400" />
                                        <p className="font-semibold text-slate-900">{student.date_of_birth}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Placeholder for more sections like Grades, Attendance, etc. */}
                    <Card variant="glass" className="p-8 border-dashed border-2 flex flex-col items-center justify-center text-center space-y-4 opacity-70">
                        <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-slate-300" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-400">Activity & Records</p>
                            <p className="text-xs text-slate-400">Attendance and grade records will appear here.</p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
