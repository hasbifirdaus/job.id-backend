import * as yup from "yup";

export const tagBodySchema = yup.object({
  name: yup.string().required("Tag name is required"),
});

export const tagIdParamSchema = yup.object({
  id: yup
    .number()
    .positive()
    .integer()
    .required("Tag ID is required")
    .typeError("Tag ID must be a number"),
});
