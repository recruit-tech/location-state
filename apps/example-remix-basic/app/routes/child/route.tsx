import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { Counter } from "~/components/counter";
import { List } from "~/components/list";

export const meta: MetaFunction = () => {
  return [{ title: "Child page" }];
};

export default function ChildPage() {
  return (
    <main>
      <h1>Child page</h1>
      <ul>
        <li>
          <Link to="/">top page</Link>
        </li>
      </ul>
      <Counter storeName="session" />
      <Counter storeName="url" />
      <List storeName="session" />
      <List storeName="url" />
    </main>
  );
}
