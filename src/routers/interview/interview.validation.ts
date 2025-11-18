import * as yup from "yup";

export const interviewIdParamSchema = yup.object({
  id: yup.number().positive().integer().required("Interview ID is required"),
});

export const createInterviewSchema = yup.object({
  application_id: yup
    .number()
    .positive()
    .integer()
    .required("Application ID is required"),
  schedule_date: yup
    .date()
    .required("Schedule date is required")
    .typeError("Schedule date must be a valid date"),
  interview_type: yup
    .string()
    .oneOf(["ONLINE", "OFFLINE", "HYBRID"], "Invalid interview type")
    .required("Interview type is required"),
  location: yup.string().when("interview_type", {
    is: (val: string) => val === "OFFLINE" || val === "HYBRID",
    then: (schema) =>
      schema.required("Location is required for offline or hybrid interview"),
    otherwise: (schema) => schema.notRequired(),
  }),
  meeting_link: yup.string().when("interview_type", {
    is: (val: string) => val === "ONLINE" || val === "HYBRID",
    then: (schema) =>
      schema.required(
        "Meeting link is required for online or hybrid interview"
      ),
    otherwise: (schema) => schema.notRequired(),
  }),
  notes: yup.string().optional(),
});

export const updateInterviewSchema = yup.object({
  schedule_date: yup
    .date()
    .optional()
    .typeError("Schedule date must be a valid date"),
  interview_type: yup
    .string()
    .oneOf(["ONLINE", "OFFLINE", "HYBRID"], "Invalid interview type")
    .optional(),
  location: yup.string().optional(),
  meeting_link: yup.string().optional(),
  notes: yup.string().optional(),
});
