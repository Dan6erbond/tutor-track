import { useEffect, useRef } from "react";
import { Form } from "@pdfme/ui";
import { BLANK_A4_PDF, type Template } from "@pdfme/common";
import plugins from "@/lib/pdfme/plugins"; // Assuming you've ported your plugins

interface PDFEditorProps {
  templateConfig: string;
  variables: Record<string, any>;
  onDataChange?: (data: Record<string, any>[]) => void;
}

export function PDFEditor({
  templateConfig,
  variables,
  onDataChange,
}: PDFEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<Form | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const parsedTemplate: Template = templateConfig
      ? JSON.parse(templateConfig)
      : { schemas: [[]], basePdf: BLANK_A4_PDF };

    /**
     * Maps the flat variables object to the specific format required by
     * PDFMe schema types for every page in the template.
     */
    const inputs = parsedTemplate.schemas.map((pageSchema) => {
      const pageInput: Record<string, any> = { ...variables };

      pageSchema.forEach((field) => {
        // 1. Handle Multi-Variable Text (Requires JSON string of values)
        if (field.type === "multiVariableText" && "variables" in field) {
          const fieldVars = (field.variables as string[]) || [];
          const values: Record<string, any> = {};

          fieldVars.forEach((v) => {
            values[v] = variables[v] || "";
          });

          pageInput[field.name] = JSON.stringify(values);
        }

        // 2. Handle Tables (Requires JSON string of the array-of-arrays)
        if (field.type === "table" && variables[field.name]) {
          pageInput[field.name] = JSON.stringify(variables[field.name]);
        }
      });

      return pageInput;
    });

    // Initialize Form
    formRef.current = new Form({
      domContainer: containerRef.current,
      plugins,
      template: parsedTemplate,
      inputs, // Inject our calculated variables as the first page input
    });

    // Load fonts asynchronously
    /* getFont().then((font) => {
      formRef.current?.updateOptions({ font });
    }); */

    formRef.current.onChangeInput(() => {
      if (onDataChange && formRef.current) {
        const currentInputs = formRef.current.getInputs();
        onDataChange(currentInputs);
      }
    });

    return () => {
      formRef.current?.destroy();
      formRef.current = null;
    };
  }, [templateConfig, variables]);

  return (
    <div
      ref={containerRef}
      className="w-full h-[calc(100vh-200px)] rounded-xl border border-divider bg-content2 overflow-hidden"
    />
  );
}
