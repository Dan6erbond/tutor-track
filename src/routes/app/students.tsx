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
} from "@heroui/react";
import { GraduationCap, Plus, Search, User, UserPlus } from "lucide-react";
import { ID, Permission, Role } from "appwrite";
import { databaseId, tableIds } from "@/lib/appwrite/const";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { StudentCard } from "@/components/students/card";
import { createFileRoute } from "@tanstack/react-router";
import { useAppwrite } from "@/contexts/appwrite";
import { useAuth } from "@/contexts/auth";
import { useForm } from "@tanstack/react-form";
import { useInfiniteScroll } from "@heroui/use-infinite-scroll";
import { useState, type Ref } from "react";
import { useStudentsInfiniteQueryOptions } from "@/queries/students";

export const Route = createFileRoute("/app/students")({
  component: StudentsPage,
});

function StudentsPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { tables } = useAppwrite();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // --- Infinite Query ---
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery(useStudentsInfiniteQueryOptions(search));

  const allStudents = data?.pages.flatMap((page) => page.rows) ?? [];
  const totalCount = data?.pages[0]?.total ?? 0;

  // --- Infinite Scroll Hook ---
  const [loaderRef] = useInfiniteScroll({
    hasMore: hasNextPage,
    shouldUseLoader: true,
    onLoadMore: () => {
      if (!isFetchingNextPage) fetchNextPage();
    },
  });

  // --- Create Mutation ---
  const createStudentMutation = useMutation({
    mutationFn: async (values: { name: string; email: string }) => {
      return await tables.createRow({
        databaseId,
        tableId: tableIds.students,
        rowId: ID.unique(),
        data: {
          name: values.name,
          email: values.email || null,
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
      queryClient.invalidateQueries({ queryKey: ["students"] });
      setIsDrawerOpen(false);
      form.reset();
    },
  });

  const form = useForm({
    defaultValues: { name: "", email: "" },
    onSubmit: async ({ value }) => createStudentMutation.mutate(value),
  });

  return (
    <>
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-accent px-3 py-1 bg-accent/10 w-fit rounded-full">
            <GraduationCap className="size-4" />
            <span className="font-bold uppercase tracking-widest text-[10px]">
              TutorTrack Roster
            </span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-foreground">
            Students
          </h1>
          <p className="text-muted-foreground text-lg max-w-md">
            Manage your roster and track student progress.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-background px-6 py-3 rounded-2xl border-2 border-accent-soft-hover flex items-center gap-4 shadow-sm">
            <div className="text-right">
              <p className="text-[10px] uppercase font-black text-accent mb-1">
                Active
              </p>
              <p className="text-3xl font-black tabular-nums">{totalCount}</p>
            </div>
            <div className="size-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <User className="size-6 text-accent" />
            </div>
          </div>
          <Button
            onPress={() => setIsDrawerOpen(true)}
            className="bg-accent text-accent-foreground font-bold h-14 px-6 rounded-2xl shadow-lg shadow-accent-soft-hover"
          >
            <Plus className="size-5 mr-1" /> Register Student
          </Button>
        </div>
      </header>

      <div className="relative group max-w-lg">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
        <Input
          placeholder="Search by name or email..."
          className="pl-12 h-12 bg-muted/30 border-none rounded-2xl focus:bg-background transition-all"
          variant="secondary"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Spinner color="accent" size="lg" />
          <p className="text-sm font-bold text-muted-foreground uppercase">
            Loading Records
          </p>
        </div>
      ) : allStudents.length === 0 ? (
        <Card className="py-24 text-center border-3 border-dashed rounded-[40px] bg-transparent border-muted/30 flex flex-col items-center gap-6">
          <UserPlus className="size-12 text-accent" />
          <h3 className="text-2xl font-black">No students found</h3>
          <Button variant="secondary" onPress={() => setIsDrawerOpen(true)}>
            Add Student Now
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {allStudents.map((student) => (
            <StudentCard key={student.$id} student={student} />
          ))}

          {/* Infinite Scroll Trigger & Skeleton */}
          {hasNextPage && (
            <div
              ref={loaderRef as Ref<HTMLDivElement>}
              className="grid gap-4 w-full"
            >
              {[...Array(3)].map((_, i) => (
                <Card
                  key={i}
                  className="p-4 flex flex-row items-center gap-5 rounded-3xl border-2 border-transparent shadow-none bg-muted/20"
                >
                  <Skeleton className="size-14 rounded-2xl" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-1/3 rounded-lg" />
                    <Skeleton className="h-4 w-1/2 rounded-lg" />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Registration Drawer */}
      <Drawer isOpen={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <Drawer.Backdrop>
          <Drawer.Content placement="right">
            <Drawer.Dialog className="max-w-md">
              <Drawer.Header>
                <Drawer.Heading className="text-3xl font-black">
                  Register Student
                </Drawer.Heading>
              </Drawer.Header>
              <Drawer.Body className="py-8">
                <form
                  id="student-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
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
                          Full Name
                        </Label>
                        <Input
                          name={field.name}
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
                  <form.Field name="email">
                    {(field) => (
                      <TextField>
                        <Label className="font-bold text-xs uppercase text-accent">
                          Email (Optional)
                        </Label>
                        <Input
                          name={field.name}
                          type="email"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          variant="secondary"
                          className="h-12"
                        />
                      </TextField>
                    )}
                  </form.Field>
                </form>
              </Drawer.Body>
              <Drawer.Footer className="flex flex-col gap-3">
                <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
                  {([canSubmit, isSubmitting]) => (
                    <Button
                      type="submit"
                      form="student-form"
                      className="w-full bg-accent text-accent-foreground font-black h-12 rounded-xl"
                      isDisabled={!canSubmit}
                      isPending={
                        isSubmitting || createStudentMutation.isPending
                      }
                    >
                      Complete Registration
                    </Button>
                  )}
                </form.Subscribe>
                <Button
                  variant="ghost"
                  onPress={() => setIsDrawerOpen(false)}
                  className="w-full font-bold"
                >
                  Cancel
                </Button>
              </Drawer.Footer>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    </>
  );
}
