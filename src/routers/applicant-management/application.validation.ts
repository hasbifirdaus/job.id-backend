import * as yup from "yup";
import { ApplicationStatus } from "../../generated/prisma";

export const applicationIdParamSchema = yup.object({
  id: yup.number().positive().integer().required("Application ID is required"),
});

export const jobIdParamSchema = yup.object({
  jobId: yup.number().positive().integer().required("Job ID is required"),
});

export const getApplicantsByJobQuerySchema = yup.object({
  page: yup
    .number()
    .positive()
    .integer()
    .default(1)
    .typeError("Page must be a number"),
  limit: yup
    .number()
    .positive()
    .integer()
    .default(10)
    .typeError("Limit must be a number"),
  sortKey: yup.string().default("created_at"),
  sortOrder: yup
    .string()
    .oneOf(["asc", "desc"], "Sort order must be 'asc' or 'desc'")
    .default("asc"),
  name: yup.string().optional(),
  minAge: yup
    .number()
    .positive()
    .integer()
    .optional()
    .typeError("minAge must be a number"),
  maxAge: yup
    .number()
    .positive()
    .integer()
    .optional()
    .typeError("maxAge must be a number"),
  education: yup.string().optional(),
  expected_salary: yup
    .number()
    .positive()
    .optional()
    .typeError("expected_salary must be a number"),
});

const applicationStatusValues = Object.values(ApplicationStatus);

export const updateApplicationStatusBodySchema = yup.object({
  status: yup
    .mixed<ApplicationStatus>()
    .oneOf(applicationStatusValues, "Invalid status")
    .required("Status is required"),
  notes: yup.string().optional(),
});
