import type { Request } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import type { ParsedQs } from "qs";
import type { Session, SessionData } from "express-session";

export interface SessionRequest<
  Params = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = ParsedQs,
> extends Request<Params, ResBody, ReqBody, ReqQuery> {
  session: (Session & Partial<SessionData>) & { userId?: string };
}
