import { z } from "zod";
import { Request, Response, NextFunction } from "express";

export const createJobSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),

  banner_image_url: z.string().url().optional().nullable(),

  category_id: z.coerce.number().int().positive(),
  city_id: z.coerce.number().int().positive(),

  min_salary: z.coerce.number().nonnegative().optional(),
  max_salary: z.coerce.number().nonnegative().optional(),

  deadline: z.string().refine((s) => !Number.isNaN(Date.parse(s)), {
    message: "deadline must be a valid date string",
  }),

  is_published: z.boolean().optional(),
  tags: z.array(z.string().min(1)).optional(),

  contract_type: z
    .enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "FREELANCE"])
    .optional(),
});

// UPDATE = semua optional, dan id TIDAK BOLEH ada di body
export const updateJobSchema = createJobSchema.partial();

type ZodSchema = typeof createJobSchema | typeof updateJobSchema;

export const validateZod =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = { ...(req.body || {}) };
      schema.parse(data);
      req.body = data;
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
