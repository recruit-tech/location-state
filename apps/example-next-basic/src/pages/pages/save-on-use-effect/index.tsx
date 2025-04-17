import { useLocationState } from "@location-state/core";
import type { GetServerSideProps } from "next";
import Link from "next/link";
import { useEffect } from "react";

type Props = {
  id: number;
};

export default function Page({ id }: Props) {
  const [randomValue, setRandomValue] = useLocationState<null | number>({
    name: "randomValue",
    defaultValue: null,
    storeName: "session",
  });

  useEffect(() => {
    if (randomValue === null) {
      setRandomValue(id);
      console.debug("set randomValue: ", id);
    }
  }, [randomValue, setRandomValue, id]);

  return (
    <div>
      <h1>Save on `useEffect()`, random value: {randomValue}</h1>
      <ul>
        <li>
          <Link href="/pages">/pages</Link>
        </li>
        <li>
          <Link href="/pages/other">/pages/other</Link>
        </li>
      </ul>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<
  Props,
  { id: string }
> = async () => {
  return {
    props: {
      id: Math.floor(Math.random() * 100),
    },
  };
};
