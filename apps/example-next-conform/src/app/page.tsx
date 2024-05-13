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
          <Link href="/forms/session/simple-form">
            /forms/session/simple-form
          </Link>
        </li>
        <li>
          <Link href="/forms/session/static-form">
            /forms/session/static-form
          </Link>
        </li>
        <li>
          <Link href="/forms/session/dynamic-form">
            /forms/session/dynamic-form
          </Link>
        </li>
        <li>
          <Link href="/forms/url/simple-form">/forms/url/simple-form</Link>
        </li>
        <li>
          <Link href="/forms/url/static-form">/forms/url/static-form</Link>
        </li>
        <li>
          <Link href="/forms/url/dynamic-form">/forms/url/dynamic-form</Link>
        </li>
      </ul>
    </main>
  );
}
