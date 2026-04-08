import {
  Button,
  Calendar,
  Card,
  DateField,
  DatePicker,
  Drawer,
  Label,
  NumberField,
  Skeleton,
  Spinner,
  Tabs,
  TextField,
} from "@heroui/react";
import { useInfiniteScroll } from "@heroui/use-infinite-scroll";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarIcon, CalendarX, Plus } from "lucide-react";
import { useState, type Ref } from "react";

import { SessionCard } from "@/components/sessions/card";
import { StudentSelect } from "@/components/students/select";
import { SubjectSelect } from "@/components/subjects/select";
import { useCreateSessionMutationOptions } from "@/mutations/sessions";
import {
  useSessionsInfiniteQueryOptions,
  type SessionFilter,
} from "@/queries/sessions";
import { getLocalTimeZone, now } from "@internationalized/date";
import { useForm } from "@tanstack/react-form";

export const Route = createFileRoute("/app/sessions/")({
  component: SessionsPage,
});

function SessionsPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [filter, setFilter] = useState<SessionFilter>("upcoming");

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery(useSessionsInfiniteQueryOptions(filter));

  const allSessions = data?.pages.flatMap((p) => p.rows) ?? [];
  const totalCount = data?.pages[0]?.total ?? 0;

  const [loaderRef] = useInfiniteScroll({
    hasMore: hasNextPage,
    onLoadMore: () => {
      if (!isFetchingNextPage) fetchNextPage();
    },
  });

  const createSessionMutationOptions = useCreateSessionMutationOptions();
  const createSessionMutation = useMutation({
    ...createSessionMutationOptions,
    onSuccess: () => {
      // Re-run the base success logic (invalidation)
      createSessionMutationOptions.onSuccess?.();
      // Close and reset
      setIsDrawerOpen(false);
      form.reset();
    },
  });

  const form = useForm({
    defaultValues: {
      studentId: "",
      subjectId: "",
      date: now(getLocalTimeZone()),
      duration: 60,
      notes: "",
    },
    onSubmit: async ({ value }) => {
      // Convert the ZonedDateTime object to an ISO string for the mutation
      createSessionMutation.mutate({
        ...value,
        date: value.date.toDate().toISOString(),
      });
    },
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-accent px-3 py-1 bg-accent/10 w-fit rounded-full">
            <CalendarIcon className="size-4" />
            <span className="font-bold uppercase tracking-widest text-[10px]">
              TutorTrack Schedule
            </span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter">Sessions</h1>
          <p className="text-muted-foreground text-lg">
            Track your hours and student meetings.
          </p>
        </div>

        <Button
          className="bg-accent text-accent-foreground font-bold h-14 px-8 rounded-2xl shadow-lg shadow-accent-soft-hover"
          onPress={() => setIsDrawerOpen(true)}
        >
          <Plus className="size-5 mr-1" /> Log Session
        </Button>
      </header>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Tabs
          className="w-full"
          variant="secondary"
          selectedKey={filter}
          onSelectionChange={(key) => setFilter(key as SessionFilter)}
        >
          <Tabs.ListContainer>
            <Tabs.List aria-label="Session filter tabs">
              <Tabs.Tab id="upcoming">
                Upcoming
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="completed">
                Completed
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="cancelled">
                Cancelled
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="all">
                All History
                <Tabs.Indicator />
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>
        </Tabs>

        <div className="px-4 py-2 bg-muted/20 rounded-xl border border-divider text-xs font-bold uppercase text-muted-foreground">
          {totalCount} total records
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center py-32 gap-4">
          <Spinner color="accent" size="lg" />
          <p className="text-xs font-black uppercase text-muted-foreground tracking-widest">
            Retrieving Schedule
          </p>
        </div>
      ) : allSessions.length === 0 ? (
        <Card className="py-24 text-center border-3 border-dashed rounded-[40px] bg-transparent border-muted/30 flex flex-col items-center gap-6">
          <CalendarX className="size-12 text-accent" />
          <h3 className="text-2xl font-black">No {filter} sessions</h3>
          <p className="text-muted-foreground">
            Looks like your schedule is clear!
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {allSessions.map((session) => (
            <SessionCard key={session.$id} session={session} />
          ))}

          {hasNextPage && (
            <div ref={loaderRef as Ref<HTMLDivElement>} className="grid gap-4">
              {[1, 2].map((i) => (
                <Card
                  key={i}
                  className="p-6 rounded-3xl bg-muted/10 border-none shadow-none flex gap-4"
                >
                  <Skeleton className="size-12 rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-1/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      <Drawer isOpen={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <Drawer.Backdrop>
          <Drawer.Content placement="right">
            <Drawer.Dialog className="max-w-md">
              <Drawer.Header>
                <Drawer.Heading className="text-3xl font-black text-foreground">
                  Log Session
                </Drawer.Heading>
              </Drawer.Header>

              <Drawer.Body className="py-8">
                <form
                  id="session-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                  }}
                  className="flex flex-col gap-6"
                >
                  {/* Student Section */}
                  <form.Field name="studentId">
                    {(field) => (
                      <StudentSelect
                        value={field.state.value}
                        // Cast the Key to string and handle the null/empty case
                        onChange={(val) =>
                          field.handleChange(val ? String(val) : "")
                        }
                        isInvalid={!!field.state.meta.errors.length}
                      />
                    )}
                  </form.Field>

                  {/* Date and Time */}
                  <form.Field name="date">
                    {(field) => (
                      <DatePicker
                        className="w-full"
                        value={field.state.value}
                        onChange={(val) => {
                          if (val) field.handleChange(val);
                        }}
                        isInvalid={!!field.state.meta.errors.length}
                        // This ensures the time picker is visible
                        granularity="minute"
                      >
                        <Label className="font-bold text-xs uppercase text-accent">
                          Date & Time
                        </Label>
                        <DateField.Group
                          fullWidth
                          className="h-12 bg-muted/20 border-none rounded-xl px-3"
                        >
                          <DateField.Input>
                            {(segment) => (
                              <DateField.Segment segment={segment} />
                            )}
                          </DateField.Input>
                          <DateField.Suffix>
                            <DatePicker.Trigger>
                              <DatePicker.TriggerIndicator />
                            </DatePicker.Trigger>
                          </DateField.Suffix>
                        </DateField.Group>

                        <DatePicker.Popover>
                          <Calendar aria-label="Session date">
                            <Calendar.Header>
                              <Calendar.YearPickerTrigger>
                                <Calendar.YearPickerTriggerHeading />
                                <Calendar.YearPickerTriggerIndicator />
                              </Calendar.YearPickerTrigger>
                              <Calendar.NavButton slot="previous" />
                              <Calendar.NavButton slot="next" />
                            </Calendar.Header>
                            <Calendar.Grid>
                              <Calendar.GridHeader>
                                {(day) => (
                                  <Calendar.HeaderCell>
                                    {day}
                                  </Calendar.HeaderCell>
                                )}
                              </Calendar.GridHeader>
                              <Calendar.GridBody>
                                {(date) => <Calendar.Cell date={date} />}
                              </Calendar.GridBody>
                            </Calendar.Grid>
                            <Calendar.YearPickerGrid>
                              <Calendar.YearPickerGridBody>
                                {({ year }) => (
                                  <Calendar.YearPickerCell year={year} />
                                )}
                              </Calendar.YearPickerGridBody>
                            </Calendar.YearPickerGrid>

                            {/* HeroUI v3 typically places the Time Input automatically if granularity is set */}
                          </Calendar>
                        </DatePicker.Popover>
                      </DatePicker>
                    )}
                  </form.Field>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Subject Section */}
                    <form.Field name="subjectId">
                      {(field) => (
                        <SubjectSelect
                          value={field.state.value}
                          onChange={(val) =>
                            field.handleChange(val ? String(val) : "")
                          }
                          isInvalid={!!field.state.meta.errors.length}
                        />
                      )}
                    </form.Field>

                    {/* Duration */}
                    <form.Field name="duration">
                      {(field) => (
                        <NumberField
                          className="w-full"
                          minValue={0}
                          step={15} // Optional: Adjusts by 15 mins per click
                          value={field.state.value}
                          onChange={(val) => field.handleChange(val)}
                          isInvalid={!!field.state.meta.errors.length}
                        >
                          <Label className="font-bold text-xs uppercase text-accent">
                            Duration (min)
                          </Label>
                          <NumberField.Group className="h-12 bg-muted/20 border-none rounded-xl px-1 overflow-hidden">
                            <NumberField.DecrementButton className="bg-transparent hover:bg-accent/10 text-accent transition-colors border-none" />
                            <NumberField.Input className="bg-transparent font-bold text-center" />
                            <NumberField.IncrementButton className="bg-transparent hover:bg-accent/10 text-accent transition-colors border-none" />
                          </NumberField.Group>
                        </NumberField>
                      )}
                    </form.Field>
                  </div>

                  {/* Notes */}
                  <form.Field name="notes">
                    {(field) => (
                      <TextField>
                        <Label className="font-bold text-xs uppercase text-accent">
                          Notes
                        </Label>
                        <textarea
                          className="min-h-25 w-full rounded-xl bg-muted/20 border-none p-3 text-sm"
                          placeholder="What did you cover?"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
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
                      form="session-form"
                      className="w-full bg-accent text-accent-foreground font-black h-12 rounded-xl"
                      isDisabled={!canSubmit}
                      isPending={
                        isSubmitting || createSessionMutation.isPending
                      }
                    >
                      Save Session
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
    </div>
  );
}
