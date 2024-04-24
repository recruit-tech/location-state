import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { Counter } from "~/components/counter";
import { List } from "~/components/list";

export const meta: MetaFunction = () => {
  return [{ title: "Top page" }];
};

export default function IndexPage() {
  return (
    <main>
      <h1>Top page</h1>
      <p style={{ color: "red", fontWeight: "bold" }}>
        todo: not restored on browser back. fixme.
      </p>
      <ul>
        <li>
          <Link to="/child">/child</Link>
        </li>
      </ul>
      <Counter storeName="session" />
      <Counter storeName="url" />
      <List storeName="session" />
      <List storeName="url" />
    </main>
  );
}
