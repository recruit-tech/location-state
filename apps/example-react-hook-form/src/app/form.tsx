"use client";

import { useRouter } from "next/navigation";
import { useFromSync } from "@location-state/react-hook-form";

type FormValues = {
  firstName: string;
  lastName: string;
};

export function Form() {
  const { register, handleSubmit, onFormChange } = useFromSync({
    name: "my-form",
    defaultValue: {
      firstName: "John",
      lastName: "Doe",
    },
    storeName: "session",
  });
  const router = useRouter();
  const onSubmit = (data: FormValues) => {
    router.push(
      `/success?firstName=${data.firstName}&lastName=${data.lastName}`,
    );
  };

  return (
    <>
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
    </>
  );
}
