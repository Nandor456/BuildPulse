import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";

type ParsedRequestField = "body" | "query" | "params";

const setParsedRequestField = (
  req: Request,
  field: ParsedRequestField,
  value: unknown,
) => {
  try {
    (req as Request & Record<ParsedRequestField, unknown>)[field] = value;
    return;
  } catch (error) {
    if (!(error instanceof TypeError)) {
      throw error;
    }
  }

  Object.defineProperty(req, field, {
    configurable: true,
    enumerable: true,
    writable: true,
    value,
  });
};

export const validate = (schema: ZodSchema<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    if (!result.success) {
      const flattened = result.error.flatten();
      const firstFieldError = Object.values(flattened.fieldErrors)
        .flat()
        .find((message): message is string => Boolean(message));
      const message =
        flattened.formErrors[0] ??
        firstFieldError ??
        "Invalid request payload.";

      return res.status(400).json({
        error: message,
        errors: flattened,
      });
    }
    // Replace req.* with parsed/coerced/defaulted values when present
    if (result.data.body !== undefined) {
      setParsedRequestField(req, "body", result.data.body);
    }
    if (result.data.query !== undefined) {
      setParsedRequestField(req, "query", result.data.query);
    }
    if (result.data.params !== undefined) {
      setParsedRequestField(req, "params", result.data.params);
    }
    next();
  };
