import { Request, Response, NextFunction } from "express";
import { AnySchema, ValidationError } from "yup";

interface ValidationErrorItem {
  field: string;
  message: string;
}

export const validate =
  (
    schema: AnySchema,
    source: "body" | "params" | "query" = "body",
    options?: { fileField?: string }
  ) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = await schema.validate(req[source], {
        abortEarly: false,
        stripUnknown: source !== "query",
      });

      // -----------------------------
      // EXPRESS 5 FIX
      // Jangan utak-atik req.query!!
      // Simpan hasil validasi di property baru
      // -----------------------------
      if (source === "query") {
        (req as any).validatedQuery = validated;
      } else {
        (req as any)[source] = validated;
      }
      // -----------------------------

      // File validation
      if (options?.fileField) {
        const file = (req as any).file;
        if (!file?.path) {
          res.status(400).json({
            message: "Validation error",
            errors: [
              {
                field: options.fileField,
                message: `${options.fileField} file is required`,
              },
            ],
          });
          return;
        }
      }

      next();
    } catch (err: any) {
      if (err instanceof ValidationError) {
        const errors: ValidationErrorItem[] =
          err.inner.length > 0
            ? err.inner.map((e) => ({
                field: e.path || "",
                message: e.message,
              }))
            : [
                {
                  field: err.path || "",
                  message: err.message,
                },
              ];

        res.status(400).json({
          message: "Validation error",
          errors,
        });
        return;
      }

      res.status(400).json({
        message: "Validation error",
        errors: [
          {
            field: "unknown",
            message: err?.message || "Validation failed",
          },
        ],
      });
    }
  };
