import { z } from "zod";

export const User = z.object({
  firstName: z
    .string({
      error: (issue) =>
        issue.input === undefined ? "First name is required" : "Not a string",
    })
    .min(1)
    .max(100),
  lastName: z
    .string({
      error: (issue) =>
        issue.input === undefined ? "Last name is required" : "Not a string",
    })
    .min(1)
    .max(100),
});

export type User = z.infer<typeof User>;
