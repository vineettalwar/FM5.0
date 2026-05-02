import { type Request, type Response, type NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

const SESSION_COOKIE = "firemud_sid";
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60 * 1000; // 1 year

/**
 * Lightweight cookie-based anonymous session middleware.
 * Sets req.sessionId to a stable UUID stored in a cookie.
 * No external session store needed.
 */
export function sessionMiddleware(req: Request, res: Response, next: NextFunction) {
  let sessionId = req.cookies?.[SESSION_COOKIE] as string | undefined;

  if (!sessionId) {
    sessionId = uuidv4();
    res.cookie(SESSION_COOKIE, sessionId, {
      maxAge: COOKIE_MAX_AGE,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  (req as any).sessionId = sessionId;
  next();
}
