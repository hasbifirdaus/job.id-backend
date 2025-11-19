import * as yup from "yup";

export const applicationIdParamSchema = yup.object({
  applicationId: yup
    .number()
    .positive()
    .integer()
    .required("Application ID is required"),
});

export const applyJobBodySchema = yup.object({
  job_id: yup.number().required().typeError("Job ID must be a number"),
  expected_salary: yup
    .number()
    .required()
    .typeError("Expected salary must be a number"),

  fullName: yup.string().required(),
  email: yup.string().email().required(),
  phone: yup.string().required(),
  linkedin: yup.string().optional(),
  experienceSummary: yup.string().optional(),
  coverLetter: yup.string().optional(),
});
