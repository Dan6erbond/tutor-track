import { databaseId, tableIds } from "@/lib/appwrite/const";

import { Query } from "appwrite";
import type { TutoringSessions } from "@/lib/appwrite/types";
import { infiniteQueryOptions } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { useAppwrite } from "@/contexts/appwrite";
import { useAuth } from "@/contexts/auth";

interface SessionsOptions {
  filterUpcoming?: boolean;
}

export function useTutoringSessionsQueryOptions({
  filterUpcoming = false,
}: SessionsOptions = {}) {
  const { tables } = useAppwrite();
  const { user } = useAuth();

  return queryOptions({
    queryKey: ["tutoring-sessions", user?.$id, { filterUpcoming }],
    queryFn: async () => {
      if (!user?.$id) return { rows: [], total: 0 };

      const queries = [Query.equal("userId", user.$id), Query.orderAsc("date")];

      if (filterUpcoming) {
        const now = new Date().toISOString();
        queries.push(Query.greaterThanEqual("date", now));
        queries.push(Query.isNull("completedAt"));
        queries.push(Query.isNull("cancelledAt"));
      }

      return await tables.listRows<TutoringSessions>({
        databaseId,
        tableId: tableIds.tutoringSessions,
        queries,
      });
    },
    enabled: !!user?.$id,
  });
}

export type SessionFilter = "all" | "upcoming" | "completed" | "cancelled";

export function useSessionsInfiniteQueryOptions(
  filter: SessionFilter = "all",
  studentId?: string,
) {
  const { tables } = useAppwrite();
  const { user } = useAuth();

  return infiniteQueryOptions({
    queryKey: [
      "sessions",
      "infinite",
      { filter, studentId, userId: user?.$id },
    ],
    queryFn: async ({ pageParam = 0 }) => {
      if (!user?.$id) return { total: 0, rows: [] };

      const queries = [
        Query.equal("userId", user.$id),
        Query.orderDesc("date"), // Newest/Upcoming first
        Query.select(["*", "student.*", "subject.*"]),
        Query.limit(15),
        Query.offset(pageParam),
      ];

      if (studentId) queries.push(Query.equal("student", studentId));

      if (filter === "upcoming") {
        queries.push(Query.greaterThanEqual("date", new Date().toISOString()));
        queries.push(Query.isNull("completedAt"));
        queries.push(Query.isNull("cancelledAt"));
      } else if (filter === "completed") {
        queries.push(Query.isNotNull("completedAt"));
      } else if (filter === "cancelled") {
        queries.push(Query.isNotNull("cancelledAt"));
      }

      return await tables.listRows<TutoringSessions>({
        databaseId,
        tableId: tableIds.tutoringSessions,
        queries,
      });
    },
    getNextPageParam: (lastPage, allPages) => {
      const loadedSoFar = allPages.flatMap((p) => p.rows).length;
      return loadedSoFar < lastPage.total ? loadedSoFar : undefined;
    },
    initialPageParam: 0,
  });
}

export function useSessionQueryOptions(sessionId: string) {
  const { tables } = useAppwrite();

  return queryOptions({
    queryKey: ["tutoring-sessions", sessionId],
    queryFn: async () => {
      return await tables.getRow<TutoringSessions>({
        databaseId,
        tableId: tableIds.tutoringSessions,
        rowId: sessionId,
        queries: [Query.select(["*", "student.*", "subject.*"])],
      });
    },
    enabled: !!sessionId,
  });
}

interface SessionCountOptions {
  unpaidOnly?: boolean;
}

export function useTutoringSessionsCountOptions({
  unpaidOnly = false,
}: SessionCountOptions = {}) {
  const { tables } = useAppwrite();
  const { user } = useAuth();

  return queryOptions({
    queryKey: ["tutoring-sessions", "count", user?.$id, { unpaidOnly }],
    queryFn: async () => {
      if (!user?.$id) return { rows: [], total: 0 };

      const queries = [
        Query.equal("userId", user.$id),
        Query.limit(1), // Minimal overhead for count
      ];

      if (unpaidOnly) {
        queries.push(Query.isNull("paidAt"));
        queries.push(Query.isNotNull("completedAt")); // Only count completed, unpaid sessions
        queries.push(Query.isNull("cancelledAt"));
      }

      return await tables.listRows<TutoringSessions>({
        databaseId,
        tableId: tableIds.tutoringSessions,
        queries,
      });
    },
    enabled: !!user?.$id,
  });
}
