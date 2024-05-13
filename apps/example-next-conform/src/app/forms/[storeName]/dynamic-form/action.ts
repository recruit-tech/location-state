"use server";

import { parseWithZod } from "@conform-to/zod";
import { redirect } from "next/navigation";
import { Team } from "./schema";

export async function saveTeam(prevState: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: Team,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  console.log("submit data", submission.value);

  redirect("/success");
}
