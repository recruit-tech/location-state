import { z } from "zod";

export const searchSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  news: z.preprocess((value) => !!value, z.boolean()),
  tech: z.preprocess((value) => !!value, z.boolean()),
});

export type SearchParams = z.infer<typeof searchSchema>;
