import Link from "next/link";
import { Counter } from "@/components/counter";
import { List } from "@/components/list";

export default function Page() {
  return (
    <main>
      <h1>Static page</h1>
      <Link href="/">/(top)</Link>
      <Counter storeName="url" />
      <Counter storeName="shortSession" />
      <Counter storeName="longSession" />
      <List storeName="url" />
      <List storeName="shortSession" />
      <List storeName="longSession" />
    </main>
  );
}
