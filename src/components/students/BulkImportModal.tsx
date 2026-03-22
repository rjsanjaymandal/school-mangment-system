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
                    className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors ${isDragActive
                            ? "border-blue-500 bg-blue-50/50"
                            : "border-border hover:border-slate-300 hover:bg-slate-50/50"
                        }`}
                >
                    <input {...getInputProps()} />
                    <UploadCloud className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-700 mb-2">
                        Upload CSV File
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6">
                        Drag and drop your spreadsheet here, or click to browse.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <FileType className="w-4 h-4" />
                        <span>Accepts .csv files only</span>
                    </div>
                </div>
            )}

            {/* Download Template Help */}
            {!file && (
                <div className="text-center">
                    <button onClick={downloadTemplate} className="text-sm text-blue-600 hover:underline font-medium">Download CSV Template</button>
                </div>
            )}

            {/* File Selected State */}
            {file && !importResult && (
                <div className="space-y-6">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-border">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                            <FileType className="w-5 h-5 text-blue-600" />
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
                            disabled={isProcessing}
                        >
                            Remove
                        </Button>
                    </div>

                    {errors.length > 0 && (
                        <div className="bg-red-50 text-red-700 p-4 rounded-2xl text-sm space-y-2 border border-red-100">
                            <div className="font-bold flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" /> Validation Errors Found
                            </div>
                            <ul className="list-disc list-inside space-y-1 max-h-32 overflow-y-auto pl-2">
                                {errors.map((err, i) => (
                                    <li key={i}>{err}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {previewData.length > 0 && errors.length === 0 && (
                        <div className="bg-green-50 text-green-700 p-4 rounded-2xl text-sm border border-green-100 flex items-center gap-2 font-medium">
                            <CheckCircle2 className="w-5 h-5" />
                            Valid file ready to import {previewData.length} students.
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleImport}
                            disabled={isProcessing || errors.length > 0 || previewData.length === 0}
                            className="bg-card text-white rounded-xl gap-2 font-bold min-w-[120px]"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Importing...
                                </>
                            ) : (
                                "Import Data"
                            )}
                        </Button>
                    </div>
                </div>
            )}

            {/* Import Result State */}
            {importResult && (
                <div className="space-y-6 text-center py-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">Import Complete</h3>
                    <div className="flex justify-center gap-6 mt-4">
                        <div className="text-center">
                            <div className="text-3xl font-black text-green-600">{importResult.successCount}</div>
                            <div className="text-sm font-medium text-muted-foreground">Success</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-black text-red-500">{importResult.failCount}</div>
                            <div className="text-sm font-medium text-muted-foreground">Failed</div>
                        </div>
                    </div>

                    {importResult.errors.length > 0 && (
                        <div className="mt-6 text-left bg-slate-50 rounded-2xl p-4 border text-sm max-h-40 overflow-y-auto">
                            <span className="font-bold text-slate-700 block mb-2">Error Log:</span>
                            <ul className="text-foreground/70 space-y-1 text-xs">
                                {importResult.errors.map((e, i) => (
                                    <li key={i}>{e}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <Button onClick={onSuccess} className="w-full mt-6 bg-card rounded-xl font-bold text-white">
                        Done
                    </Button>
                </div>
            )}
        </div>
    );
}

