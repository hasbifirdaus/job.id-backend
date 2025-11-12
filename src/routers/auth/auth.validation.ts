import * as yup from "yup";

export const registerJobSeekerValidation = yup.object({
  name: yup.string().required("Name is required").min(3).max(50),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Minimum 8 characters")
    .matches(/[A-Z]/, "At least one uppercase letter")
    .matches(/[a-z]/, "At least one lowercase letter")
    .matches(/[0-9]/, "At least one number")
    .matches(/[@$!%*?&]/, "At least one special character"),
});

export const registerCompanyAdminValidation = yup.object({
  name: yup.string().required("Full name is required").min(3).max(50),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(8)
    .matches(/[A-Z]/)
    .matches(/[a-z]/)
    .matches(/[0-9]/)
    .matches(/[@$!%*?&]/),
  companyName: yup
    .string()
    .required("Company name is required")
    .min(3)
    .max(100),
  companyPhone: yup.string().required("Phone number is required"),
  companyLocation: yup.string().required("Location is required"),
  companyDescription: yup.string().nullable(),
});

export const loginValidation = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});
