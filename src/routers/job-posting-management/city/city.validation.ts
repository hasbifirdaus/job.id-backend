import * as yup from "yup";

export const createCityBodySchema = yup.object({
  name: yup.string().required("City name is required"),
  province_id: yup
    .number()
    .positive()
    .integer()
    .required("Province ID is required")
    .typeError("Province ID must be a number"),
});

export const provinceIdParamSchema = yup.object({
  province_id: yup
    .number()
    .positive()
    .integer()
    .required("Province ID is required")
    .typeError("Province ID must be a number"),
});
