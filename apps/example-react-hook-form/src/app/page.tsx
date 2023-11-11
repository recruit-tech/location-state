import Head from "next/head";
import { Form } from "./form";

export default function Home() {
  return (
    <>
      <Head>
        <title>`react-hook-form` example</title>
      </Head>
      <main>
        <h1>`react-hook-form` example</h1>
        <Form />
      </main>
    </>
  );
}
