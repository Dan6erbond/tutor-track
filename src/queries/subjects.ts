import { databaseId, tableIds } from "@/lib/appwrite/const";
import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";

import { Query } from "appwrite";
import type { Subjects } from "@/lib/appwrite/types";
import { useAppwrite } from "@/contexts/appwrite";
import { useAuth } from "@/contexts/auth";

export function useSubjectsQueryOptions() {
  const { tables } = useAppwrite();
  const { user } = useAuth();

  return queryOptions({
    queryKey: ["subjects", user?.$id],
    queryFn: async () => {
      if (!user?.$id) return { rows: [], total: 0 };

      return await tables.listRows<Subjects>({
        databaseId,
        tableId: tableIds.subjects,
        queries: [Query.equal("userId", user.$id), Query.orderAsc("name")],
      });
    },
    enabled: !!user?.$id,
  });
}

export function useSubjectsInfiniteQueryOptions() {
  const { user } = useAuth();
  const { tables } = useAppwrite();

  return infiniteQueryOptions({
    queryKey: ["subjects", "infinite"],
    queryFn: async ({ pageParam = 0 }) => {
      // Ensure user is loaded before querying
      if (!user?.$id) return { total: 0, rows: [] };

      return await tables.listRows<Subjects>({
        databaseId,
        tableId: tableIds.subjects,
        queries: [
          Query.equal("userId", user.$id),
          // Sorting: newest first, or alphabetical by name
          Query.orderAsc("name"),
          // Pagination logic
          Query.limit(20),
          Query.offset(pageParam),
        ],
      });
    },
    // Appwrite returns the list of documents in a 'rows' property (based on your TableDB types)
    // We calculate the next offset based on the current length of rows retrieved
    getNextPageParam: (lastPage, allPages) => {
      const loadedSoFar = allPages.flatMap((p) => p.rows).length;
      return loadedSoFar < lastPage.total ? loadedSoFar : undefined;
    },
    initialPageParam: 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
