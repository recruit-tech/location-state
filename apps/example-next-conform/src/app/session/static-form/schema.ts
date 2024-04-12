import { z } from "zod";

export const User = z.object({
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

export type User = z.infer<typeof User>;
