import { z } from "zod";

export const Team = z.object({
  leaderId: z.string({
    error: (issue) =>
      issue.input === undefined ? "Leader is required" : "Not a string",
  }),
  members: z.array(
    z.object({
      id: z.string().min(1),
      name: z
        .string({
          error: (issue) =>
            issue.input === undefined ? "Name is required" : "Not a string",
        })
        .min(1)
        .max(100),
      engineer: z.boolean().optional(),
      numbers: z.array(z.number()),
    }),
  ),
});

export type Team = z.infer<typeof Team>;
