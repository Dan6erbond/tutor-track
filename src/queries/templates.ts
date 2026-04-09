import { databaseId, tableIds } from "@/lib/appwrite/const";

import type { DocumentTemplates } from "@/lib/appwrite/types";
import { Query } from "appwrite";
import { queryOptions } from "@tanstack/react-query";
import { useAppwrite } from "@/contexts/appwrite";

export function useTemplatesQueryOptions() {
  const { tables } = useAppwrite();

  return queryOptions({
    queryKey: ["document-templates"],
    queryFn: async () => {
      const response = await tables.listRows<DocumentTemplates>({
        databaseId,
        tableId: tableIds.documentTemplates,
        queries: [Query.select(["name", "userId"])],
      });
      return response.rows;
    },
  });
}

export const useTemplateQueryOptions = (templateId: string) => {
  const { tables } = useAppwrite();

  return queryOptions({
    queryKey: ["document-templates", templateId],
    queryFn: async () => {
      return await tables.getRow<DocumentTemplates>({
        databaseId,
        tableId: tableIds.documentTemplates,
        rowId: templateId,
      });
    },
  });
};
