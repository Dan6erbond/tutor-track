import { Button, Card, Modal } from "@heroui/react";
import { Calendar, ChevronLeft, Download, FileCheck } from "lucide-react";
import { Link, createFileRoute } from "@tanstack/react-router";

import { PDFEditor } from "@/components/confirmations/form";
import { SessionMultiSelect } from "@/components/sessions/multi-select";
import { getConfirmationVariables } from "@/lib/confirmations/variables";
import { useConfirmationQueryOptions } from "@/queries/confirmations";
import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useUpdateConfirmationMutation } from "@/mutations/confirmations";

export const Route = createFileRoute("/app/confirmations/$confirmationId")({
  component: ConfirmationDetailsPage,
});

function ConfirmationDetailsPage() {
  const { confirmationId } = Route.useParams();
  const { data: confirmation } = useSuspenseQuery(
    useConfirmationQueryOptions(confirmationId),
  );
  const updateMutation = useUpdateConfirmationMutation();

  // Local state for the session picker
  const [selectedSessions, setSelectedSessions] = useState<string[]>(
    confirmation.sessions.map((s) => s.$id),
  );

  const variables = getConfirmationVariables(
    confirmation,
    confirmation.sessions,
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            className="min-w-0 p-2"
            render={(props) => (
              <Link {...props as any} to="/app/confirmations">
                <ChevronLeft size={18} />
              </Link>
            )}
          />
          <div>
            <h1 className="text-xl font-black flex items-center gap-2">
              <FileCheck className="text-accent" />
              {confirmation.student.name}
            </h1>
            <p className="text-[10px] text-accent font-black uppercase tracking-widest">
              {confirmation.template.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* V3 Modal Architecture */}
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
                        <Modal.Heading>Update Included Sessions</Modal.Heading>
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

          <Button className="bg-accent text-accent-foreground font-bold">
            <Download size={16} className="mr-2" /> Export PDF
          </Button>
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
                <span className="text-xs text-default-500">
                  {confirmation.student.email}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-default-400 uppercase font-bold">
                  Session Count
                </span>
                <span className="text-sm font-bold">
                  {confirmation.sessions.length} sessions
                </span>
              </div>
            </div>
          </Card>
        </aside>

        <main className="xl:col-span-3">
          <PDFEditor
            templateConfig={confirmation.template.template}
            variables={variables}
          />
        </main>
      </div>
    </div>
  );
}
