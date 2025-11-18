import * as yup from "yup";

export const discoverCompaniesQuerySchema = yup.object({
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
  name: yup.string().optional(),
  city: yup.string().optional(),
  province: yup.string().optional(),
  tag: yup.string().optional(),
  sort: yup
    .string()
    .oneOf(["name_asc", "name_desc"], "Sort must be 'name_asc' or 'name_desc'")
    .default("name_asc"),
});

export const companyIdParamSchema = yup.object({
  id: yup.number().positive().integer().required("Company ID is required"),
});
