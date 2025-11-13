// src/middleware/verifyToken.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY!);
    const user = await prisma.users.findUnique({
      where: { id: (decoded as any).id },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    (req as any).user = user;
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid token" });
  }
};
