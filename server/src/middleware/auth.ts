import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { User, UserDoc } from "../models/User.js";

export interface AuthedRequest extends Request {
  user?: UserDoc;
}

export async function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }
  try {
    const payload = jwt.verify(token, config.jwtSecret) as { sub: string };
    // Hit the DB each request so deactivation/role changes apply immediately
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ error: "Account not found" });
    if (user.isActive === false) {
      return res.status(403).json({ error: "Account is deactivated" });
    }
    req.user = user as UserDoc;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired session" });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}
