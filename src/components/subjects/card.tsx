import { Archive, Hash, Palette, Pencil, Trash2 } from "lucide-react";
import {
  Button,
  Card,
  ColorArea,
  ColorPicker,
  ColorSlider,
  ColorSwatch,
  ColorSwatchPicker,
  Drawer,
  FieldError,
  Input,
  Label,
  Modal,
  TextField,
  parseColor,
} from "@heroui/react";

import type { Subjects } from "@/lib/appwrite/types";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { useSubjectMutations } from "@/mutations/subjects";

interface SubjectCardProps {
  subject: Subjects;
}

const PRESET_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

export function SubjectCard({ subject }: SubjectCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const { updateSubject, archiveSubject } = useSubjectMutations();

  // Initialize color state from existing record
  const [selectedColor, setSelectedColor] = useState(
    parseColor(subject.color || "#3b82f6"),
  );

  // Edit Form Logic
  const form = useForm({
    defaultValues: {
      name: subject.name,
    },
    onSubmit: async ({ value }) => {
      await updateSubject.mutateAsync({
        id: subject.$id,
        data: {
          name: value.name,
          color: selectedColor.toString("hex"),
        },
      });
      setIsEditOpen(false);
    },
  });

  return (
    <>
      <Card className="group p-4 flex flex-row items-center justify-between border-2 border-transparent hover:border-accent/10 hover:bg-accent-soft/5 transition-all duration-300 rounded-3xl shadow-none">
        <div className="flex items-center gap-5">
          <div
            className="size-14 rounded-2xl flex items-center justify-center font-black text-white shadow-lg text-2xl"
            style={{ backgroundColor: subject.color ?? undefined }}
          >
            {subject.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-foreground leading-tight group-hover:text-accent transition-colors">
              {subject.name}
            </span>
            <div className="flex items-center gap-2 text-muted-foreground font-mono text-xs uppercase">
              <Hash className="size-3" />
              {subject.color}
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
                  Edit Subject
                </Drawer.Heading>
              </Drawer.Header>
              <Drawer.Body className="py-6 flex flex-col gap-8">
                <form
                  id={`edit-subject-${subject.$id}`}
                  onSubmit={(e) => {
                    e.preventDefault();
                    form.handleSubmit();
                  }}
                  className="flex flex-col gap-6"
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
                          Subject Name
                        </Label>
                        <Input
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          variant="secondary"
                          className="h-12"
                        />
                        <FieldError className="text-danger font-bold text-xs mt-1">
                          {field.state.meta.errors}
                        </FieldError>
                      </TextField>
                    )}
                  </form.Field>

                  <div className="flex flex-col gap-3">
                    <Label className="font-bold text-xs uppercase text-accent">
                      Identification Color
                    </Label>
                    <ColorPicker
                      value={selectedColor}
                      onChange={setSelectedColor}
                    >
                      <ColorPicker.Trigger>
                        <Button
                          variant="secondary"
                          className="justify-between h-14 rounded-xl w-full"
                        >
                          <div className="flex items-center gap-3">
                            <ColorSwatch
                              color={selectedColor.toString("css")}
                              className="rounded-lg"
                            />
                            <span className="font-mono font-bold uppercase">
                              {selectedColor.toString("hex")}
                            </span>
                          </div>
                          <Palette className="size-4 text-muted-foreground" />
                        </Button>
                      </ColorPicker.Trigger>
                      <ColorPicker.Popover>
                        <ColorArea
                          colorSpace="hsb"
                          xChannel="saturation"
                          yChannel="brightness"
                        >
                          <ColorArea.Thumb />
                        </ColorArea>
                        <ColorSlider channel="hue" colorSpace="hsb">
                          <ColorSlider.Track>
                            <ColorSlider.Thumb />
                          </ColorSlider.Track>
                        </ColorSlider>
                        <ColorSwatchPicker size="sm" className="mt-2">
                          {PRESET_COLORS.map((p) => (
                            <ColorSwatchPicker.Item key={p} color={p}>
                              <ColorSwatchPicker.Swatch />
                            </ColorSwatchPicker.Item>
                          ))}
                        </ColorSwatchPicker>
                      </ColorPicker.Popover>
                    </ColorPicker>
                  </div>
                </form>
              </Drawer.Body>
              <Drawer.Footer className="flex flex-col gap-2">
                <Button
                  type="submit"
                  form={`edit-subject-${subject.$id}`}
                  className="w-full bg-accent text-accent-foreground font-black h-12 rounded-xl"
                  isPending={updateSubject.isPending}
                >
                  Update Subject
                </Button>
                <Button
                  variant="ghost"
                  onPress={() => setIsEditOpen(false)}
                  className="w-full font-bold"
                >
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
                <Modal.Heading>Archive Subject</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <p className="text-muted-foreground">
                  Are you sure you want to archive{" "}
                  <strong>{subject.name}</strong>? It will no longer appear in
                  active session dropdowns.
                </p>
              </Modal.Body>
              <Modal.Footer>
                <Button slot="close" variant="secondary">
                  Keep Subject
                </Button>
                <Button
                  variant="danger"
                  isPending={archiveSubject.isPending}
                  onPress={async () => {
                    await archiveSubject.mutateAsync(subject.$id);
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
