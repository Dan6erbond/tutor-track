import plugins from "@/lib/pdfme/plugins";
import { type Template } from "@pdfme/common";
import { Designer } from "@pdfme/ui";
import { useEffect, useRef } from "react";

interface TemplateDesignerProps {
  initialTemplate: Template;
  onChange: (template: Template) => void;
  onInstanceReady?: (instance: Designer) => void;
}

export const TemplateDesigner = ({
  initialTemplate,
  onChange,
  onInstanceReady,
}: TemplateDesignerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const designerRef = useRef<Designer | null>(null);

  useEffect(() => {
    if (containerRef.current && !designerRef.current) {
      designerRef.current = new Designer({
        domContainer: containerRef.current,
        plugins,
        template: initialTemplate,
      });

      designerRef.current.onChangeTemplate(onChange);
      onInstanceReady?.(designerRef.current);
    }

    return () => {
      designerRef.current?.destroy();
      designerRef.current = null;
    };
  }, [containerRef, designerRef]);

  return (
    <div className="flex-1 border-2 border-divider rounded-2xl overflow-hidden bg-background shadow-inner">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};

TemplateDesigner.displayName = "TemplateDesigner";
