import { Metadata } from "next";
import Head from "next/head";
import { Form } from "./form";

export const metadata: Metadata = {
  title: "simple form",
};

export default function Home() {
  return (
    <>
      <Head>
        <title>simple form</title>
      </Head>
      <main>
        <h1>simple form example</h1>
        <Form />
      </main>
    </>
  );
}
