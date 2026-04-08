import { Account, Client, Storage, TablesDB, Teams } from "appwrite";
import { type ReactNode, createContext, useContext, useMemo } from "react";

import { useAuth } from "@/contexts/auth";
import { createClient } from "@/lib/appwrite";

interface AppwriteContextType {
  client: Client;
  account: Account;
  teams: Teams;
  tables: TablesDB;
  storage: Storage;
}

const AppwriteContext = createContext<AppwriteContextType | undefined>(
  undefined,
);

export function AppwriteProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();

  return (
    <AppwriteContext.Provider
      value={useMemo(() => createClient(session), [session])}
    >
      {children}
    </AppwriteContext.Provider>
  );
}

export const useAppwrite = () => {
  const context = useContext(AppwriteContext);
  if (!context)
    throw new Error("useAppwrite must be used within AppwriteProvider");
  return context;
};
