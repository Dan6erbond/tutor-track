import { createAdminClient, createSessionClient } from "@/lib/appwrite/server";

import { bucketId } from "@/lib/appwrite/const";
import { createClient } from "@/lib/appwrite";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/files/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { id } = params;

        try {
          // 1. Verify user access with session client
          const { storage } = await createSessionClient();
          const file = await storage.getFile({
            bucketId,
            fileId: id,
          });

          // 2. Manage viewing token via admin client
          const { tokens } = await createAdminClient();
          let token: string;

          const tokensList = await tokens.list({
            bucketId: file.bucketId,
            fileId: file.$id,
          });

          if (tokensList.tokens.length > 0) {
            token = tokensList.tokens[0].secret;
          } else {
            const newToken = await tokens.createFileToken({
              bucketId: file.bucketId,
              fileId: file.$id,
            });
            token = newToken.secret;
          }

          // 3. Generate the view URL
          const { storage: storageClient } = createClient();
          const fileViewUrl = storageClient.getFileView({
            bucketId: file.bucketId,
            fileId: file.$id,
            token,
          });

          // 4. Redirect
          return new Response(null, {
            status: 302,
            headers: {
              Location: fileViewUrl.toString(),
            },
          });
        } catch (error) {
          return new Response("Unauthorized or Not Found", { status: 404 });
        }
      },
    },
  },
});
