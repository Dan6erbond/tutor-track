import {
  Button,
  Card,
  Drawer,
  Label,
  ListBox,
  Select,
  type Key,
} from "@heroui/react";
import { ChevronRight, FileCheck, Plus } from "lucide-react";

import { SessionMultiSelect } from "@/components/sessions/multi-select";
import { StudentSelect } from "@/components/students/select";
import { useCreateConfirmationMutation } from "@/mutations/confirmations";
import { useConfirmationsQueryOptions } from "@/queries/confirmations";
import { useTemplatesQueryOptions } from "@/queries/templates";
import { useForm } from "@tanstack/react-form";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";

const confirmationSchema = z.object({
  student: z.string().min(1, "Select a student"),
  template: z.string().min(1, "Select a template"),
  sessions: z.array(z.string()),
});

export const Route = createFileRoute("/app/confirmations/")({
  component: ConfirmationsPage,
});

function ConfirmationsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: confirmations } = useSuspenseQuery(
    useConfirmationsQueryOptions(),
  );
  const { data: templates } = useSuspenseQuery(useTemplatesQueryOptions());
  const createMutation = useCreateConfirmationMutation();

  const form = useForm({
    defaultValues: { student: "", template: "", sessions: [] as string[] },
    validators: { onChange: confirmationSchema },
    onSubmit: async ({ value }) => {
      await createMutation.mutateAsync(value);
      setIsOpen(false);
      form.reset();
    },
  });

  return (
    <div className="p-6 space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <FileCheck className="text-accent" /> Confirmations
          </h1>
        </div>
        <Button
          onPress={() => setIsOpen(true)}
          className="bg-accent text-accent-foreground font-bold"
        >
          <Plus className="size-4" />
          New Confirmation
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {confirmations.map((conf) => (
          <Link
            key={conf.$id}
            to="/app/confirmations/$confirmationId"
            params={{ confirmationId: conf.$id }}
            className="group block"
          >
            <Card className="bg-accent-soft/20 border-none shadow-none group-hover:bg-accent-soft/40 transition-colors cursor-pointer">
              <Card.Header className="flex flex-row items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-accent text-accent-foreground flex items-center justify-center font-bold shrink-0">
                    {conf.student?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col items-start overflow-hidden text-left">
                    <Card.Title className="text-sm font-bold truncate w-full">
                      {conf.student?.name}
                    </Card.Title>
                    <Card.Description className="text-xs truncate w-full">
                      {conf.template?.name}
                    </Card.Description>
                  </div>
                </div>
                <ChevronRight className="size-4 opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0" />
              </Card.Header>
            </Card>
          </Link>
        ))}
      </div>

      <Drawer isOpen={isOpen} onOpenChange={setIsOpen}>
        <Drawer.Backdrop>
          <Drawer.Content placement="right">
            <Drawer.Dialog>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  form.handleSubmit();
                }}
              >
                <Drawer.Header>
                  <Drawer.Heading className="text-xl font-bold">
                    New Payment Confirmation
                  </Drawer.Heading>
                </Drawer.Header>
                <Drawer.Body className="space-y-6">
                  <form.Field name="student">
                    {(field) => (
                      <StudentSelect
                        value={field.state.value || null}
                        onChange={(val) => field.handleChange(val as string)}
                        isInvalid={!!field.state.meta.errors.length}
                      />
                    )}
                  </form.Field>

                  <form.Field name="template">
                    {(field) => (
                      <Select
                        className="w-full"
                        value={field.state.value as Key}
                        onChange={(key) => field.handleChange(key as string)}
                        isInvalid={!!field.state.meta.errors.length}
                      >
                        <Label className="font-bold text-xs uppercase text-accent">
                          Template
                        </Label>
                        <Select.Trigger className="h-14">
                          <Select.Value />
                          <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover>
                          <ListBox items={templates}>
                            {(t) => (
                              <ListBox.Item id={t.$id} textValue={t.name}>
                                {t.name}
                              </ListBox.Item>
                            )}
                          </ListBox>
                        </Select.Popover>
                      </Select>
                    )}
                  </form.Field>

                  <form.Field name="sessions">
                    {(field) => (
                      <SessionMultiSelect
                        studentId={form.getFieldValue("student")}
                        value={field.state.value}
                        onChange={(val) => field.handleChange(val as string[])}
                        isInvalid={!!field.state.meta.errors.length}
                      />
                    )}
                  </form.Field>
                </Drawer.Body>
                <Drawer.Footer>
                  <Button variant="secondary" onPress={() => setIsOpen(false)}>
                    Cancel
                  </Button>

                  <Button
                    variant="primary"
                    type="submit"
                    isPending={createMutation.isPending}
                    className="bg-accent text-accent-foreground font-bold"
                  >
                    Create Confirmation
                  </Button>
                </Drawer.Footer>
              </form>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    </div>
  );
}
