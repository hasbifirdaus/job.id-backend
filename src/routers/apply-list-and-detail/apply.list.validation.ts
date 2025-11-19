import * as yup from "yup";

export const applyJobSchema = yup.object({
  job_id: yup.number().integer().positive().required(),
  expected_salary: yup
    .number()
    .typeError("expected_salary harus number")
    .positive()
    .required(),
  cover_letter: yup.string().trim().max(5000).nullable(),
  extra_info: yup
    .mixed()
    .nullable()
    .test("is-json-or-null", "extra_info harus berupa objek JSON", (val) => {
      if (val === null || val === undefined || val === "") return true;
      if (typeof val === "object") return true;
      try {
        JSON.parse(val as any);
        return true;
      } catch {
        return false;
      }
    }),
  // jika kamu ingin menerima file cv, gunakan validate(..., options: { fileField: "cv" })
});

export const applicationIdParamSchema = yup.object({
  id: yup.number().integer().positive().required(),
});

export const listApplicationsQuerySchema = yup.object({
  page: yup.number().integer().min(1).default(1),
  limit: yup.number().integer().min(1).max(100).default(20),
  status: yup
    .string()
    .oneOf(["SUBMITTED", "REVIEWED", "INTERVIEW", "ACCEPTED", "REJECTED"])
    .nullable(),
  job_id: yup.number().integer().positive().nullable(),
});

export const updateApplicationStatusSchema = yup.object<{
  status: "SUBMITTED" | "REVIEWED" | "INTERVIEW" | "ACCEPTED" | "REJECTED";
  feedback?: string | null;
  rejectedReason?: string | null;
}>({
  status: yup
    .string()
    .oneOf(["SUBMITTED", "REVIEWED", "INTERVIEW", "ACCEPTED", "REJECTED"])
    .required(),

  feedback: yup.string().nullable(),

  rejectedReason: yup
    .string()
    .nullable()
    .when("status", ([status], schema) => {
      if (status === "REJECTED") {
        return schema.required(
          "rejectedReason required when status is REJECTED"
        );
      }
      return schema;
    }),
});
