"use server";

import { parseWithZod } from "@conform-to/zod";
import { revalidatePath } from "next/cache";
import { searchSchema } from "./schema";
import { redirect } from "next/navigation";

export async function search(_prevState: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: searchSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const params = new URLSearchParams();
  if (submission.value.title) {
    params.set("title", submission.value.title);
  }
  if (submission.value.news) {
    params.set("news", "true");
  }
  if (submission.value.tech) {
    params.set("tech", "true");
  }

  if (params.size === 0) {
    return redirect("/search-form");
  }

  redirect(`/search-form?${params.toString()}`);
}
