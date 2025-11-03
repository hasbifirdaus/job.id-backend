import { Request, Response } from "express";
import { registerService, loginService } from "../auth/auth.service";

export const register = async (req: Request, res: Response) => {
  try {
    const user = await registerService(req.body);
    res.status(201).json({ message: "User registered successfully", user });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const token = await loginService(req.body);
    res.status(200).json({ message: "Login successfull", token });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
