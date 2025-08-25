import { headers } from "next/headers";
import Link from "next/link";
import { Counter } from "@/components/counter";
import { List } from "@/components/list";

export default async function Page() {
  const headersList = await headers();
  const referer = headersList.get("referer");

  return (
    <main>
      <h1>Dynamic page</h1>
      <Link href="/">/(top)</Link>
      <p>referer: {referer}</p>
      <Counter storeName="url" />
      <Counter storeName="shortSession" />
      <Counter storeName="longSession" />
      <List storeName="url" />
      <List storeName="shortSession" />
      <List storeName="longSession" />
    </main>
  );
}
