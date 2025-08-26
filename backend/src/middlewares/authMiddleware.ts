import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.header("authorization") || "";

  try {
    const decoded = jwt.verify(authHeader, JWT_SECRET) as JwtPayload;

    if (decoded.userId) {
      // @ts-ignore
      req.userId = decoded.userId;
      return next();
    } else {
      return res.status(403).json({ error: "Not logged in", status: false });
    }
  } catch (error) {
    return res.status(403).json({ error, status: false });
  }
};
