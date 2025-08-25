import type { GetServerSideProps, GetStaticPaths } from "next";
import Link from "next/link";
import { Counter } from "@/components/counter";
import { List } from "@/components/list";

type Props = {
  id: number;
};

export default function Page({ id }: Props) {
  const nextUrl = `/pages/ssg/${id + 1}`;
  return (
    <div>
      <h1>SSG Page</h1>
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

export const getStaticPaths: GetStaticPaths<{ id: string }> = async () => {
  return {
    paths: Array.from({ length: 10 }, (_, i) => ({
      params: { id: String(i) },
    })),
    fallback: false,
  };
};

export const getStaticProps: GetServerSideProps<
  Props,
  { id: string }
> = async ({ params }) => {
  return {
    props: {
      id: Number(params?.id),
    },
  };
};
