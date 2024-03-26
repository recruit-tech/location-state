import { z } from "zod";

export const userSchema = z.object({
  firstName: z
    .string({
      required_error: "`First name` is required",
    })
    .min(1)
    .max(100),
  lastName: z
    .string({
      required_error: "`Last name` is required",
    })
    .min(1)
    .max(100),
});
