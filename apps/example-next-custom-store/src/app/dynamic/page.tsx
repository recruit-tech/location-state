import { Counter } from "@/components/Counter";
import { List } from "@/components/List";
import { headers } from "next/headers";
import Link from "next/link";

export default async function Page() {
  const headersList = await headers();
  const referer = headersList.get("referer");

  return (
    <main>
      <h1>Dynamic page</h1>
      <Link href="/">/(top)</Link>
      <p>referer: {referer}</p>
      <Counter />
      <List />
    </main>
  );
}
