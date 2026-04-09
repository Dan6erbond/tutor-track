import {
  Button,
  Calendar,
  Card,
  DateField,
  DatePicker,
  Label,
  NumberField,
  TextField,
  ToggleButton,
} from "@heroui/react";
import {
  CalendarCheck,
  ChevronLeft,
  CreditCard,
  Loader2,
  Save,
} from "lucide-react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";

import { StudentSelect } from "@/components/students/select";
import { SubjectSelect } from "@/components/subjects/select";
import { parseAbsoluteToLocal } from "@internationalized/date";
import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { useSessionQueryOptions } from "@/queries/sessions";
import { useUpdateSessionMutationOptions } from "@/mutations/sessions";

export const Route = createFileRoute("/app/sessions/$sessionId")({
  component: SessionDetailPage,
});

function SessionDetailPage() {
  const { sessionId } = Route.useParams();

  const { data: session, isLoading } = useQuery(
    useSessionQueryOptions(sessionId),
  );

  const updateMutation = useMutation(useUpdateSessionMutationOptions());

  const form = useForm({
    defaultValues: {
      studentId: session?.student?.$id || "",
      subjectId: session?.subject?.$id || "",
      date: session?.date
        ? parseAbsoluteToLocal(session.date)
        : parseAbsoluteToLocal(new Date().toISOString()),
      duration: session?.duration || 60,
      notes: session?.notes || "",
      // New Payment Fields
      amountPaid: session?.amountPaid || 0,
      isPaid: !!session?.paidAt,
    },
    onSubmit: async ({ value }) => {
      await updateMutation.mutateAsync({
        sessionId,
        data: {
          student: value.studentId,
          subject: value.subjectId,
          date: value.date.toDate().toISOString(),
          duration: value.duration,
          notes: value.notes || null,
          // If isPaid is toggled on but no date exists, set it to now.
          // If toggled off, null it out.
          amountPaid: value.isPaid ? value.amountPaid : null,
          paidAt: value.isPaid
            ? session?.paidAt || new Date().toISOString()
            : null,
        },
      });
    },
  });

  useEffect(() => {
    if (session) {
      form.reset({
        studentId: session.student?.$id || "",
        subjectId: session.subject?.$id || "",
        date: parseAbsoluteToLocal(session.date),
        duration: session.duration || 60,
        notes: session.notes || "",
        amountPaid: session.amountPaid || 0,
        isPaid: !!session.paidAt,
      });
    }
  }, [session, form]);

  const handleToggleComplete = () => {
    const isCompleted = !!session?.completedAt;
    updateMutation.mutate({
      sessionId,
      data: {
        completedAt: isCompleted ? null : new Date().toISOString(),
        cancelledAt: null, // Clear cancellation if marking complete
      },
    });
  };

  const handleToggleCancel = () => {
    const isCancelled = !!session?.cancelledAt;
    updateMutation.mutate({
      sessionId,
      data: {
        cancelledAt: isCancelled ? null : new Date().toISOString(),
        completedAt: null, // Clear completion if cancelling
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin size-12 text-accent" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/app/sessions"
            className="p-3 hover:bg-accent/10 rounded-2xl transition-colors text-accent"
          >
            <ChevronLeft className="size-6" />
          </Link>
          <h1 className="text-3xl font-black tracking-tight">
            Session Details
          </h1>
        </div>

        <Button
          form="session-form"
          type="submit"
          className="bg-accent text-accent-foreground font-bold rounded-2xl h-12 px-8 shadow-lg shadow-accent-soft-hover"
          isPending={updateMutation.isPending}
        >
          {!updateMutation.isPending && <Save className="size-5 mr-2" />}
          Save Changes
        </Button>
      </div>

      <Card
        className={`p-8 rounded-[40px] border-none shadow-2xl shadow-accent/5 transition-all duration-500
          ${session?.cancelledAt ? "bg-danger/5 grayscale-[0.5]" : "bg-background/60 backdrop-blur-md"}`}
      >
        {/* Quick Status Actions */}
        <div className="flex flex-wrap gap-4 mb-10 pb-10 border-b-2 border-accent/5">
          <div className="flex-1 space-y-1">
            <h3 className="font-black text-sm uppercase tracking-wider text-muted-foreground">
              Session Status
            </h3>
            <p className="text-sm font-medium">
              {session?.completedAt
                ? "This session is finalized."
                : session?.cancelledAt
                  ? "This session was cancelled."
                  : "This session is currently scheduled."}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onPress={handleToggleCancel}
              variant={!!session?.cancelledAt ? "primary" : "secondary"}
              className={`rounded-2xl font-black h-12 px-6 transition-all ${
                !!session?.cancelledAt
                  ? "bg-danger text-white shadow-lg shadow-danger-soft-hover"
                  : "hover:bg-danger/10 hover:text-danger"
              }`}
              isPending={updateMutation.isPending}
            >
              {session?.cancelledAt ? "Re-activate Session" : "Cancel Session"}
            </Button>

            <Button
              onPress={handleToggleComplete}
              variant={!!session?.completedAt ? "primary" : "secondary"}
              className={`rounded-2xl font-black h-12 px-6 transition-all ${
                !!session?.completedAt
                  ? "bg-success text-white shadow-lg shadow-success-soft-hover"
                  : "hover:bg-success/10 hover:text-success"
              }`}
              isPending={updateMutation.isPending}
            >
              {session?.completedAt ? "Mark Incomplete" : "Mark Completed"}
            </Button>
          </div>
        </div>

        <form
          id="session-form"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-10"
        >
          {/* Core Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <form.Field name="studentId">
              {(field) => (
                <StudentSelect
                  value={field.state.value}
                  onChange={(val) => field.handleChange(val ? String(val) : "")}
                />
              )}
            </form.Field>

            <form.Field name="subjectId">
              {(field) => (
                <SubjectSelect
                  value={field.state.value}
                  onChange={(val) => field.handleChange(val ? String(val) : "")}
                />
              )}
            </form.Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <form.Field name="date">
              {(field) => (
                <DatePicker
                  className="w-full"
                  value={field.state.value}
                  onChange={(val) => val && field.handleChange(val)}
                  granularity="minute"
                >
                  <Label className="font-black text-xs uppercase text-accent mb-2 block">
                    Scheduled Time
                  </Label>
                  <DateField.Group className="h-14 bg-muted/30 border-2 border-transparent focus-within:border-accent/30 rounded-2xl px-4">
                    <DateField.Input>
                      {(s) => <DateField.Segment segment={s} />}
                    </DateField.Input>
                    <DateField.Suffix>
                      <DatePicker.Trigger>
                        <DatePicker.TriggerIndicator />
                      </DatePicker.Trigger>
                    </DateField.Suffix>
                  </DateField.Group>
                  <DatePicker.Popover>
                    <Calendar>
                      <Calendar.Header>
                        <Calendar.YearPickerTrigger>
                          <Calendar.YearPickerTriggerHeading />
                        </Calendar.YearPickerTrigger>
                        <Calendar.NavButton slot="previous" />
                        <Calendar.NavButton slot="next" />
                      </Calendar.Header>
                      <Calendar.Grid>
                        <Calendar.GridHeader>
                          {(day) => (
                            <Calendar.HeaderCell>{day}</Calendar.HeaderCell>
                          )}
                        </Calendar.GridHeader>
                        <Calendar.GridBody>
                          {(date) => <Calendar.Cell date={date} />}
                        </Calendar.GridBody>
                      </Calendar.Grid>
                    </Calendar>
                  </DatePicker.Popover>
                </DatePicker>
              )}
            </form.Field>

            <form.Field name="duration">
              {(field) => (
                <NumberField
                  minValue={0}
                  step={15}
                  value={field.state.value}
                  onChange={field.handleChange}
                >
                  <Label className="font-black text-xs uppercase text-accent mb-2 block">
                    Duration (mins)
                  </Label>
                  <NumberField.Group className="h-14 bg-muted/30 border-2 border-transparent rounded-2xl px-2">
                    <NumberField.DecrementButton className="border-none text-accent" />
                    <NumberField.Input className="bg-transparent font-bold" />
                    <NumberField.IncrementButton className="border-none text-accent" />
                  </NumberField.Group>
                </NumberField>
              )}
            </form.Field>
          </div>

          {/* Payment Tracking Section */}
          <div className="pt-8 border-t-2 border-accent/5 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="size-5 text-accent" />
                <h3 className="font-black text-sm uppercase tracking-wider">
                  Payment Status
                </h3>
              </div>

              <form.Field name="isPaid">
                {(field) => (
                  <ToggleButton
                    isSelected={field.state.value}
                    onChange={field.handleChange}
                    variant={field.state.value ? "default" : "ghost"}
                    className="rounded-full font-bold px-6 h-10 transition-all"
                  >
                    {({ isSelected }) => (
                      <div className="flex items-center gap-2">
                        {isSelected ? (
                          <CalendarCheck className="size-4" />
                        ) : null}
                        <span>{isSelected ? "Paid" : "Mark as Paid"}</span>
                      </div>
                    )}
                  </ToggleButton>
                )}
              </form.Field>
            </div>

            {/* Subscribe specifically to the 'isPaid' value for live UI updates */}
            <form.Subscribe selector={(state) => state.values.isPaid}>
              {(isPaid) =>
                isPaid ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-in fade-in slide-in-from-top-2">
                    <form.Field name="amountPaid">
                      {(field) => (
                        <NumberField
                          className="w-full" // Ensure the container takes full width
                          value={field.state.value}
                          onChange={field.handleChange}
                          formatOptions={{
                            style: "currency",
                            currency: "CHF",
                            minimumFractionDigits: 2,
                          }}
                        >
                          <Label className="font-black text-xs uppercase text-accent mb-2 block">
                            Amount Received
                          </Label>
                          <NumberField.Group className="h-14 bg-accent-soft/10 border-2 border-transparent focus-within:border-accent/30 rounded-2xl px-4 transition-all flex items-center">
                            <NumberField.Input
                              className="bg-transparent font-bold text-accent w-full outline-none text-lg"
                              // Added w-full, text-lg for better visibility, and ensured no outline
                            />
                          </NumberField.Group>
                        </NumberField>
                      )}
                    </form.Field>

                    <div className="flex items-center gap-3 text-accent/60 font-medium text-sm self-end pb-4">
                      <CalendarCheck className="size-5 text-accent" />
                      <span>
                        Recorded on{" "}
                        {new Date(
                          session?.paidAt || new Date(),
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ) : null
              }
            </form.Subscribe>
          </div>

          <form.Field name="notes">
            {(field) => (
              <TextField>
                <Label className="font-black text-xs uppercase text-accent mb-2 block">
                  Session Notes
                </Label>
                <textarea
                  className="w-full min-h-32 rounded-[24px] bg-muted/30 border-2 border-transparent focus:border-accent/30 p-5 text-base outline-none transition-all resize-none"
                  placeholder="Topics, homework, progress..."
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </TextField>
            )}
          </form.Field>
        </form>
      </Card>
    </div>
  );
}
