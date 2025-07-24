import Link from "next/link";
import { Counter } from "@/components/Counter";
import { List } from "@/components/List";

export default function Page() {
  return (
    <div>
      <h1>Other Page</h1>
      <p>
        <Link href="/pages">/pages</Link>
      </p>
      <Counter storeName="session" />
      <Counter storeName="url" />
      <List storeName="session" />
      <List storeName="url" />
    </div>
  );
}
