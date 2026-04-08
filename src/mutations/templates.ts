import { databaseId, tableIds } from "@/lib/appwrite/const";
import { ID, Permission, Role, type Models } from "appwrite";

import { useAppwrite } from "@/contexts/appwrite";
import type { DocumentTemplates } from "@/lib/appwrite/types";
import type { ModelCreate } from "@/lib/appwrite/utils";
import { useQueryClient } from "@tanstack/react-query";

export const useCreateTemplateMutation = () => {
  const { tables } = useAppwrite();
  const queryClient = useQueryClient();

  return {
    mutationFn: async ({
      userId,
      payload,
    }: {
      userId: string;
      payload: Omit<
        ModelCreate<DocumentTemplates>,
        "userId" | keyof Models.Row
      >;
    }) => {
      return await tables.createRow<DocumentTemplates>({
        databaseId,
        tableId: tableIds.documentTemplates,
        rowId: ID.unique(),
        data: {
          ...payload,
          userId,
        },
        permissions: [
          Permission.read(Role.user(userId)),
          Permission.write(Role.user(userId)),
        ],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document-templates"] });
    },
  };
};

export const useUpdateTemplateMutation = (templateId: string) => {
  const { tables } = useAppwrite();
  const queryClient = useQueryClient();

  return {
    mutationFn: async (
      payload: Partial<Omit<DocumentTemplates, keyof Models.Row>>,
    ) => {
      return await tables.updateRow<DocumentTemplates>({
        databaseId,
        tableId: tableIds.documentTemplates,
        rowId: templateId,
        data: payload,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document-templates"] });
      queryClient.invalidateQueries({
        queryKey: ["document-templates", templateId],
      });
    },
  };
};
