import * as yup from "yup";
import { InterviewType } from "../../types/interview.types";

const interviewTypeEnum: InterviewType[] = ["ONLINE", "OFFLINE", "HYBRID"];

export const interviewIdParamSchema = yup.object({
  id: yup.number().positive().integer().required("Interview ID is required"),
});

export const createInterviewSchema = yup.object({
  application_id: yup.number().positive().integer().required(),
  schedule_date: yup.date().required().typeError("Schedule date must be valid"),
  interview_type: yup
    .string()
    .oneOf(interviewTypeEnum as any)
    .required(),
  location: yup.string().when("interview_type", {
    is: (val: InterviewType) => val === "OFFLINE" || val === "HYBRID",
    then: (s) => s.required("Location is required for offline/hybrid"),
    otherwise: (s) => s.notRequired(),
  }),
  meeting_link: yup.string().when("interview_type", {
    is: (val: InterviewType) => val === "ONLINE" || val === "HYBRID",
    then: (s) => s.required("Meeting link is required for online/hybrid"),
    otherwise: (s) => s.notRequired(),
  }),
  notes: yup.string().optional(),
});

export const updateInterviewSchema = yup.object({
  schedule_date: yup.date().optional().typeError("Schedule date must be valid"),
  interview_type: yup
    .string()
    .oneOf(interviewTypeEnum as any)
    .optional(),
  location: yup.string().optional(),
  meeting_link: yup.string().optional(),
  notes: yup.string().optional(),
});

export const createBulkInterviewSchema = yup.object({
  schedules: yup
    .array()
    .of(createInterviewSchema)
    .min(1, "At least one schedule is required")
    .required(),
});
