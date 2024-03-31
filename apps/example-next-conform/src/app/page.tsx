import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "`conform` example",
};

export default function Home() {
  return (
    <main>
      <h1>`conform` example</h1>
      <ul>
        <li>
          <Link href="/simple-form">simple-form</Link>
        </li>
        <li>
          <Link href="/dynamic-form">dynamic-form</Link>
        </li>
        <li>
          <Link href="/search-form">search-form</Link>
        </li>
      </ul>
    </main>
  );
}
