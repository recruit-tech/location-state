import Link from "next/link";
import { Counter } from "@/components/Counter";
import { List } from "@/components/List";

export default function Page() {
  return (
    <main>
      <h1>Top page</h1>
      <ul>
        <li>
          <Link href="/static">/static</Link>
        </li>
        <li>
          <Link href="/dynamic">/dynamic</Link>
        </li>
      </ul>
      <Counter storeName="url" />
      <Counter storeName="session" />
      <List storeName="url" />
      <List storeName="session" />
    </main>
  );
}
