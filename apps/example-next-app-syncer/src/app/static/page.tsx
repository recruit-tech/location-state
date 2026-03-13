import Link from "next/link";
import { Counter } from "@/components/counter";
import { List } from "@/components/list";

export default function Page() {
  return (
    <main>
      <h1>Static page</h1>
      <Link href="/">/(top)</Link>
      <Counter storeName="session" />
      <Counter storeName="url" />
      <List storeName="session" />
      <List storeName="url" />
    </main>
  );
}
