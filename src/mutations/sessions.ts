import { ID, Permission, Role } from "appwrite";
import type { ModelCreate, ModelUpdate } from "@/lib/appwrite/utils";
import { databaseId, tableIds } from "@/lib/appwrite/const";
import { mutationOptions, useQueryClient } from "@tanstack/react-query";

import type { TutoringSessions } from "@/lib/appwrite/types";
import { useAppwrite } from "@/contexts/appwrite";
import { useAuth } from "@/contexts/auth";

export function useCreateSessionMutationOptions() {
  const { tables } = useAppwrite();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return {
    mutationFn: async (values: {
      studentId: string;
      subjectId: string;
      date: string;
      duration: number;
      notes?: string;
    }) => {
      if (!user?.$id) throw new Error("Authenticated user required");

      return await tables.createRow<ModelCreate<TutoringSessions>>({
        databaseId,
        tableId: tableIds.tutoringSessions,
        rowId: ID.unique(),
        data: {
          date: values.date,
          duration: values.duration,
          notes: values.notes || null,
          userId: user.$id,
          // Relationship fields in Appwrite accept the ID of the target row
          student: values.studentId,
          subject: values.subjectId,
        },
        permissions: [
          Permission.read(Role.user(user.$id)),
          Permission.update(Role.user(user.$id)),
          Permission.delete(Role.user(user.$id)),
        ],
      });
    },
    onSuccess: () => {
      // Invalidate all session queries (infinite, dashboard, etc.)
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["tutoring-sessions"] });
    },
  };
}

interface UpdateSessionPayload {
  sessionId: string;
  data: Partial<ModelCreate<TutoringSessions>>;
}

export function useUpdateSessionMutationOptions() {
  const { tables } = useAppwrite();
  const queryClient = useQueryClient();

  return mutationOptions({
    mutationFn: async ({ sessionId, data }: UpdateSessionPayload) => {
      return await tables.updateRow<ModelUpdate<TutoringSessions>>({
        databaseId,
        tableId: tableIds.tutoringSessions,
        rowId: sessionId,
        data,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["tutoring-sessions", variables.sessionId],
      });
      queryClient.invalidateQueries({ queryKey: ["tutoring-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}
