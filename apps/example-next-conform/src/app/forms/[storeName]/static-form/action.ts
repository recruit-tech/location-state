"use server";

import { parseWithZod } from "@conform-to/zod";
import { redirect } from "next/navigation";
import { User } from "./schema";

export async function saveUser(prevState: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: User,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  console.log("submit data", submission.value);

  redirect("/success");
}
