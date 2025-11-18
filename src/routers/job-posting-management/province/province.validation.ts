import * as yup from "yup";

export const createProvinceBodySchema = yup.object({
  name: yup.string().required("Province name is required"),
});
