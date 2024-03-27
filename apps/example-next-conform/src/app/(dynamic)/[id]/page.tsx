import Link from "next/link";

export default function Page({ params }: { params: { id: string } }) {
  return (
    <main>
      <h1>Dynamic Route Form(useForm with layout testing)</h1>
      <Link href={`/${Number(params.id) + 1}`}>next page</Link>
    </main>
  );
}
