import { databaseId, tableIds } from "@/lib/appwrite/const";
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
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { ID, Permission, Role } from "appwrite";
import { GraduationCap, Plus, Search, UserPlus, Users } from "lucide-react";

import { StudentCard } from "@/components/students/card";
import { useAppwrite } from "@/contexts/appwrite";
import { useAuth } from "@/contexts/auth";
import { useStudentsInfiniteQueryOptions } from "@/queries/students";
import { useInfiniteScroll } from "@heroui/use-infinite-scroll";
import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { useState, type Ref } from "react";

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
    onSubmit: async ({ value: { email, ...value } }) =>
      createStudentMutation.mutateAsync({
        ...value,
        email: (email || null) as string,
      }),
  });

  return (
    <>
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-10">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-accent px-3 py-1 bg-accent/10 w-fit rounded-full">
            <GraduationCap className="size-4" />
            <span className="font-bold uppercase tracking-widest text-[10px]">
              TutorTrack Roster
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground">
            Students
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-md">
            Manage your roster and track student progress.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="bg-background px-5 py-3 rounded-2xl border border-divider flex items-center justify-between sm:justify-start gap-4 shadow-sm min-w-40">
            <div className="size-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Users className="size-5 text-accent" />
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase font-black text-muted-foreground mb-0.5">
                Active
              </p>
              <p className="text-2xl font-black tabular-nums leading-none">
                {totalCount}
              </p>
            </div>
          </div>
          <Button
            onPress={() => setIsDrawerOpen(true)}
            variant="primary"
            className="h-14 px-8 rounded-2xl font-black text-base shadow-lg shadow-accent-soft-hover"
          >
            <Plus className="size-5 mr-1" strokeWidth={3} /> Register Student
          </Button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative group flex-1 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
          <Input
            fullWidth
            placeholder="Search by name or email..."
            className="pl-12 h-13 bg-background border-divider hover:border-accent/40 rounded-2xl focus:ring-2 focus:ring-accent-soft-hover transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
          {allStudents.map((student) => (
            <StudentCard key={student.$id} student={student} />
          ))}

          {/* Infinite Loader Skeletons */}
          {hasNextPage && (
            <div
              ref={loaderRef as Ref<HTMLDivElement>}
              className="grid grid-cols-1 gap-4 w-full"
            >
              {[...Array(2)].map((_, i) => (
                <Card
                  key={i}
                  className="p-5 flex flex-row items-center gap-5 rounded-[2rem] border-divider bg-muted/10"
                >
                  <Skeleton className="size-14 rounded-2xl" />
                  <div className="space-y-3 flex-1">
                    <Skeleton className="h-5 w-1/4 rounded-lg" />
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
                        <Label className="font-black text-[10px] uppercase tracking-wider text-muted-foreground ml-1">
                          Full Name
                        </Label>
                        <Input
                          name={field.name}
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          variant="primary"
                          className="h-12 rounded-xl"
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
