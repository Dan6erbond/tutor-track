import { databaseId, tableIds } from "@/lib/appwrite/const";

import type { PaymentConfirmations } from "@/lib/appwrite/types";
import { Query } from "appwrite";
import { queryOptions } from "@tanstack/react-query";
import { useAppwrite } from "@/contexts/appwrite";
import { useAuth } from "@/contexts/auth";

export function useConfirmationsQueryOptions() {
  const { tables } = useAppwrite();
  const { user } = useAuth();

  return queryOptions({
    queryKey: ["payment-confirmations", user?.$id],
    queryFn: async () => {
      if (!user?.$id) return [];
      const response = await tables.listRows<PaymentConfirmations>({
        databaseId,
        tableId: tableIds.paymentConfirmations,
        queries: [
          Query.equal("userId", user.$id),
          Query.orderDesc("$createdAt"),
          Query.select(["*", "student.*", "template.*"]),
        ],
      });
      return response.rows;
    },
    enabled: !!user?.$id,
  });
}
