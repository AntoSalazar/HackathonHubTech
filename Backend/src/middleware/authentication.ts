import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";

dotenv.config();
const { JWT_SECRET = "your_default_secret_key" } = process.env;

// Extend Express Request interface to include currentUser
declare global {
  namespace Express {
    interface Request {
      currentUser?: any;
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }
  
  const token = header.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: Token format invalid" });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.currentUser = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};