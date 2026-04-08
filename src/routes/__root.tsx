import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AppwriteProvider } from "#/contexts/appwrite";
import { AuthProvider } from "@/contexts/auth";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import appCss from "../styles.css?url";
import { getLoggedInUser } from "@/lib/appwrite/functions";

export const Route = createRootRoute({
  loader: async () => {
    const res = await getLoggedInUser();

    if (!res) {
      return {};
    }

    const { user, session } = res;

    return {
      user,
      session,
    };
  },
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "TanStack Start Starter",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
});

const queryClient = new QueryClient();

function RootDocument({ children }: { children: React.ReactNode }) {
  const { user, session } = Route.useLoaderData();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="antialiased">
        <QueryClientProvider client={queryClient}>
          <AuthProvider user={user} session={session}>
            <AppwriteProvider>{children}</AppwriteProvider>
          </AuthProvider>
        </QueryClientProvider>
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
