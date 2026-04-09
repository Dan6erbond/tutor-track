import {
  Button,
  Card,
  Drawer,
  FieldError,
  Input,
  Label,
  Skeleton,
  Spinner,
  TextField,
  ColorPicker,
  ColorArea,
  ColorSlider,
  ColorSwatch,
  ColorSwatchPicker,
  parseColor,
  type Color,
} from "@heroui/react";
import { BookOpen, Palette, Plus, Library } from "lucide-react";
import { ID, Permission, Role } from "appwrite";
import { databaseId, tableIds } from "@/lib/appwrite/const";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { createFileRoute } from "@tanstack/react-router";
import { useAppwrite } from "@/contexts/appwrite";
import { useAuth } from "@/contexts/auth";
import { useForm } from "@tanstack/react-form";
import { useInfiniteScroll } from "@heroui/use-infinite-scroll";
import { useState, type Ref } from "react";
import { useSubjectsInfiniteQueryOptions } from "@/queries/subjects";
import { SubjectCard } from "@/components/subjects/card";

export const Route = createFileRoute("/app/subjects")({
  component: SubjectsPage,
});

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

function SubjectsPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<Color>(
    parseColor("#3b82f6"),
  );

  const { tables } = useAppwrite();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // --- Infinite Query ---
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery(useSubjectsInfiniteQueryOptions());

  const allSubjects = data?.pages.flatMap((page) => page.rows) ?? [];
  const totalCount = data?.pages[0]?.total ?? 0;

  // --- Infinite Scroll ---
  const [loaderRef] = useInfiniteScroll({
    hasMore: hasNextPage,
    shouldUseLoader: true,
    onLoadMore: () => {
      if (!isFetchingNextPage) fetchNextPage();
    },
  });

  // --- Create Mutation ---
  const createSubjectMutation = useMutation({
    mutationFn: async (values: { name: string; color: string }) => {
      return await tables.createRow({
        databaseId,
        tableId: tableIds.subjects,
        rowId: ID.unique(),
        data: {
          name: values.name,
          color: values.color,
          userId: user!.$id,
        },
        permissions: [
          Permission.read(Role.user(user!.$id)),
          Permission.update(Role.user(user!.$id)),
          Permission.delete(Role.user(user!.$id)),
        ],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      setIsDrawerOpen(false);
      form.reset();
    },
  });

  const form = useForm({
    defaultValues: { name: "" },
    onSubmit: async ({ value }) =>
      createSubjectMutation.mutate({
        name: value.name,
        color: selectedColor.toString("hex"),
      }),
  });

  return (
    <>
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-accent px-3 py-1 bg-accent/10 w-fit rounded-full">
            <BookOpen className="size-4" />
            <span className="font-bold uppercase tracking-widest text-[10px]">
              TutorTrack Curriculum
            </span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-foreground">
            Subjects
          </h1>
          <p className="text-muted-foreground text-lg max-w-md">
            Define your teaching topics and categorize your sessions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex bg-muted/20 px-4 py-2 rounded-2xl border border-divider items-center gap-3">
            <Library className="size-4 text-muted-foreground" />
            <span className="text-sm font-bold tabular-nums text-foreground">
              {totalCount} Total
            </span>
          </div>
          <Button
            onPress={() => setIsDrawerOpen(true)}
            variant="primary"
            className="bg-accent text-accent-foreground font-bold h-14 px-8 rounded-2xl shadow-lg shadow-accent/20 flex-1 sm:flex-none"
          >
            <Plus className="size-5 mr-1" /> New Subject
          </Button>
        </div>
      </header>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Spinner color="accent" size="lg" />
          <p className="text-sm font-bold text-muted-foreground uppercase">
            Syncing Subjects
          </p>
        </div>
      ) : allSubjects.length === 0 ? (
        <Card className="py-24 text-center border-3 border-dashed rounded-[40px] bg-transparent border-muted/30 flex flex-col items-center gap-6">
          <Palette className="size-12 text-accent" />
          <h3 className="text-2xl font-black">No subjects defined</h3>
          <Button variant="secondary" onPress={() => setIsDrawerOpen(true)}>
            Add Your First Subject
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allSubjects.map((subject) => (
            <SubjectCard key={subject.$id} subject={subject} />
          ))}

          {/* Infinite Scroll Trigger with properly sized skeletons */}
          {hasNextPage && (
            <div
              ref={loaderRef as Ref<HTMLDivElement>}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 col-span-full w-full"
            >
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-[2rem]" />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Registration Drawer */}
      <Drawer isOpen={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <Drawer.Backdrop />
        <Drawer.Content placement="right">
          <Drawer.Dialog className="max-w-md">
            <Drawer.Header>
              <Drawer.Heading className="text-3xl font-black">
                Register Subject
              </Drawer.Heading>
            </Drawer.Header>
            <Drawer.Body className="py-8 space-y-8">
              <form
                id="subject-form"
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
                        placeholder="e.g. Advanced Calculus"
                      />
                      <FieldError className="text-danger font-bold text-xs mt-1">
                        {field.state.meta.errors}
                      </FieldError>
                    </TextField>
                  )}
                </form.Field>

                <div className="flex flex-col gap-3">
                  <Label className="font-bold text-xs uppercase text-accent tracking-widest">
                    Identification Color
                  </Label>
                  <ColorPicker
                    value={selectedColor}
                    onChange={setSelectedColor}
                  >
                    <ColorPicker.Trigger>
                      <Button
                        variant="secondary"
                        className="justify-between h-14 rounded-2xl w-full border-2 border-transparent hover:border-divider transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <ColorSwatch
                            color={selectedColor.toString("css")}
                            className="rounded-lg size-6"
                          />
                          <span className="font-mono font-black text-sm">
                            {selectedColor.toString("hex").toUpperCase()}
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
            <Drawer.Footer className="flex flex-col gap-3">
              <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
                {([canSubmit, isSubmitting]) => (
                  <Button
                    type="submit"
                    form="subject-form"
                    variant="primary"
                    className="w-full font-black h-14 rounded-2xl shadow-xl shadow-accent/10"
                    isDisabled={!canSubmit}
                    isPending={isSubmitting || createSubjectMutation.isPending}
                  >
                    Create Subject
                  </Button>
                )}
              </form.Subscribe>
              <Button
                variant="ghost"
                onPress={() => setIsDrawerOpen(false)}
                className="w-full font-bold h-12 rounded-xl text-muted-foreground hover:text-foreground"
              >
                Discard
              </Button>
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer>
    </>
  );
}
