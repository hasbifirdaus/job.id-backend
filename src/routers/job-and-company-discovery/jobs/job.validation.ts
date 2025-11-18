import * as yup from "yup";
const toNumber = (value: any, originalValue: any) => {
  if (
    originalValue === undefined ||
    originalValue === null ||
    originalValue === ""
  ) {
    return undefined;
  }
  const numberValue = Number(originalValue);
  return isNaN(numberValue) ? undefined : numberValue;
};
export const discoverJobsQuerySchema = yup
  .object({
    page: yup
      .number()
      .transform(toNumber)
      .positive("Page must be positive")
      .integer("Page must be an integer")
      .default(1),

    limit: yup
      .number()
      .transform(toNumber)
      .positive("Limit must be positive")
      .integer("Limit must be an integer")
      .default(10),

    title: yup.string().nullable().optional(),

    category: yup.string().nullable().optional(),
    city: yup.string().nullable().optional(),
    province: yup.string().nullable().optional(),
    tag: yup.string().nullable().optional(),
    contractType: yup.string().nullable().optional(),

    minSalary: yup
      .number()
      .transform(toNumber)
      .min(0, "Salary cannot be negative")
      .nullable()
      .optional(),

    maxSalary: yup
      .number()
      .transform(toNumber)
      .min(0, "Salary cannot be negative")
      .nullable()
      .optional(),

    dateRange: yup
      .string()
      .oneOf(["7days", "1month"], "dateRange must be '7days' or '1month'")
      .nullable()
      .optional(),

    sort: yup
      .string()
      .oneOf(
        ["latest", "oldest", "highest", "lowest"],
        "Sort must be 'latest', 'oldest', 'highest', or 'lowest'"
      )
      .default("latest"),
  })
  .noUnknown(false);

export const jobIdParamSchema = yup.object({
  id: yup
    .number()
    .transform((value, originalValue) => Number(originalValue))
    .positive("Job ID must be positive")
    .integer("Job ID must be an integer")
    .required("Job ID is required"),
});
