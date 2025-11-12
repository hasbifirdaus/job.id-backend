import * as yup from "yup";

export const updateProfileValidation = yup.object({
  name: yup.string().min(2).max(100).optional(),
  email: yup.string().email("Invalid email").optional(),
  dob: yup.date().nullable().optional(),
  gender: yup
    .mixed<"MALE" | "FEMALE" | "OTHER">()
    .oneOf(["MALE", "FEMALE", "OTHER"])
    .nullable()
    .optional(),
  education: yup.string().max(100).nullable().optional(),
  address: yup.string().max(255).nullable().optional(),

  new_password: yup
    .string()
    .min(8, "Password min 8 chars")
    .matches(/[A-Z]/, "At least one uppercase")
    .matches(/[a-z]/, "At least one lowercase")
    .matches(/[0-9]/, "At least one number")
    .matches(/[@$!%*?&]/, "At least one special char")
    .optional(),

  current_password: yup.string().when("new_password", {
    is: (val: unknown): val is string =>
      typeof val === "string" && val.length > 0,
    then: (schema) =>
      schema.required("Current password is required to change password"),
    otherwise: (schema) => schema.optional(),
  }),
});

export const verifyEmailParamsValidation = yup.object({
  token: yup.string().required("Token is required"),
});

export const resendVerificationValidation = yup.object({
  email: yup.string().email("Invalid email").optional(),
});
