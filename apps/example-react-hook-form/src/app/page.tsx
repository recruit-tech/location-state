import Head from "next/head";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "`react-hook-form` example",
};

export default function Home() {
  return (
    <>
      <Head>
        <title>`react-hook-form` example</title>
      </Head>
      <main>
        <h1>`react-hook-form` example</h1>
        <ul>
          <li>
            <Link href="/simple-form">simple-form</Link>
          </li>
          <li>
            <Link href="/dynamic-form">dynamic-form</Link>
          </li>
        </ul>
      </main>
    </>
  );
}
