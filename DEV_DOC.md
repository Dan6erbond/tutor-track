# TutorTrack Developer Documentation

## Overview

**TutorTrack** is a tutor-focused application designed to manage tutoring workflows efficiently. This documentation targets developers and LLMs for navigating the codebase, understanding conventions, libraries, and architecture.

---

## Tech Stack

### Frontend

* **Framework:** TanStack Start
* **UI Components:** HeroUI v3
* **Styling:** TailwindCSS v4
* **Data & State Management:**

  * TanStack Query (server state)
  * TanStack Form (form state and validation)

### Backend

* **Platform:** Appwrite
* **Database/Table Management:** Tables
* **Storage:** Appwrite Storage API
* **Authentication:** Appwrite Auth

---

## UI / Design Guidelines

### HeroUI Usage

* **Goal:** Use HeroUI components whenever possible; avoid overriding default styles unless it explicitly improves interactivity or usability.
* **Compound Components:** HeroUI v3 uses compound components. Code snippets illustrate usage of sub-components and props, not necessarily every prop is required.
* **Variants:** Leverage HeroUI variants for Buttons, Chips, Alerts, etc.
* **Colors:** HeroUI integrates with TailwindCSS v4. Use semantic variables rather than hard-coded colors.

#### HeroUI Color System

* Colors without a suffix are backgrounds (e.g., `--accent`).
* Colors with `-foreground` suffix are for text on that background (e.g., `--accent-foreground`).
* **Primary Colors:**

  * `--accent` — main brand color for primary actions
  * `--accent-foreground` — text color for primary actions
* **Secondary Colors:**

  * `--accent-soft` — lighter color for secondary actions
  * `--accent-soft-foreground` — text color for secondary actions

**Example in JSX:**

```tsx
<div className="bg-background text-foreground">
  <button className="bg-accent text-accent-foreground hover:bg-accent-hover">
    Primary Action
  </button>
  <button className="bg-accent-soft text-accent-soft-foreground hover:bg-accent-soft-hover">
    Secondary Action
  </button>
</div>
```

#### Button Variants Example

```tsx
import { Button } from "@heroui/react";

export function Variants() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button>Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="tertiary">Tertiary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="danger-soft">Danger Soft</Button>
    </div>
  );
}
```

> **Note:** These snippets are meant to illustrate compound components, props, and usage patterns, not to imply every prop or variant is required.

### Page Structure

Pages use the TanStack file-based router with `createFileRoute`:

```ts
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  component: AuthPage,
});
```

---

## Folder Structure & Aliases

* Root: `src/` (TanStack Start convention)
* Aliases:

  * `@/components` — reusable components
  * `@/lib` — utilities, Appwrite constants and types
  * `@/routes` — file-based routes
  * `@/contexts` — React contexts (e.g., Auth, Appwrite)
  * `@/hooks` — React hooks; follow `use-` naming conventions and use **kebab-case** for filenames

> **Note:** The file naming convention across `@/hooks`, `@/queries`, `@/mutations`, and components is **kebab-case** for consistency.

---

## Appwrite Integration

TutorTrack relies on Appwrite for authentication, database (Tables), and storage.

### SDK & Types

* TablesDB types are generated using the Appwrite CLI and stored in `@/lib/appwrite/types`.
* Constants like `databaseId`, `tableIds`, and `bucketId` are in `@/lib/appwrite/const` to centralize table/database references and simplify queries.

### React Contexts

* **Auth Context (`@/contexts/auth`)**: Provides current user and session.
* **Appwrite Context (`@/contexts/appwrite`)**: Provides Appwrite client and services (`Account`, `TablesDB`, `Storage`, `Teams`) via the current session from Auth Context.
* **Type:**

```ts
interface AppwriteContextType {
  client: Client;
  account: Account;
  teams: Teams;
  tables: TablesDB;
  storage: Storage;
}
```

* `useAppwrite()` returns `AppwriteContextType`.

### Server-side Helpers (`@/lib/appwrite/index.server`)

* Functions for creating Appwrite clients:

```ts
async function createClient(session?: string): Promise<AppwriteContextType>
async function createSessionClient(): Promise<AppwriteContextType>
async function createAdminClient(): Promise<AppwriteContextType>
```

* Handles access to services and session management.

---

## Authentication

Authentication is handled via Appwrite + cookies. Server functions include:

