import type {
  PaymentConfirmations,
  TutoringSessions,
} from "@/lib/appwrite/types";

/**
 * Generates a flat object of variables available for PDF injection.
 * Includes student details and aggregated session info.
 */
export const getConfirmationVariables = (
  confirmation: PaymentConfirmations,
  sessions: TutoringSessions[],
) => {
  const totalAmount = sessions.reduce((acc, s) => acc + (s.amountPaid || 0), 0);
  const totalDuration = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);

  const sessionsTable = sessions.map((s) => [
    s.$id,
    new Date(s.date).toLocaleDateString(),
    s.subject?.name || "N/A",
    s.duration ? `${s.duration}m` : "-",
    s.amountPaid ? `${s.amountPaid}` : "0",
  ]);

  return {
    sessionsTable,
    studentName: confirmation.student.name,
    studentEmail: confirmation.student.email || "",
    totalAmount: totalAmount.toString(),
    totalDuration: `${totalDuration} mins`,
    sessionCount: sessions.length.toString(),
    // Formatted list for text-area injections
    sessionList: sessions
      .map(
        (s) => `${new Date(s.date).toLocaleDateString()}: ${s.amountPaid || 0}`,
      )
      .join("\n"),
    currentDate: new Date().toLocaleDateString(),
  };
};
