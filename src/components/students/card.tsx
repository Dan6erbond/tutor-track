import { Archive, Mail, Pencil, Trash2 } from "lucide-react";
import {
  Button,
  Card,
  Drawer,
  FieldError,
  Input,
  Label,
  Modal,
  TextField,
} from "@heroui/react";

import type { Students } from "@/lib/appwrite/types";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { useStudentMutations } from "@/mutations/students";

interface StudentCardProps {
  student: Students;
}

export function StudentCard({ student }: StudentCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const { updateStudent, archiveStudent } = useStudentMutations();

  // Edit Form Logic
  const form = useForm({
    defaultValues: {
      name: student.name,
      email: student.email || "",
    },
    onSubmit: async ({ value: { email, ...value } }) => {
      await updateStudent.mutateAsync({
        id: student.$id,
        data: {
          ...value,
          email: (email || null) as string,
        },
      });
      setIsEditOpen(false);
    },
  });

  return (
    <>
      <Card className="group p-4 flex flex-row items-center justify-between border-2 border-transparent hover:border-accent/10 hover:bg-accent-soft/5 transition-all duration-300 rounded-3xl shadow-none">
        <div className="flex items-center gap-5">
          <div className="size-14 rounded-2xl bg-linear-to-br from-accent to-accent-hover text-accent-foreground flex items-center justify-center font-black text-2xl shadow-lg">
            {student.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-foreground leading-tight group-hover:text-accent transition-colors">
              {student.name}
            </span>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="size-3.5" />
              <span className="text-sm font-medium">
                {student.email || "No email"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="secondary"
            size="sm"
            isIconOnly
            className="rounded-xl"
            onPress={() => setIsEditOpen(true)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="danger-soft"
            size="sm"
            isIconOnly
            className="rounded-xl"
            onPress={() => setIsArchiveOpen(true)}
          >
            <Archive className="size-4" />
          </Button>
        </div>
      </Card>

      {/* EDIT DRAWER */}
      <Drawer isOpen={isEditOpen} onOpenChange={setIsEditOpen}>
        <Drawer.Backdrop>
          <Drawer.Content placement="right">
            <Drawer.Dialog className="max-w-md">
              <Drawer.Header>
                <Drawer.Heading className="text-2xl font-black">
                  Edit Student
                </Drawer.Heading>
              </Drawer.Header>
              <Drawer.Body className="py-6">
                <form
                  id={`edit-form-${student.$id}`}
                  onSubmit={(e) => {
                    e.preventDefault();
                    form.handleSubmit();
                  }}
                  className="flex flex-col gap-5"
                >
                  <form.Field
                    name="name"
                    validators={{
                      onChange: ({ value }) =>
                        !value ? "Name required" : undefined,
                    }}
                  >
                    {(field) => (
                      <TextField isInvalid={!!field.state.meta.errors.length}>
                        <Label className="font-bold text-xs uppercase text-accent">
                          Full Name
                        </Label>
                        <Input
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          variant="secondary"
                        />
                        <FieldError>{field.state.meta.errors}</FieldError>
                      </TextField>
                    )}
                  </form.Field>
                  <form.Field name="email">
                    {(field) => (
                      <TextField>
                        <Label className="font-bold text-xs uppercase text-accent">
                          Email
                        </Label>
                        <Input
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          variant="secondary"
                        />
                      </TextField>
                    )}
                  </form.Field>
                </form>
              </Drawer.Body>
              <Drawer.Footer className="flex flex-col gap-2">
                <Button
                  type="submit"
                  form={`edit-form-${student.$id}`}
                  className="w-full bg-accent text-accent-foreground font-bold"
                  isPending={updateStudent.isPending}
                >
                  Save Changes
                </Button>
                <Button variant="ghost" onPress={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
              </Drawer.Footer>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>

      {/* ARCHIVE MODAL */}
      <Modal isOpen={isArchiveOpen} onOpenChange={setIsArchiveOpen}>
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog className="sm:max-w-100">
              <Modal.Header>
                <Modal.Icon className="bg-danger-soft text-danger">
                  <Trash2 className="size-5" />
                </Modal.Icon>
                <Modal.Heading>Archive Student</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <p className="text-muted-foreground">
                  Are you sure you want to archive{" "}
                  <strong>{student.name}</strong>? They will be removed from
                  your active roster but their history will be preserved.
                </p>
              </Modal.Body>
              <Modal.Footer>
                <Button slot="close" variant="secondary">
                  Keep Student
                </Button>
                <Button
                  variant="danger"
                  isPending={archiveStudent.isPending}
                  onPress={async () => {
                    await archiveStudent.mutateAsync(student.$id);
                    setIsArchiveOpen(false);
                  }}
                >
                  Archive Now
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}
