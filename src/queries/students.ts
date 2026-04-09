import { databaseId, tableIds } from "@/lib/appwrite/const";
import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";

import { Query } from "appwrite";
import type { Students } from "@/lib/appwrite/types";
import { useAppwrite } from "@/contexts/appwrite";
import { useAuth } from "@/contexts/auth";

export function useStudentsInfiniteQueryOptions(search: string = "") {
  const { tables } = useAppwrite();
  const { user } = useAuth();
  const limit = 15;

  return infiniteQueryOptions({
    queryKey: ["students", user?.$id, { search }],
    queryFn: async ({ pageParam = 0 }) => {
      if (!user?.$id) return { rows: [], total: 0 };

      const queries = [
        Query.equal("userId", user.$id),
        Query.isNull("archivedAt"),
        Query.orderAsc("name"),
        Query.limit(limit),
        Query.offset(pageParam as number),
      ];

      if (search) {
        queries.push(
          Query.or([
            Query.search("name", search),
            Query.search("email", search),
          ]),
        );
      }

      return await tables.listRows<Students>({
        databaseId,
        tableId: tableIds.students,
        queries,
      });
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const currentOffset = allPages.length * limit;
      return currentOffset < lastPage.total ? currentOffset : undefined;
    },
    enabled: !!user?.$id,
  });
}

interface StudentsOptions {
  limit?: number;
}

export function useStudentsQueryOptions({ limit = 25 }: StudentsOptions = {}) {
  const { tables } = useAppwrite();
  const { user } = useAuth();

  return queryOptions({
    queryKey: ["students", user?.$id, { limit }],
    queryFn: async () => {
      if (!user?.$id) return { rows: [], total: 0 };

      return await tables.listRows<Students>({
        databaseId,
        tableId: tableIds.students,
        queries: [
          Query.equal("userId", user.$id),
          Query.isNull("archivedAt"),
          Query.limit(limit),
        ],
      });
    },
    enabled: !!user?.$id,
  });
}
