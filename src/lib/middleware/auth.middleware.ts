import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import prisma from "../../lib/config/prisma";

const JWT_SECRET = process.env.JWT_SECRET_KEY;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET_KEY is not defined in .env");
}

interface DecodedUser extends JwtPayload {
  id: string;
  email: string;
  role: string;
  company_id?: number;
}

interface AuthenticatedRequest extends Request {
  user?: DecodedUser;
}

export const authMiddleware = (roles?: string[]): RequestHandler => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Unauthorized: No or invalid token" });
        return;
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET) as DecodedUser;

      req.user = decoded;

      if (roles && !roles.includes(decoded.role)) {
        res
          .status(403)
          .json({ error: "Forbidden: Access denied for this role" });
        return;
      }

      if (decoded.role === "COMPANY_ADMIN") {
        const companyAdmin = await prisma.companyAdmins.findFirst({
          where: { user_id: decoded.id },
        });

        if (!companyAdmin) {
          res.status(403).json({ error: "User is not linked to any company" });
          return;
        }

        req.user.company_id = companyAdmin.company_id;
      }

      next();
    } catch (err: any) {
      console.error("Auth Middleware Error:", err.message);
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }
  };
};
