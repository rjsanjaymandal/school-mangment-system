"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { UploadCloud, FileType, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { bulkImportStudents, BulkStudentRecord } from "@/app/actions/bulk-import";
import { z } from "zod";

interface BulkImportModalProps {
    onSuccess: () => void;
    onCancel: () => void;
}

// Ensure the schema here matches what we expect from CSV so we can format errors
const CsvRowSchema = z.object({
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    email: z.string().email(),
    admission_number: z.string().min(1),
    roll_number: z.string().optional(),
    class_id: z.string().optional(),
});

export function BulkImportModal({ onSuccess, onCancel }: BulkImportModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [previewData, setPreviewData] = useState<BulkStudentRecord[]>([]);
    const [errors, setErrors] = useState<string[]>([]);
    const [importResult, setImportResult] = useState<{
        successCount: number;
        failCount: number;
        errors: string[];
    } | null>(null);

    const onDrop = (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;
        const selectedFile = acceptedFiles[0];
        setFile(selectedFile);
        setErrors([]);
        setImportResult(null);

        Papa.parse(selectedFile, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const parsedRows: BulkStudentRecord[] = [];
                const parsingErrors: string[] = [];

                results.data.forEach((row: any, index: number) => {
                    try {
                        // Transform common variations
                        const cleanRow = {
                            first_name: row.first_name?.trim(),
                            last_name: row.last_name?.trim(),
                            email: row.email?.trim(),
                            admission_number: row.admission_number?.trim(),
                            roll_number: row.roll_number?.trim() || undefined,
                            class_id: row.class_id?.trim() || undefined,
                        };

                        CsvRowSchema.parse(cleanRow);
                        parsedRows.push(cleanRow as BulkStudentRecord);
                    } catch (e: any) {
                        parsingErrors.push(`Row ${index + 2}: Invalid data format.`);
                    }
                });

                if (parsingErrors.length > 0) {
                    setErrors(parsingErrors);
                } else {
                    setPreviewData(parsedRows);
                }
            },
            error: (error) => {
                setErrors([`Failed to parse CSV: ${error.message}`]);
            },
        });
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "text/csv": [".csv"],
        },
        maxFiles: 1,
    });

    const handleImport = async () => {
        if (previewData.length === 0) return;

        setIsProcessing(true);
        setErrors([]);

        const result = await bulkImportStudents(previewData);

        setIsProcessing(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            setImportResult({
                successCount: result.successCount || 0,
                failCount: result.failCount || 0,
                errors: result.errors || [],
            });
            if (result.failCount === 0) {
                toast.success(`Successfully imported ${result.successCount} students!`);
                setTimeout(onSuccess, 1500);
            } else {
                toast.warning(
                    `Import finished. ${result.successCount} succeeded, ${result.failCount} failed.`
                );
            }
        }
    };

    const downloadTemplate = () => {
        const templateContent = "first_name,last_name,email,admission_number,roll_number,class_id\nJohn,Doe,john@example.com,ADM-001,101,CLASS-ID-HERE\n";
        const blob = new Blob([templateContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "student_import_template.csv");
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Upload Zone */}
            {!file && (
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-500 rounded-sm bg-background/40 backdrop-blur-md group shadow-2xl ${isDragActive
                            ? "border-primary bg-primary/10 emerald-glow-sm"
                            : "border-border/60 hover:border-primary/40 hover:bg-primary/5"
                        }`}
                >
                    <input {...getInputProps()} />
                    <UploadCloud className="w-16 h-16 text-primary/40 mx-auto mb-6 group-hover:text-primary transition-colors group-hover:scale-110 duration-500" />
                    <h3 className="text-2xl font-black text-foreground uppercase tracking-widest mb-3 italic">
                        Import Student Records
                    </h3>
                    <p className="text-[10px] text-foreground/40 font-black uppercase tracking-[0.2em] mb-8">
                        Upload CSV File
                    </p>
                    <div className="flex items-center justify-center gap-3 text-[9px] font-black uppercase tracking-widest text-primary/60 bg-primary/5 px-4 py-2 rounded-full w-fit mx-auto border border-primary/10">
                        <FileType className="w-4 h-4" />
                        <span>MIME-SPEC: text/csv only</span>
                    </div>
                </div>
            )}

            {/* Download Template Help */}
            {!file && (
                <div className="text-center">
                    <button onClick={downloadTemplate} className="text-[10px] text-primary hover:text-primary/70 font-black uppercase tracking-widest flex items-center justify-center gap-2 mx-auto decoration-primary/30 underline underline-offset-4">
                        <Loader2 className="w-3 h-3" />
                        Student Import Template (CSV)
                    </button>
                </div>
            )}

            {/* File Selected State */}
            {file && !importResult && (
                <div className="space-y-8 p-1">
                    <div className="flex items-center gap-6 bg-primary/5 p-6 rounded-sm border border-primary/20 backdrop-blur-md shadow-2xl relative overflow-hidden group">
                        <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
                        <div className="w-12 h-12 rounded-sm bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30 emerald-glow-sm">
                            <FileType className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-foreground uppercase tracking-widest truncate">
                                {file.name}
                            </p>
                            <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mt-1 italic">
                                File Ready ({(file.size / 1024).toFixed(1)} KB)
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setFile(null);
                                setPreviewData([]);
                                setErrors([]);
                            }}
                            disabled={isProcessing}
                            className="text-[10px] font-black uppercase text-foreground/40 hover:text-primary transition-colors"
                        >
                            Abort
                        </Button>
                    </div>

                    {errors.length > 0 && (
                        <div className="bg-destructive/10 text-destructive p-6 rounded-sm text-[10px] space-y-3 border border-destructive/20 backdrop-blur-md">
                            <div className="font-black flex items-center gap-2 uppercase tracking-widest">
                                <AlertCircle className="w-4 h-4" /> Check your file for errors
                            </div>
                            <ul className="list-disc list-inside space-y-1.5 max-h-40 overflow-y-auto pl-2 font-black uppercase tracking-tight italic opacity-80">
                                {errors.map((err, i) => (
                                    <li key={i}>{err}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {previewData.length > 0 && errors.length === 0 && (
                        <div className="bg-primary/10 text-primary p-6 rounded-sm text-[10px] border border-primary/20 flex items-center gap-3 font-black uppercase tracking-[0.2em] emerald-glow-sm">
                            <CheckCircle2 className="w-6 h-6 animate-pulse" />
                            File is ready. Ready to import {previewData.length} students.
                        </div>
                    )}

                    <div className="flex justify-end gap-4 pt-8 border-t border-border/50">
                        <Button variant="ghost" onClick={onCancel} disabled={isProcessing} className="text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:text-foreground">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleImport}
                            disabled={isProcessing || errors.length > 0 || previewData.length === 0}
                            className="bg-primary text-primary-foreground rounded-sm gap-2 font-black uppercase tracking-[0.2em] text-[10px] px-10 py-6 h-auto emerald-glow shadow-2xl transition-all hover:scale-[1.02]"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Synchronizing...
                                </>
                            ) : (
                                "Start Import"
                            )}
                        </Button>
                    </div>
                </div>
            )}

            {/* Import Result State */}
            {importResult && (
                <div className="space-y-8 text-center py-10 animate-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 bg-primary/10 rounded-sm flex items-center justify-center mx-auto mb-6 border border-primary/20 emerald-glow shadow-2xl">
                        <CheckCircle2 className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-3xl font-black text-foreground uppercase tracking-widest italic underline decoration-primary/30 underline-offset-8">Import Finished</h3>
                    <div className="flex justify-center gap-12 mt-8">
                        <div className="text-center group">
                            <div className="text-5xl font-black text-primary tracking-tighter group-hover:emerald-glow-sm transition-all">{importResult.successCount}</div>
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40 mt-2">Students Imported</div>
                        </div>
                        <div className="text-center group">
                            <div className="text-5xl font-black text-destructive tracking-tighter opacity-80">{importResult.failCount}</div>
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-destructive/40 mt-2">Failed Records</div>
                        </div>
                    </div>

                    {importResult.errors.length > 0 && (
                        <div className="mt-10 text-left bg-background/50 backdrop-blur-md rounded-sm p-6 border border-border/50 text-[10px] max-h-48 overflow-y-auto shadow-2xl">
                            <span className="font-black text-primary uppercase tracking-widest block mb-4 italic">Error Log:</span>
                            <ul className="text-foreground/60 space-y-1.5 font-black uppercase tracking-tight italic pl-2 opacity-80 border-l border-primary/30">
                                {importResult.errors.map((e, i) => (
                                    <li key={i}>{e}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <Button onClick={onSuccess} className="w-full mt-10 bg-primary text-primary-foreground rounded-sm font-black uppercase tracking-[0.3em] py-8 h-auto emerald-glow text-xs shadow-2xl hover:scale-[1.01] transition-all">
                        Close
                    </Button>
                </div>
            )}
        </div>
    );
}

