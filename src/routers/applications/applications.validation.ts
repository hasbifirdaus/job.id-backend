import * as yup from "yup";

export const applicationIdParamSchema = yup.object({
  applicationId: yup
    .number()
    .positive()
    .integer()
    .required("Application ID is required"),
});

export const applyJobBodySchema = yup.object({
  job_id: yup
    .number()
    .positive()
    .integer()
    .required("Job ID is required")
    .typeError("Job ID must be a number"),
  cover_letter: yup.string().optional(),
  expected_salary: yup
    .number()
    .positive()
    .required("Expected salary is required")
    .typeError("Expected salary must be a number"),
});
