import { createAdminClient, createSessionClient } from "./server";
import {
  deleteCookie,
  getCookie,
  setCookie,
} from "@tanstack/react-start/server";

import { APPWRITE_SESSION_KEY } from "./const";
import { ID } from "node-appwrite";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";

export const getLoggedInUser = createServerFn().handler(async () => {
  const session = getCookie(APPWRITE_SESSION_KEY);
  const { account } = await createSessionClient();

  try {
    const { toString, ...user } = await account.get();
    return { session, user };
  } catch (error) {
    console.error(error);
    return null;
  }
});

const SignUpWithEmailRequest = z.object({
  email: z.email(),
  password: z.string(),
  name: z.string(),
});

export const signUpWithEmail = createServerFn({ method: "POST" })
  .inputValidator(SignUpWithEmailRequest)
  .handler(async ({ data: { email, password, name } }) => {
    const { account } = await createAdminClient();

    await account.create({
      userId: ID.unique(),
      email,
      password,
      name,
    });
    const session = await account.createEmailPasswordSession({
      email,
      password,
    });

    setCookie(APPWRITE_SESSION_KEY, session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  });

const SignInWithEmailRequest = z.object({
  email: z.email(),
  password: z.string(),
});

export const signInWithEmail = createServerFn({ method: "POST" })
  .inputValidator(SignInWithEmailRequest)
  .handler(async ({ data: { email, password } }) => {
    const { account } = await createAdminClient();

    const session = await account.createEmailPasswordSession({
      email,
      password,
    });

    setCookie(APPWRITE_SESSION_KEY, session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  });

export const signOut = createServerFn({ method: "POST" }).handler(async () => {
  const { account } = await createSessionClient();

  deleteCookie(APPWRITE_SESSION_KEY);

  await account.deleteSession({ sessionId: "current" });
});
