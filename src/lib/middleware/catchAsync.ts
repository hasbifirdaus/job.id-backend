import { Request, Response, NextFunction } from "express";

// Definisi Request Handler yang Asinkron
type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

/**
 * Middleware wrapper untuk menangani Promise yang dilempar oleh Controller asinkron.
 * Ini memastikan error apa pun dari controller asinkron akan diteruskan ke
 * error handler Express.
 */
export const catchAsync = (fn: AsyncRequestHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Jalankan fungsi controller dan tangkap error jika ada
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
