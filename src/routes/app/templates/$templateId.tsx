import {
  Button,
  FieldError,
  Input,
  Label,
  Modal,
  TextField,
} from "@heroui/react";
import { type Template } from "@pdfme/common";
import { Designer } from "@pdfme/ui";
import { useForm } from "@tanstack/react-form";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FileText, FileUp, Save, X } from "lucide-react";
import { useRef, useState } from "react";

import { TemplateDesigner } from "@/components/templates/designer";
import { PdfUploadDropzone } from "@/components/templates/pdf-upload-dropzone";
import { useUpdateTemplateMutation } from "@/mutations/templates";
import { useTemplateQueryOptions } from "@/queries/templates";
export const Route = createFileRoute("/app/templates/$templateId")({
  component: EditTemplatePage,
});

function EditTemplatePage() {
  const { templateId } = Route.useParams();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const designerRef = useRef<Designer | null>(null);

  // Data Fetching
  const { data: templateData } = useSuspenseQuery(
    useTemplateQueryOptions(templateId),
  );

  const template = JSON.parse(templateData.template) as Template;

  const updateMutation = useMutation({
    ...useUpdateTemplateMutation(templateId),
    onSuccess: () => {
      navigate({ to: "/app/templates" });
    },
  });

  const form = useForm({
    defaultValues: {
      ...templateData,
      template,
    } as { name: string; template: Template },
    onSubmit: async ({ value }) => {
      await updateMutation.mutateAsync({
        name: value.name,
        template: JSON.stringify(value.template),
      });
    },
  });

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div className="flex-1 w-full md:max-w-md">
          <form.Field name="name">
            {(field) => (
              <TextField
                className="w-full"
                isRequired
                isInvalid={!!field.state.meta.errors.length}
              >
                <Label className="text-sm font-bold mb-1">Template Name</Label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                    <FileText className="size-4 text-accent" />
                  </div>
                  <Input
                    placeholder="e.g., Student Progress Letter"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="pl-10 font-bold rounded-2xl border-2 border-divider focus:border-accent transition-colors w-full h-12 bg-secondary"
                  />
                </div>
                <FieldError className="text-xs text-danger font-bold mt-1">
                  {field.state.meta.errors.join(", ")}
                </FieldError>
              </TextField>
            )}
          </form.Field>
        </div>

        <div className="flex items-center gap-3">
          <Modal isOpen={isModalOpen} onOpenChange={setIsModalOpen}>
            <Button
              variant="tertiary"
              className="font-bold rounded-2xl h-12"
              onPress={() => setIsModalOpen(true)}
            >
              <FileUp className="size-5 mr-2" />
              Change Background
            </Button>
            <Modal.Backdrop variant="blur">
              <Modal.Container>
                <Modal.Dialog className="card card--secondary max-w-lg rounded-[32px] p-2">
                  <Modal.Header className="p-6">
                    <Modal.Heading className="text-2xl font-black italic">
                      Update <span className="text-accent">PDF</span>
                    </Modal.Heading>
                    <Button
                      slot="close"
                      isIconOnly
                      variant="tertiary"
                      className="absolute right-4 top-4 rounded-full"
                    >
                      <X className="size-4" />
                    </Button>
                  </Modal.Header>

                  <Modal.Body className="p-6 pt-0">
                    <PdfUploadDropzone
                      onUpload={(base64) => {
                        if (designerRef.current) {
                          // 1. Get current state from designer
                          const currentTemplate =
                            designerRef.current.getTemplate();
                          const newTemplate = {
                            ...currentTemplate,
                            basePdf: base64,
                          };

                          // 2. Sync the canvas/UI immediately
                          designerRef.current.updateTemplate(newTemplate);

                          // 3. Sync the form state for the final Save/Update mutation
                          form.setFieldValue("template", newTemplate);

                          // 4. Close the modal
                          setIsModalOpen(false);
                        }
                      }}
                    />
                  </Modal.Body>

                  <Modal.Footer className="p-6">
                    <Button
                      slot="close"
                      variant="tertiary"
                      className="font-bold rounded-xl w-full"
                    >
                      Cancel
                    </Button>
                  </Modal.Footer>
                </Modal.Dialog>
              </Modal.Container>
            </Modal.Backdrop>
          </Modal>

          <Button
            variant="primary"
            className="font-black px-10 h-12 rounded-2xl shadow-xl shadow-accent-soft-hover"
            onPress={() => form.handleSubmit()}
            isPending={updateMutation.isPending}
          >
            <Save className="size-5 mr-2" />
            Update Template
          </Button>
        </div>
      </div>

      <TemplateDesigner
        initialTemplate={template}
        onChange={(t) => form.setFieldValue("template", t)}
        onInstanceReady={(instance) => {
          designerRef.current = instance;
        }}
      />
    </div>
  );
}
