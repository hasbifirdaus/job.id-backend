import * as yup from "yup";

export const createJobBodySchema = yup.object({
  title: yup.string().required("Job title is required"),
  category_id: yup
    .number()
    .positive()
    .integer()
    .required("Category ID is required"),
  city_id: yup.number().positive().integer().required("City ID is required"),
  description: yup.string().required("Job description is required"),
  banner_image_url: yup.string().optional(),
  min_salary: yup
    .number()
    .positive()
    .required("Minimum salary is required")
    .typeError("min_salary must be a number"),
  max_salary: yup
    .number()
    .positive()
    .required("Maximum salary is required")
    .typeError("max_salary must be a number"),
  deadline: yup
    .date()
    .required("Deadline is required")
    .typeError("Deadline must be a valid date"),
  tags: yup.array().of(yup.number().positive().integer()).optional(),
  is_published: yup.boolean().required("is_published is required"),
});

export const updateJobBodySchema = yup.object({
  title: yup.string().optional(),
  category_id: yup.number().positive().integer().optional(),
  city_id: yup.number().positive().integer().optional(),
  description: yup.string().optional(),
  banner_image_url: yup.string().optional(),
  min_salary: yup.number().positive().optional(),
  max_salary: yup.number().positive().optional(),
  deadline: yup.date().optional(),
  tags: yup.array().of(yup.number().positive().integer()).optional(),
  is_published: yup.boolean().optional(),
});

export const jobIdParamSchema = yup.object({
  id: yup.number().positive().integer().required("Job ID is required"),
});
