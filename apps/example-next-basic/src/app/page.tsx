import { Counter } from "@/components/Counter";
import { List } from "@/components/List";
import Link from "next/link";

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
        <li>
          <Link href="/pages">/pages</Link>
        </li>
      </ul>
      <Counter storeName="session" />
      <Counter storeName="url" />
      <List storeName="session" />
      <List storeName="url" />
    </main>
  );
}
