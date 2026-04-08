export const APPWRITE_SESSION_KEY = "appwrite-session" as const;

export const databaseId = "69d53796001b42b894ba" as const;

export const tableIds = {
  students: "students",
  subjects: "subjects",
  tutoringSessions: "tutoring_sessions",
  paymentConfirmations: "payment_confirmations",
  documentTemplates: "document_templates",
} as const;

export const teamIds = {
  admins: import.meta.env.VITE_ADMIN_TEAM_ID,
};

export const bucketId = import.meta.env.VITE_BUCKET_ID;
