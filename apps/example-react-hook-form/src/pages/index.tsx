import Head from "next/head";
import { useRouter } from "next/router";
import { useFromSync } from "@location-state/react-hook-form";

type Form = {
  firstName: string;
  lastName: string;
};

export default function Home() {
  const { register, handleSubmit, onFormChange } = useFromSync({
    name: "my-form",
    defaultValue: {
      firstName: "John",
      lastName: "Doe",
    },
    storeName: "session",
  });
  const router = useRouter();
  const onSubmit = async (data: Form) => {
    await router.push(
      `/success?firstName=${data.firstName}&lastName=${data.lastName}`,
    );
  };

  return (
    <>
      <Head>
        <title>`react-hook-form` example</title>
      </Head>
      <main>
        <h1>`react-hook-form` example</h1>
        <h2>My form</h2>
        <form onSubmit={handleSubmit(onSubmit)} onChange={onFormChange}>
          <div>
            <label>
              first name:&nbsp;
              <input type="text" {...register("firstName")} />
            </label>
          </div>
          <div>
            <label>
              last name:&nbsp;
              <input type="text" {...register("lastName")} />
            </label>
          </div>
          <button>submit</button>
        </form>
      </main>
    </>
  );
}
