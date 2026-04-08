import { Card } from "@heroui/react";
import { FileText } from "lucide-react";

interface PDFViewerProps {
  url: string;
}

export function PDFViewer({ url }: PDFViewerProps) {
  return (
    <Card className="w-full bg-default-50 border-none shadow-sm overflow-hidden flex flex-col min-h-200">
      <div className="p-4 border-b border-default-200 bg-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-accent" />
          <span className="text-sm font-bold">Document Preview</span>
        </div>
      </div>
      <div className="flex-1 w-full bg-default-200">
        {/* We add #toolbar=0 to keep the "Soft Pro" clean look inside our UI */}
        <iframe
          src={`${url}#toolbar=0`}
          className="w-full h-full min-h-187.5"
          style={{ border: "none" }}
        />
      </div>
    </Card>
  );
}
