"use server";

import { parseWithZod } from "@conform-to/zod";
import { redirect } from "next/navigation";
import { searchSchema } from "./schema";

export async function search(formData: FormData) {
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
