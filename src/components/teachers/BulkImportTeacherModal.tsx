"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { UploadCloud, FileType, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { bulkImportTeachers, BulkTeacherRecord } from "@/app/actions/bulk-import";
import { z } from "zod";

interface BulkImportTeacherModalProps {
    onSuccess: () => void;
    onCancel: () => void;
}

const CsvRowSchema = z.object({
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    email: z.string().email(),
    employee_id: z.string().min(1),
    specialization: z.string().optional(),
    qualification: z.string().min(1),
});

export function BulkImportTeacherModal({ onSuccess, onCancel }: BulkImportTeacherModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [previewData, setPreviewData] = useState<BulkTeacherRecord[]>([]);
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
                const parsedRows: BulkTeacherRecord[] = [];
                const parsingErrors: string[] = [];

                results.data.forEach((row: any, index: number) => {
                    try {
                        const cleanRow = {
                            first_name: row.first_name?.trim(),
                            last_name: row.last_name?.trim(),
                            email: row.email?.trim(),
                            employee_id: row.employee_id?.trim(),
                            specialization: row.specialization?.trim() || undefined,
                            qualification: row.qualification?.trim(),
                        };

                        CsvRowSchema.parse(cleanRow);
                        parsedRows.push(cleanRow as BulkTeacherRecord);
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

        const result = await bulkImportTeachers(previewData);

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
                toast.success(`Successfully imported ${result.successCount} teachers!`);
                setTimeout(onSuccess, 1500);
            } else {
                toast.warning(
                    `Import finished. ${result.successCount} succeeded, ${result.failCount} failed.`
                );
            }
        }
    };

    const downloadTemplate = () => {
        const templateContent = "first_name,last_name,email,employee_id,specialization,qualification\nJane,Smith,jane@example.com,EMP-001,Math\\,Science,M.Sc Mathematics\n";
        const blob = new Blob([templateContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "teacher_import_template.csv");
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {!file && (
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-sm p-12 text-center cursor-pointer transition-all duration-300 ${isDragActive
                            ? "border-primary bg-primary/10 shadow-[inner_0_0_20px_rgba(16,185,129,0.1)]"
                            : "border-border hover:border-primary/40 hover:bg-primary/5 shadow-inner"
                        }`}
                >
                    <input {...getInputProps()} />
                    <UploadCloud className="w-14 h-14 text-primary/40 mx-auto mb-6 animate-pulse" />
                    <h3 className="text-xl font-black text-foreground uppercase tracking-tight mb-2">
                        Upload CSV File
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6">
                        Drag and drop your spreadsheet here, or click to browse.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-[10px] text-foreground/40 font-black uppercase tracking-widest">
                        <FileType className="w-4 h-4 text-primary/60" />
                        <span>Accepts .csv files only</span>
                    </div>
                </div>
            )}

            {!file && (
                <div className="text-center">
                    <button onClick={downloadTemplate} className="text-sm text-blue-600 hover:underline font-medium">Download CSV Template</button>
                </div>
            )}

            {file && !importResult && (
                <div className="space-y-6">
                    <div className="flex items-center gap-4 bg-background/20 p-5 rounded-sm border border-border">
                        <div className="w-12 h-12 rounded-sm bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 shadow-inner">
                            <FileType className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-foreground truncate">
                                {file.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {(file.size / 1024).toFixed(1)} KB
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
                            className="rounded-xs hover:bg-red-500/10 hover:text-red-500 font-black uppercase tracking-widest text-[10px]"
                            disabled={isProcessing}
                        >
                            Remove
                        </Button>
                    </div>

                    {errors.length > 0 && (
                        <div className="bg-red-500/10 text-red-500 p-5 rounded-sm text-xs space-y-3 border border-red-500/20 shadow-inner">
                            <div className="font-black uppercase tracking-widest flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" /> Validation Errors Found
                            </div>
                            <ul className="list-disc list-inside space-y-1.5 max-h-32 overflow-y-auto pl-2 font-bold opacity-80">
                                {errors.map((err, i) => (
                                    <li key={i}>{err}</li>
                                ))}
                            </ul>
                        </div>
                    )}
 
                    {previewData.length > 0 && errors.length === 0 && (
                        <div className="bg-primary/10 text-primary p-5 rounded-sm text-[11px] border border-primary/20 flex items-center gap-3 font-black uppercase tracking-widest shadow-inner">
                            <CheckCircle2 className="w-5 h-5 animate-pulse" />
                            Valid file ready to import {previewData.length} records.
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-6 border-t border-border">
                        <Button variant="outline" onClick={onCancel} disabled={isProcessing} className="rounded-sm font-black uppercase tracking-widest text-[10px] px-6">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleImport}
                            disabled={isProcessing || errors.length > 0 || previewData.length === 0}
                            className="bg-primary text-primary-foreground rounded-sm gap-2 font-black uppercase tracking-[0.2em] text-xs px-8 py-6 h-auto emerald-glow whitespace-nowrap"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                "Initiate Import"
                            )}
                        </Button>
                    </div>
                </div>
            )}

            {importResult && (
                <div className="space-y-8 text-center py-10">
                    <div className="w-20 h-20 bg-primary/10 rounded-sm flex items-center justify-center mx-auto mb-6 border border-primary/20 shadow-inner">
                        <CheckCircle2 className="w-10 h-10 text-primary animate-bounce" />
                    </div>
                    <h3 className="text-3xl font-black text-foreground uppercase tracking-tight">Import Complete</h3>
                    <div className="flex justify-center gap-12 mt-6">
                        <div className="text-center group">
                            <div className="text-4xl font-black text-primary drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">{importResult.successCount}</div>
                            <div className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] mt-1 group-hover:text-primary transition-colors">Success</div>
                        </div>
                        <div className="text-center group">
                            <div className="text-4xl font-black text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.3)]">{importResult.failCount}</div>
                            <div className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] mt-1 group-hover:text-red-500 transition-colors">Failed</div>
                        </div>
                    </div>

                    {importResult.errors.length > 0 && (
                        <div className="mt-8 text-left bg-background/30 rounded-sm p-5 border border-border text-[11px] max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20">
                            <span className="font-black text-foreground/60 uppercase tracking-widest block mb-3 border-b border-border pb-1">Error Telemetry:</span>
                            <ul className="text-foreground/50 space-y-2 font-bold">
                                {importResult.errors.map((e, i) => (
                                    <li key={i} className="flex gap-2"><span className="text-red-500/50">›</span> {e}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <Button onClick={onSuccess} className="w-full mt-8 bg-primary text-primary-foreground rounded-sm font-black uppercase tracking-[0.2em] text-xs py-7 h-auto emerald-glow shadow-xl">
                        Acknowledge & Sync
                    </Button>
                </div>
            )}
        </div>
    );
}

