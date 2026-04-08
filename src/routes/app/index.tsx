import { ArrowRightIcon, CalendarIcon, ClockIcon } from "lucide-react";
// src/routes/app/index.tsx
import { Card, Chip, buttonVariants } from "@heroui/react";
import { Link, createFileRoute } from "@tanstack/react-router";

import { useQuery } from "@tanstack/react-query";
import { useTutoringSessionsQueryOptions } from "@/queries/sessions";

export const Route = createFileRoute("/app/")({
  component: DashboardPage,
});

export function DashboardPage() {
  const options = useTutoringSessionsQueryOptions({ filterUpcoming: true });
  const { data, isLoading } = useQuery(options);

  const sessions = data?.rows || [];

  return (
    <>
      <header>
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </header>

      <Card className="max-w-4xl shadow-sm border border-divider">
        <Card.Header className="flex justify-between items-center px-6 pt-6 space-y-4">
          <div className="flex flex-col">
            <Card.Title className="text-md font-bold">
              Upcoming Sessions
            </Card.Title>
            <Card.Description className="text-small text-default-500">
              Your scheduled tutoring for the coming days.
            </Card.Description>
          </div>
          <Link
            to="/app/sessions"
            className={buttonVariants({
              variant: "ghost",
              size: "sm",
              className: "text-primary",
            })}
          >
            View All
            <ArrowRightIcon size={16} className="ml-1" />
          </Link>
        </Card.Header>

        <hr className="border-t border-divider my-2" />

        <Card.Content className="px-6 pb-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <p className="text-default-400 animate-pulse">
                Loading sessions...
              </p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-divider rounded-xl">
              <p className="text-default-500">No upcoming sessions found.</p>
              <Link
                to="/app/sessions"
                className={buttonVariants({
                  size: "sm",
                  className: "mt-4 bg-accent text-accent-foreground",
                })}
              >
                Schedule One
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {sessions.map((session) => (
                <div
                  key={session.$id}
                  className="flex items-center justify-between p-4 rounded-xl border border-divider hover:bg-accent-soft/10 transition-colors group"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-foreground group-hover:text-accent transition-colors">
                      {session.student?.name || "Unnamed Student"}
                    </span>
                    <div className="flex items-center gap-4 text-xs text-default-500">
                      <span className="flex items-center gap-1.5">
                        <CalendarIcon size={14} className="text-accent" />
                        {new Date(session.date).toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <ClockIcon size={14} className="text-accent" />
                        {new Date(session.date).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Chip
                      size="sm"
                      variant="soft"
                      className="bg-accent-soft text-accent-soft-foreground border-none"
                    >
                      {session.subject?.name || "General"}
                    </Chip>
                    <Link
                      to="/app/sessions/$sessionId"
                      params={{ sessionId: session.$id }}
                      className={buttonVariants({
                        variant: "ghost",
                        size: "sm",
                        isIconOnly: true,
                        className: "opacity-0 group-hover:opacity-100",
                      })}
                    >
                      <ArrowRightIcon size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card.Content>

        {/* Footer could be used for quick stats or summary if needed */}
        <Card.Footer className="px-6 py-3 bg-default-50/50 justify-end">
          <p className="text-tiny text-default-400">
            Showing next {sessions.length} sessions
          </p>
        </Card.Footer>
      </Card>
    </>
  );
}
