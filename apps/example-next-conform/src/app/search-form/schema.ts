import { z } from "zod";

export const searchSchema = z.object({
  title: z.string().max(100).optional(),
  news: z.preprocess((value) => !!value, z.boolean()).optional(),
  tech: z.preprocess((value) => !!value, z.boolean()).optional(),
});

export type SearchParams = z.infer<typeof searchSchema>;
