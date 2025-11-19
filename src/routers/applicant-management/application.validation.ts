import * as yup from "yup";

// ==============================
// Helper untuk transform string -> number opsional
// ==============================
const optionalNumber = yup.number().nullable().optional();

// ==============================
// Param Schema: applicationId / jobId
// ==============================
export const applicationIdParamSchema = yup.object({
  id: yup
    .string()
    .required("Application ID is required")
    .trim()
    .test("is-valid-integer", "ID must be a positive integer", (value) => {
      if (!value) return false;
      const num = Number(value);

      return !isNaN(num) && Number.isInteger(num) && num > 0;
    }),
});

export const jobIdParamSchema = yup.object({
  jobId: yup
    .string()
    .required("Job ID is required")
    .trim()
    .test("is-valid-integer", "Job ID must be a positive integer", (value) => {
      if (!value) return false;
      const num = Number(value);
      return !isNaN(num) && Number.isInteger(num) && num > 0;
    }),
});

// ==============================
// Query Schema: getApplicantsByJob
// ==============================
export const getApplicantsByJobQuerySchema = yup.object({
  page: optionalNumber
    .required("Page is required")
    .integer("Page must be an integer")
    .positive("Page must be positive")
    .default(1),

  limit: optionalNumber
    .required("Limit is required")
    .integer("Limit must be an integer")
    .positive("Limit must be positive")
    .default(10),

  sortKey: yup
    .string()
    .oneOf(
      ["created_at", "user_name", "user_dob", "expected_salary"],
      "Invalid sortKey"
    )
    .default("created_at"),

  sortOrder: yup
    .string()
    .oneOf(["asc", "desc"], "Sort order must be 'asc' or 'desc'")
    .default("asc"),

  name: yup.string().optional(),
  education: yup.string().optional(),

  minAge: optionalNumber
    .integer("minAge must be an integer")
    .min(0, "minAge cannot be negative"),

  maxAge: optionalNumber
    .integer("maxAge must be an integer")
    .min(0, "maxAge cannot be negative"),

  expected_salary: optionalNumber.min(0, "expected_salary cannot be negative"),
});
// ==============================
// Body Schema: updateApplicationStatus
// ==============================
// const applicationStatusValues = Object.values(ApplicationStatus);

const frontendApplicationStatusValues = [
  "APPLIED",
  "PROCESSED",
  "INTERVIEWED",
  "ACCEPTED",
  "REJECTED",
];

export const updateApplicationStatusBodySchema = yup.object({
  status: yup
    .string()
    .oneOf(
      frontendApplicationStatusValues,
      "Invalid status. Must be one of APPLIED, PROCESSED, etc."
    )
    .required("Status is required"),
  notes: yup.string().optional(),
});
