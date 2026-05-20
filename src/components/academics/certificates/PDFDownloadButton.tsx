"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CertificatePDF } from "./CertificatePDF";

interface PDFDownloadButtonProps {
  certificate: any;
  fileName: string;
}

export function PDFDownloadButton({
  certificate,
  fileName,
}: PDFDownloadButtonProps) {
  return (
    <PDFDownloadLink
      document={<CertificatePDF certificate={certificate} />}
      fileName={fileName}
    >
      {({ loading }) => (
        <Button
          variant="ghost"
          size="icon"
          disabled={loading}
          className="h-9 w-9 border border-border rounded-sm text-foreground/40 hover:text-primary hover:border-primary transition-all"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
