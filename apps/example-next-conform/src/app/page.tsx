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
          <Link href="/session/simple-form">/session/simple-form</Link>
        </li>
        <li>
          <Link href="/session/static-form">/session/static-form</Link>
        </li>
        <li>
          <Link href="/session/dynamic-form">/session/dynamic-form</Link>
        </li>
        <li>
          <Link href="/url/simple-form">/url/simple-form</Link>
        </li>
        <li>
          <Link href="/url/static-form">/url/static-form</Link>
        </li>
        <li>
          <Link href="/url/dynamic-form">/url/dynamic-form</Link>
        </li>
      </ul>
    </main>
  );
}
