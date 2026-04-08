import { FileUp, UploadCloud } from "lucide-react";

import { useState } from "react";

interface PdfUploadDropzoneProps {
  onUpload: (base64: string) => void;
}

export function PdfUploadDropzone({ onUpload }: PdfUploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (file.type !== "application/pdf") return;
    const reader = new FileReader();
    reader.onload = (e) => onUpload(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
      }}
      className={`group flex flex-col items-center justify-center w-full h-56 border-2 border-dashed rounded-[32px] cursor-pointer transition-all ${
        isDragging
          ? "border-accent bg-accent/5 scale-[0.98]"
          : "border-divider hover:border-accent/40 hover:bg-accent/5"
      }`}
    >
      <div className="flex flex-col items-center text-center px-4">
        <div
          className={`size-16 rounded-2xl flex items-center justify-center mb-4 transition-transform ${
            isDragging
              ? "bg-accent text-white scale-110"
              : "bg-accent-soft/10 text-accent group-hover:scale-110"
          }`}
        >
          {isDragging ? (
            <UploadCloud className="size-8" />
          ) : (
            <FileUp className="size-8" />
          )}
        </div>
        <p className="font-bold text-sm">
          {isDragging ? "Drop to upload" : "Drop your background PDF here"}
        </p>
        <p className="text-xs text-muted-foreground mt-1 font-medium">
          Replaces the current layout background.
        </p>
      </div>
      <input
        type="file"
        className="hidden"
        accept=".pdf"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
    </label>
  );
}
