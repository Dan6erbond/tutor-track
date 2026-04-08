1. Project Structure & Core Patterns

- Routes: New pages must be provided as complete files using createFileRoute from TanStack Start.
- Components: Feature-based grouping: @/components/{feature}/{kebab-case-name}.tsx.
- Data Fetching: Hooks in @/queries/{feature} or @/mutations/{feature}.
- Crucial: Hooks must return the queryOptions or mutationOptions object so components can call them inside useQuery, useSuspenseQuery, or useMutation.
- Validation: Always use TanStack Form with Zod. Map all field props, including state.meta.errors, and ensure aesthetic error states using HeroUI.
- Typescript: Strict typing is mandatory. Always define interfaces for props and data structures, especially when interacting with Appwrite's TablesDB.
- Appwrite: Appwrite is used to manage auth, database and storage. The Appwrite CLI generates all model types to @/lib/appwrite/types. Always use these types when working with Appwrite data to ensure type safety and consistency across the codebase.
- Icons: Lucide Icons are used for all icons. Use Tailwind `size-x` classes and HeroUI semantic colors.

2. Context & Data Syntax (Appwrite TablesDB)

Use `useAppwrite()` and `useAuth()` contexts.

`listRows`:

TypeScript

```ts
import type { Students } from "@/lib/appwrite/types";

const { tables } = useAppwrite();

// Use in queryFn
return tables.listRows<Students>({
  databaseId,
  tableId: tableIds.sessions,
  queries: [Query.equal("userId", userId), Query.orderDesc("date")],
});
```

`createRow`:

TypeScript

```ts
import type { ModelCreate } from "@/lib/appwrite/utils";
import type { Students } from "@/lib/appwrite/types";

// Use in mutationFn
return tables.createRow<ModelCreate<Students>>({
  databaseId,
  tableId: tableIds.sessions,
  rowId: ID.unique(),
  data: { ...payload },
  permissions: [
    Permission.read(Role.user(userId)),
    Permission.write(Role.user(userId)),
  ],
});
```

3. Reference Table for Aliases

| Alias        | Content                          | Naming Convention                 |
| :----------- | :------------------------------- | :-------------------------------- |
| @/routes     | TanStack Start file-based routes | route-name.tsx                    |
| @/components | UI & Feature components          | feature/component-name.tsx        |
| @/queries    | queryOptions hooks               | feature/use-name-query-options.ts |
| @/mutations  | mutationOptions hooks            | feature/use-name-mutation.ts      |
| @/contexts   | Auth and Appwrite providers      | auth.tsx, appwrite.tsx            |

4. Design System (HeroUI v3 + Tailwind v4)

- Aesthetics: Aim for a "Soft Pro" look. Use semantic colors: bg-accent, bg-accent-soft, text-accent-foreground.
- Compound Patterns: Use the v3 sub-component architecture (e.g., <Modal><ModalContent>...</ModalContent></Modal>).

5. Mandatory Checkpoints (When to Ask)

- You must stop and ask the user for resources in the following scenarios:
- Types: When you need the exact schema for Appwrite models located in `@/lib/appwrite/types`.
- UI Reference: When implementing complex HeroUI v3 components (e.g., Tables, Selects, Tabs) if you do not have the specific compound component prop structure. Do not hallucinate the component API.