```ts
export const getLoggedInUser = createServerFn().handler(async () => Promise<Models.User | null>);
export const signUpWithEmail = createServerFn({ method: "POST" }).inputValidator(SignUpWithEmailRequest).handler(async ({ data: { email, password, name } }) => Promise<void>);
export const signInWithEmail = createServerFn({ method: "POST" }).inputValidator(SignInWithEmailRequest).handler(async ({ data: { email, password } }) => Promise<void>);
export const signOut = createServerFn({ method: "POST" }).handler(async () => Promise<void>);
```

* Frontend consumes session via `AuthProvider` and `AppwriteProvider`.

---

## Data Fetching / State Management

* Access the Appwrite TablesDB client from `useAppwrite()`:

```ts
const { tables } = useAppwrite();
```

* Queries live in `src/queries`, mutations in `src/mutations`.
* Use `queryOptions`, `infiniteQueryOptions`, and `mutationOptions` from TanStack Query to define reusable query/mutation objects.
* For hooks that wrap queries or mutations and need `tables` from context, place them in `@/hooks` and follow `use-` naming conventions.

### Server Functions (TanStack Start)

* Import and use server functions on the client with:

```ts
import { useServerFn } from "@tanstack/react-start";
```

* Wrap the server function with `useServerFn` to get a callable function:

```ts
const signIn = useServerFn(signInWithEmail);
```

* **Important:** `useServerFn` does **not** provide loading/error state.

  * If you need status handling, retries, caching, or invalidation, use **TanStack Query** (`useQuery` / `useMutation`) with `queryOptions` / `mutationOptions`.
  * In practice:

    * Use `useServerFn` for simple fire-and-forget or imperative calls.
    * Use `useMutation` for anything that affects server state and requires UI feedback.

### Query Options as Hooks

* Wrap `queryOptions` in hooks when access to context (e.g., `tables`) is required.
* For list queries with filtering, sorting, pagination, and search, define an options object as the second value in the query key.
* Example arguments: `page`, `perPage`, `search`, `sortDirections`, `showArchived`, and any future filters.
* Centralize database/table IDs in `@/lib/appwrite/const`.

**Example: List Query Hook**

```ts
export function useProductsQueryOptions({ page = 1, perPage = 20, search = '', sortDirections = {}, showArchived = false }) {
  const { tables, user } = useAppwrite();

  return queryOptions({
    queryKey: ['products', { page, perPage, search, sortDirections, showArchived }],
    queryFn: async ({ queryKey: [_, { page, perPage, search, sortDirections, showArchived }] }) => {
      if (!user?.$id) return { total: 0, documents: [] };

      const orderQueries = Object.entries(sortDirections).map(([key, dir]) =>
        dir === 'desc' ? Query.orderDesc(key) : Query.orderAsc(key)
      );

      return tables.listRows({
        databaseId,
        tableId: tableIds.products,
        queries: [
          Query.equal('userId', user.$id),
          ...(showArchived ? [] : [Query.isNull('archivedAt')]),
          ...(search ? [Query.or([Query.search('name', search), Query.search('brand', search), Query.search('category', search)])] : []),
          ...orderQueries,
          Query.orderAsc('$updatedAt'),
          Query.orderAsc('$createdAt'),
          Query.offset((page - 1) * perPage),
          Query.limit(perPage),
        ],
      });
    },
    staleTime: 5000,
  });
}
```

* Usage:

```ts
const options = useProductsQueryOptions({ page: 1, perPage: 10, search: 'math' });
const { data, isLoading } = useQuery(options);
```

### Mutations

* Mutations live in `src/mutations`.
* Wrap TanStack `useMutation` and use `tables` from `useAppwrite()`.
* **Row creation nuances:**

  * Appwrite does **not** auto-generate row IDs; use `ID.unique()`.
  * Immediately available row ID is useful for query invalidation or navigation.
  * Set **row-level permissions** using `Permission.read`, `Permission.update`, `Permission.delete` (or `Permission.write`) for RBAC.
* **Query invalidation:** Prefer passing just the query key prefix (e.g., `'tutoring-sessions'`) to invalidate all related queries. Hooks can compose, e.g., `useCreateTutoringSessionMutationOptions` can call `useTutoringSessionsQueryOptions` to get the queryKey.

**Example: Create Row Mutation**

```ts
const { mutate: createRegiment, isPending } = useMutation({
  mutationFn: async () => {
    return tables.createRow({
      databaseId,
      tableId: tableIds.regiments,
      rowId: ID.unique(),
      data: { type, routine: routineId },
      permissions: [
        Permission.read(Role.user(user!.$id)),
        Permission.update(Role.user(user!.$id)),
        Permission.delete(Role.user(user!.$id)),
      ],
    });
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: useRegimentsQueryOptions().queryKey[0] });
    onClose();
  },
});
```
