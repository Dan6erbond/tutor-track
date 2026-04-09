import {
  AlertCircle,
  ArrowRight,
  CalendarIcon,
  ClockIcon,
  Plus,
  Users,
} from "lucide-react";
import { Card, Chip, buttonVariants } from "@heroui/react";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  useTutoringSessionsCountOptions,
  useTutoringSessionsQueryOptions,
} from "@/queries/sessions";

import { useQuery } from "@tanstack/react-query";
import { useStudentsQueryOptions } from "@/queries/students";

export const Route = createFileRoute("/app/")({
  component: DashboardPage,
});

export function DashboardPage() {
  const { data: sessionData, isLoading: sessionsLoading } = useQuery(
    useTutoringSessionsQueryOptions({ filterUpcoming: true }),
  );

  const { data: studentData } = useQuery(
    useStudentsQueryOptions({ limit: 1 }), // Only need the total
  );

  const { data: unpaidData } = useQuery(
    useTutoringSessionsCountOptions({ unpaidOnly: true }),
  );

  const sessions = sessionData?.rows || [];
  const totalStudents = studentData?.total || 0;
  const unpaidCount = unpaidData?.total || 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Welcome Header */}
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground font-medium">
            Welcome back! Here is what's on your plate today.
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Link
            to="/app/sessions"
            className={buttonVariants({
              variant: "primary", // Fixed: 'solid' is not a valid variant
              className:
                "font-bold rounded-xl shadow-lg shadow-accent-soft-hover",
            })}
          >
            <Plus className="mr-2 size-4" strokeWidth={3} />
            New Session
          </Link>
        </div>
      </header>

      {/* Responsive Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Upcoming Sessions */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm border border-divider bg-background/50 backdrop-blur-sm rounded-3xl overflow-hidden">
            <Card.Header className="flex flex-row justify-between items-center px-6 py-6 border-b border-divider/50">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-accent/10 text-accent">
                    <CalendarIcon size={18} strokeWidth={2.5} />
                  </div>
                  <h2 className="text-lg font-black tracking-tight">
                    Upcoming Sessions
                  </h2>
                </div>
                <p className="text-xs font-medium text-muted-foreground mt-1">
                  Your scheduled tutoring for the coming days.
                </p>
              </div>
              <Link
                to="/app/sessions"
                className="flex items-center gap-1.5 text-sm font-bold text-accent hover:opacity-80 transition-opacity"
              >
                View All
                <ArrowRight size={16} strokeWidth={2.5} />
              </Link>
            </Card.Header>

            <Card.Content className="p-6">
              {sessionsLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="size-8 border-4 border-accent-soft border-t-accent rounded-full animate-spin" />
                  <p className="text-muted-foreground font-medium text-sm animate-pulse">
                    Retrieving your schedule...
                  </p>
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-divider rounded-2xl bg-muted/5">
                  <div className="mx-auto size-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <CalendarIcon className="text-muted-foreground size-6" />
                  </div>
                  <p className="text-foreground font-bold">No sessions found</p>
                  <p className="text-muted-foreground text-sm mt-1">
                    Ready to start teaching?
                  </p>
                  <Link
                    to="/app/sessions"
                    className={buttonVariants({
                      variant: "primary",
                      size: "md",
                      className: "mt-6 font-bold rounded-xl",
                    })}
                  >
                    Schedule Your First Session
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {sessions.map((session) => (
                    <div
                      key={session.$id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border border-divider/50 bg-background hover:border-accent/40 hover:shadow-md hover:shadow-accent/5 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-xl bg-accent-soft flex items-center justify-center text-accent shrink-0">
                          <span className="font-black text-lg">
                            {(session.student?.name || "U")[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground text-base group-hover:text-accent transition-colors">
                            {session.student?.name || "Unnamed Student"}
                          </span>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                              <CalendarIcon
                                size={13}
                                className="text-accent/70"
                              />
                              {new Date(session.date).toLocaleDateString(
                                undefined,
                                {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </span>
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                              <ClockIcon size={13} className="text-accent/70" />
                              {new Date(session.date).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-divider/50">
                        <Chip
                          size="sm"
                          variant="soft" // Fixed: 'flat' is not a valid variant
                          className="bg-accent/10 text-accent font-bold px-3 border-none rounded-lg"
                        >
                          {session.subject?.name || "General"}
                        </Chip>
                        <Link
                          to="/app/sessions/$sessionId"
                          params={{ sessionId: session.$id }}
                          className="size-9 rounded-xl flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all border border-divider sm:opacity-0 sm:group-hover:opacity-100"
                        >
                          <ArrowRight size={18} strokeWidth={2.5} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Content>

            <Card.Footer className="px-6 py-4 bg-muted/5 border-t border-divider/50 flex justify-between items-center">
              <span className="text-xs font-bold text-muted-foreground">
                Displaying next {sessions.length} sessions
              </span>
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="size-6 rounded-full border-2 border-background bg-divider"
                  />
                ))}
              </div>
            </Card.Footer>
          </Card>
        </div>

        {/* Sidebar: Quick Stats/Actions */}
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
            <div className="p-5 rounded-2xl border border-divider bg-background/50 backdrop-blur-sm flex items-center gap-4 hover:border-accent/30 transition-colors">
              <div className="size-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shadow-inner">
                <Users size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Total Students
                </p>
                <p className="text-2xl font-black text-foreground">
                  {totalStudents}
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-divider bg-background/50 backdrop-blur-sm flex items-center gap-4 hover:border-danger/30 transition-colors group">
              <div className="size-12 rounded-xl bg-danger/10 text-danger flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <AlertCircle size={24} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Unpaid Sessions
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-black text-foreground leading-none mt-1">
                    {unpaidCount}
                  </p>
                  {unpaidCount > 0 && (
                    <Link
                      to="/app/sessions"
                      className="text-[10px] font-black bg-danger/10 text-danger px-2 py-1 rounded-md hover:bg-danger hover:text-white transition-colors"
                    >
                      VIEW
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
