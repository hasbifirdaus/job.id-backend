import * as yup from "yup";

export const createInterviewSchema = yup.object({
  application_id: yup
    .number()
    .integer()
    .positive()
    .required("Application ID is required"),

  schedule_date: yup
    .date()
    .min(new Date(), "Schedule date must be in the future")
    .required("Schedule date is required"),

  interview_type: yup
    .mixed<"ONLINE" | "OFFLINE" | "HYBRID">()
    .oneOf(["ONLINE", "OFFLINE", "HYBRID"], "Invalid interview type")
    .required("Interview type is required"),

  location: yup.string().when("interview_type", {
    is: (val: string) => val === "OFFLINE" || val === "HYBRID",
    then: (schema) => schema.required("Location is required"),
    otherwise: (schema) => schema.nullable(),
  }),

  meeting_link: yup.string().when("interview_type", {
    is: (val: string) => val === "ONLINE" || val === "HYBRID",
    then: (schema) =>
      schema
        .url("Meeting link must be a valid URL")
        .required("Meeting link is required"),
    otherwise: (schema) => schema.nullable(),
  }),

  notes: yup.string().max(500, "Notes too long").nullable(),
});
