import { Button, Card, Modal, Spinner } from "@heroui/react";
import { Calendar, ChevronLeft, Download, FileCheck } from "lucide-react";
import { ID, Permission, Role } from "appwrite";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { PDFEditor } from "@/components/confirmations/form";
import { PDFViewer } from "@/components/confirmations/viewer";
import { SessionMultiSelect } from "@/components/sessions/multi-select";
import { bucketId } from "@/lib/appwrite/const";
import { generate } from "@pdfme/generator";
import { getConfirmationVariables } from "@/lib/confirmations/variables";
import plugins from "@/lib/pdfme/plugins";
import { useAppwrite } from "@/contexts/appwrite";
import { useAuth } from "@/contexts/auth";
import { useConfirmationQueryOptions } from "@/queries/confirmations";
import { useQuery } from "@tanstack/react-query";
import { useUpdateConfirmationMutation } from "@/mutations/confirmations";

export const Route = createFileRoute("/app/confirmations/$confirmationId")({
  component: ConfirmationDetailsPage,
});

function ConfirmationDetailsPage() {
  const { confirmationId } = Route.useParams();
  const { user } = useAuth();
  const { storage } = useAppwrite();

  // Changed to useQuery to handle manual loading states
  const { data: confirmation, isLoading } = useQuery(
    useConfirmationQueryOptions(confirmationId),
  );

  const updateMutation = useUpdateConfirmationMutation();

  const [pdfData, setPdfData] = useState<Record<string, any>[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  // State for session selection
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);

  // Sync state once data is loaded
  useEffect(() => {
    if (confirmation?.sessions) {
      setSelectedSessions(confirmation.sessions.map((s) => s.$id));
    }
  }, [confirmation]);

  // Loading state with correct semantic colors
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Spinner color="accent" />
        <span className="text-sm font-bold text-accent animate-pulse">
          Loading Confirmation...
        </span>
      </div>
    );
  }

  if (!confirmation) return null;

  const variables = getConfirmationVariables(
    confirmation,
    confirmation.sessions,
  );

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const pdf = await generate({
        template: JSON.parse(confirmation.template.template),
        inputs: pdfData.length > 0 ? pdfData : [variables],
        plugins,
      });

      const file = new File(
        [pdf.buffer],
        `confirmation-${confirmationId}.pdf`,
        { type: "application/pdf" },
      );

      const uploadedFile = await storage.createFile({
        bucketId,
        fileId: ID.unique(),
        file: file,
        permissions: [
          Permission.read(Role.user(user!.$id)),
          Permission.write(Role.user(user!.$id)),
        ],
      });

      await updateMutation.mutateAsync({
        id: confirmationId,
        data: { fileId: uploadedFile.$id },
      });
    } catch (error) {
      console.error("Failed to export PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const isFinalized = !!confirmation.fileId;
  const fileUrl = `/api/files/${confirmation.fileId}`;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            className="min-w-0 p-2"
            render={(props) => (
              <Link {...(props as any)} to="/app/confirmations">
                <ChevronLeft size={18} />
              </Link>
            )}
          />
          <div>
            <h1 className="text-xl font-black flex items-center gap-2">
              <FileCheck
                className={isFinalized ? "text-success" : "text-accent"}
              />
              {confirmation.student.name}
            </h1>
            <p className="text-[10px] text-accent font-black uppercase tracking-widest">
              {confirmation.template.name} {isFinalized && "• Finalized"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isFinalized ? (
            <>
              <Modal>
                <Button variant="secondary" className="font-bold">
                  <Calendar size={16} className="mr-2" /> Manage Sessions
                </Button>
                <Modal.Backdrop>
                  <Modal.Container placement="center">
                    <Modal.Dialog className="sm:max-w-150">
                      {(renderProps) => (
                        <>
                          <Modal.CloseTrigger />
                          <Modal.Header>
                            <Modal.Heading>
                              Update Included Sessions
                            </Modal.Heading>
                          </Modal.Header>
                          <Modal.Body>
                            <SessionMultiSelect
                              studentId={confirmation.student.$id}
                              value={selectedSessions}
                              onChange={(val) =>
                                setSelectedSessions(val as string[])
                              }
                            />
                          </Modal.Body>
                          <Modal.Footer>
                            <Button variant="secondary" slot="close">
                              Cancel
                            </Button>
                            <Button
                              className="bg-accent text-accent-foreground font-bold"
                              isPending={updateMutation.isPending}
                              onPress={async () => {
                                await updateMutation.mutateAsync({
                                  id: confirmationId,
                                  data: { sessions: selectedSessions },
                                });
                                renderProps.close();
                              }}
                            >
                              Save Changes
                            </Button>
                          </Modal.Footer>
                        </>
                      )}
                    </Modal.Dialog>
                  </Modal.Container>
                </Modal.Backdrop>
              </Modal>

              <Button
                className="bg-accent text-accent-foreground font-bold"
                onPress={handleExport}
                isPending={isExporting}
              >
                <Download size={16} className="mr-2" />
                {isExporting ? "Exporting..." : "Export PDF"}
              </Button>
            </>
          ) : (
            <Button
              className="bg-success text-success-foreground font-bold"
              onPress={() => window.open(fileUrl, "_blank")}
            >
              <Download size={16} className="mr-2" /> Download Final PDF
            </Button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <aside className="space-y-4">
          <Card className="p-5 bg-accent-soft/10 border-none shadow-none">
            <h3 className="text-[10px] font-black text-accent uppercase tracking-widest mb-4">
              Overview
            </h3>
            <div className="space-y-5">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-default-400 uppercase font-bold">
                  Student
                </span>
                <span className="text-sm font-bold truncate">
                  {confirmation.student.name}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-default-400 uppercase font-bold">
                  Status
                </span>
                <span
                  className={`text-xs font-bold ${isFinalized ? "text-success" : "text-warning"}`}
                >
                  {isFinalized ? "Ready for Download" : "Drafting"}
                </span>
              </div>
            </div>
          </Card>
        </aside>

        <main className="xl:col-span-3">
          {isFinalized ? (
            <PDFViewer url={fileUrl} />
          ) : (
            <PDFEditor
              templateConfig={confirmation.template.template}
              variables={variables}
              onDataChange={setPdfData}
            />
          )}
        </main>
      </div>
    </div>
  );
}
