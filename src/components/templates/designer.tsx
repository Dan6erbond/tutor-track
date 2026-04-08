import { useEffect, useRef, memo } from "react";
import { Designer } from "@pdfme/ui";
import { type Template } from "@pdfme/common";
import plugins from "@/lib/pdfme/plugins";

interface TemplateDesignerProps {
  template: Template;
  onChange: (template: Template) => void;
  onInstanceReady?: (instance: Designer) => void;
}

export const TemplateDesigner = memo(
  ({ template, onChange, onInstanceReady }: TemplateDesignerProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const designerRef = useRef<Designer | null>(null);

    useEffect(() => {
      if (containerRef.current && !designerRef.current) {
        designerRef.current = new Designer({
          domContainer: containerRef.current,
          plugins,
          template,
        });

        designerRef.current.onChangeTemplate(onChange);
        onInstanceReady?.(designerRef.current);
      }

      return () => {
        designerRef.current?.destroy();
        designerRef.current = null;
      };
    }, []);

    // Update background if basePdf changes externally (from the modal)
    useEffect(() => {
      if (
        designerRef.current &&
        template.basePdf !== designerRef.current.getTemplate().basePdf
      ) {
        designerRef.current.updateTemplate(template);
      }
    }, [template.basePdf]);

    return (
      <div className="flex-1 border-2 border-divider rounded-[40px] overflow-hidden bg-background shadow-inner">
        <div ref={containerRef} className="w-full h-full" />
      </div>
    );
  },
);

TemplateDesigner.displayName = "TemplateDesigner";
