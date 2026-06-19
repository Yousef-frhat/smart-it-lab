/**
 * Express middleware factory for Zod schema validation.
 *
 * Usage:
 *   import { z } from "zod";
 *   const schema = z.object({ email: z.string().email() });
 *   router.post("/login", validate(schema), loginController);
 *
 * By default the request body is validated.
 * Pass a second argument to validate query or params:
 *   validate(schema, "query")
 *   validate(schema, "params")
 */
export const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors,
      });
    }

    // Replace source data with the parsed (and potentially transformed) value
    req[source] = result.data;
    next();
  };
};
