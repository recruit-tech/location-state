import Link from "next/link";
import { Counter } from "@/components/counter";
import { List } from "@/components/list";

export default function Page() {
  return (
    <main>
      <h1>Static page</h1>
      <Link href="/">/(top)</Link>
      <Counter storeName="url" />
      <Counter storeName="session" />
      <List storeName="url" />
      <List storeName="session" />
    </main>
  );
}
