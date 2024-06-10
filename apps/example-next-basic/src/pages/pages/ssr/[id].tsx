import { setTimeout } from "node:timers/promises";
import { Counter } from "@/components/Counter";
import { List } from "@/components/List";
import type { GetServerSideProps } from "next";
import Link from "next/link";

type Props = {
  id: number;
};

export default function Page({ id }: Props) {
  const nextUrl = `/pages/ssr/${id + 1}`;
  return (
    <div>
      <h1>SSR Page</h1>
      <p>id: {id}</p>
      <p>
        <Link href="/pages">/pages</Link>
      </p>
      <p>
        <Link href={nextUrl}>{nextUrl}</Link>
      </p>
      <Counter storeName="session" />
      <Counter storeName="url" />
      <List storeName="session" />
      <List storeName="url" />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<
  Props,
  { id: string }
> = async ({ params }) => {
  await setTimeout(1000);
  return {
    props: {
      id: Number(params?.id),
    },
  };
};
