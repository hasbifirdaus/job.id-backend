import * as yup from "yup";

export const createCategoryBodySchema = yup.object({
  name: yup.string().required("Category name is required"),
});
