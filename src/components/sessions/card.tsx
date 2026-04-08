import { Card, Chip } from "@heroui/react";
import { ChevronRight, Clock, User } from "lucide-react";

import { Link } from "@tanstack/react-router";
import type { TutoringSessions } from "@/lib/appwrite/types";
import { buttonVariants } from "@heroui/styles";

interface SessionCardProps {
  session: TutoringSessions;
}

export function SessionCard({ session }: SessionCardProps) {
  const isCancelled = !!session.cancelledAt;
  const isCompleted = !!session.completedAt;

  // Dynamic status color
  const statusColor = isCancelled
    ? "danger"
    : isCompleted
      ? "success"
      : "accent";
  const statusLabel = isCancelled
    ? "Cancelled"
    : isCompleted
      ? "Completed"
      : "Upcoming";

  return (
    <Card className="p-4 md:p-6 rounded-[32px] border-2 border-transparent hover:border-accent-soft-hover hover:bg-accent/5 transition-all group shadow-none bg-muted/20">
      <div className="flex items-center gap-6">
        {/* Date Badge */}
        <div
          className={`hidden sm:flex flex-col items-center justify-center size-16 rounded-2xl bg-background border-2 transition-colors
  ${isCancelled ? "border-danger/30" : isCompleted ? "border-success/30" : "border-divider group-hover:border-accent/30"}`}
        >
          <span
            className={`text-[10px] font-black uppercase ${isCancelled ? "text-danger" : isCompleted ? "text-success" : "text-accent"}`}
          >
            {new Date(session.date).toLocaleDateString(undefined, {
              month: "short",
            })}
          </span>
          <span className="text-2xl font-black tabular-nums">
            {new Date(session.date).getDate()}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-black truncate">
              {session.student?.name || "Unknown Student"}
            </h3>
            <Chip
              size="sm"
              variant="soft"
              color={statusColor}
              className="font-bold uppercase text-[10px]"
            >
              {statusLabel}
            </Chip>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="size-4 text-accent" />
              {new Date(session.date).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
              {session.duration && ` (${session.duration}m)`}
            </div>
            <div className="flex items-center gap-1.5">
              <User className="size-4 text-accent" />
              {session.subject?.name || "General Tutoring"}
            </div>
          </div>
        </div>

        {/* Action */}
        <Link
          to="/app/sessions/$sessionId"
          params={{ sessionId: session.$id }}
          className={buttonVariants({
            variant: "ghost",
            isIconOnly: true,
            className:
              "rounded-2xl size-12 group-hover:bg-accent group-hover:text-accent-foreground transition-all",
          })}
        >
          <ChevronRight className="size-6" />
        </Link>
      </div>
    </Card>
  );
}
