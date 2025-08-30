import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

const WORKER_JWT_SECRET = process.env.WORKER_JWT_SECRET || "";

export const workerAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.header("authorization") || "";

  try {
    const decoded = jwt.verify(authHeader, WORKER_JWT_SECRET) as JwtPayload;

    if (decoded.workerId) {
      // @ts-ignore
      req.workerId = decoded.workerId;
      return next();
    } else {
      return res.status(403).json({ error: "Not logged in", status: false });
    }
  } catch (error) {
    return res.status(403).json({ error, status: false });
  }
};
