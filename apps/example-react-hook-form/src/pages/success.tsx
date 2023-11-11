import { useRouter } from "next/router";

export default function Success() {
  const router = useRouter();

  return (
    <main>
      <h1>Success!</h1>
      <code>
        <pre>{JSON.stringify(router.query, null, 2)}</pre>
      </code>
    </main>
  );
}
