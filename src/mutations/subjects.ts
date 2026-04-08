import { databaseId, tableIds } from "@/lib/appwrite/const";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAppwrite } from "@/contexts/appwrite";

export function useSubjectMutations() {
  const { tables } = useAppwrite();
  const queryClient = useQueryClient();

  const updateSubject = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { name: string; color: string };
    }) => {
      return await tables.updateRow({
        databaseId,
        tableId: tableIds.subjects,
        rowId: id,
        data,
      });
    },
    onSuccess: () => {
      // Invalidate all subject queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });

  const archiveSubject = useMutation({
    mutationFn: async (id: string) => {
      return await tables.updateRow({
        databaseId,
        tableId: tableIds.subjects,
        rowId: id,
        data: {
          archivedAt: new Date().toISOString(),
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });

  return { updateSubject, archiveSubject };
}
