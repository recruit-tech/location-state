import { Metadata } from "next";
import Head from "next/head";
import { Form } from "./form";

export const metadata: Metadata = {
  title: "dynamic form",
};

export default function Home() {
  return (
    <>
      <Head>
        <title>dynamic form</title>
      </Head>
      <main>
        <h1>dynamic form example</h1>
        <Form />
      </main>
    </>
  );
}
