import { z } from "zod";

export const Team = z.object({
  leaderId: z.string({
    required_error: "Leader is required",
  }),
  members: z.array(
    z.object({
      id: z.string().min(1),
      name: z
        .string({
          required_error: "Name is required",
        })
        .min(1)
        .max(100),
      engineer: z.boolean().optional(),
      numbers: z.array(z.number()),
    }),
  ),
});

export type Team = z.infer<typeof Team>;
