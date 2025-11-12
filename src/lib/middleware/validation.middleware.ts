import { Request, Response, NextFunction } from "express";
import { AnySchema } from "yup";

export const validate =
  (schema: AnySchema, source: "body" | "params" | "query" = "body") =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validate(req[source], { abortEarly: false });
      next();
    } catch (err: any) {
      const errors = err.errors || ["Validation failed"];
      res.status(400).json({ message: "Validation error", errors });
    }
  };
