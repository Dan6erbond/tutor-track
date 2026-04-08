import { ID, Permission, Role, type Models } from "appwrite";
import { databaseId, tableIds } from "@/lib/appwrite/const";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ModelCreate } from "@/lib/appwrite/utils";
import type { PaymentConfirmations } from "@/lib/appwrite/types";
import { useAppwrite } from "@/contexts/appwrite";
import { useAuth } from "@/contexts/auth";

export function useCreateConfirmationMutation() {
  const { tables } = useAppwrite();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: Omit<
        ModelCreate<PaymentConfirmations>,
        "userId" | keyof Models.Row
      >,
    ) => {
      if (!user?.$id) throw new Error("Unauthorized");

      return tables.createRow<ModelCreate<PaymentConfirmations>>({
        databaseId,
        tableId: tableIds.paymentConfirmations,
        rowId: ID.unique(),
        data: {
          ...payload,
          userId: user.$id,
        },
        permissions: [
          Permission.read(Role.user(user.$id)),
          Permission.write(Role.user(user.$id)),
        ],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-confirmations"] });
    },
  });
}

export function useUpdateConfirmationMutation() {
  const { tables } = useAppwrite();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<ModelCreate<PaymentConfirmations>>;
    }) =>
      tables.updateRow<ModelCreate<PaymentConfirmations>>({
        databaseId,
        tableId: tableIds.paymentConfirmations,
        rowId: id,
        data,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["confirmations"] });
      queryClient.setQueryData(["confirmations", data.$id], data);
    },
  });
}
