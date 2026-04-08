import { ID, Permission, Role } from "appwrite";
import { databaseId, tableIds } from "@/lib/appwrite/const";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAppwrite } from "@/contexts/appwrite";
import { useAuth } from "@/contexts/auth";
import { useStudentsInfiniteQueryOptions } from "@/queries/students";

export function useStudentMutations() {
  const { tables } = useAppwrite();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const listQueryKey = useStudentsInfiniteQueryOptions().queryKey[0];

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [listQueryKey] });

  // Create Student
  const createStudent = useMutation({
    mutationFn: async (data: { name: string; email?: string }) => {
      return await tables.createRow({
        databaseId,
        tableId: tableIds.students,
        rowId: ID.unique(),
        data: { ...data, userId: user!.$id },
        permissions: [
          Permission.read(Role.user(user!.$id)),
          Permission.update(Role.user(user!.$id)),
          Permission.delete(Role.user(user!.$id)),
        ],
      });
    },
    onSuccess: invalidate,
  });

  // Edit Student
  const updateStudent = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { name: string; email?: string };
    }) => {
      return await tables.updateRow({
        databaseId,
        tableId: tableIds.students,
        rowId: id,
        data,
      });
    },
    onSuccess: invalidate,
  });

  // Archive Student (Soft delete using archivedAt)
  const archiveStudent = useMutation({
    mutationFn: async (id: string) => {
      return await tables.updateRow({
        databaseId,
        tableId: tableIds.students,
        rowId: id,
        data: { archivedAt: new Date().toISOString() },
      });
    },
    onSuccess: invalidate,
  });

  return { createStudent, updateStudent, archiveStudent };
}
