import { Counter } from "@/components/Counter";
import { List } from "@/components/List";
import Link from "next/link";

export default function Page() {
  return (
    <div>
      <h1>Page</h1>
      <ul>
        <li>
          <Link href="/pages/other">/pages/other</Link>
        </li>
        <li>
          <Link href="/pages/ssr/1">/pages/ssr/1</Link>
        </li>
        <li>
          <Link href="/pages/ssg/1">/pages/ssg/1</Link>
        </li>
      </ul>
      <Counter storeName="session" />
      <Counter storeName="url" />
      <List storeName="session" />
      <List storeName="url" />
    </div>
  );
}
