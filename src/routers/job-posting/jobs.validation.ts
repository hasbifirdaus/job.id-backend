import { z } from "zod";
import { Request, Response, NextFunction } from "express";

export const createJobSchema = z
  .object({
    title: z.string().min(3),
    description: z.string().min(10),

    banner_image_url: z.string().url().optional().nullable(),

    category_id: z.coerce.number().int().positive(),
    city_id: z.coerce.number().int().positive(),

    min_salary: z.coerce.number().nonnegative().optional().nullable(),
    max_salary: z.coerce.number().nonnegative().optional().nullable(),

    deadline: z

      .string()
      .nullable()
      .optional()
      .refine(
        (s) =>
          s === null ||
          s === undefined ||
          s === "" ||
          !Number.isNaN(Date.parse(s as string)),
        { message: "Deadline must be a valid date string or empty." }
      ),

    is_published: z.boolean().optional(),
    tags: z.array(z.string().min(1)).optional(),

    contract_type: z
      .enum([
        "FULL_TIME",
        "PART_TIME",
        "CONTRACT",
        "INTERNSHIP",
        "FREELANCE",
        "REMOTE",
      ])
      .optional(),
  })

  .refine(
    (data) => {
      const min = data.min_salary || 0;
      const max = data.max_salary || 0;
      return min <= max;
    },
    {
      message: "Minimum salary cannot be greater than maximum salary.",
      path: ["min_salary"],
    }
  );

export const updateJobSchema = createJobSchema.partial();

type ZodSchema = typeof createJobSchema | typeof updateJobSchema;

export const validateZod =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          message: "Validation error",
          issues: err.issues,
        });
        return;
      }
      next(err);
    }
  };
