"use server";

import {
  Account,
  Client,
  Storage,
  TablesDB,
  Teams,
  Tokens,
} from "node-appwrite";

import { APPWRITE_SESSION_KEY } from "./const";
import { getCookie } from "@tanstack/react-start/server";

export async function createClient<S extends string | null | undefined>(
  session?: S,
) {
  const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT!)
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID!);

  if (session) {
    client.setSession(session);
  }

  return {
    client,
    session: session as S,
    get account() {
      const account = new Account(client);

      return new Proxy(account, {
        get(target, prop, receiver) {
          const value = Reflect.get(target, prop, receiver);

          // Only intercept the 'get' method
          if (prop === "get" && typeof value === "function") {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (...args: any[]) => {
              if (!session) {
                // Return a rejected promise to maintain the async signature
                return Promise.reject(
                  new Error("No session provided to client."),
                );
              }
              return value.apply(target, args);
            };
          }

          // Return all other properties/methods as they are
          return typeof value === "function" ? value.bind(target) : value;
        },
      });
    },
    get tables() {
      return new TablesDB(client);
    },
    get storage() {
      return new Storage(client);
    },
    get teams() {
      return new Teams(client);
    },
    get tokens() {
      return new Tokens(client);
    },
  };
}

export async function createSessionClient() {
  return await createClient(getCookie(APPWRITE_SESSION_KEY));
}

export async function createAdminClient() {
  return await createClient().then(({ client, ...rest }) => ({
    ...rest,
    client: client.setKey(process.env.APPWRITE_API_KEY!),
  }));
}
