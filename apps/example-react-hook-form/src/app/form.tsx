"use client";

import { useLocationForm } from "@location-state/react-hook-form";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

type FormValues = {
  firstName: string;
  lastName: string;
};

export function Form() {
  const { register, handleSubmit, reset, getValues } = useForm<FormValues>({
    defaultValues: {
      firstName: "John",
      lastName: "Doe",
    },
  });
  const { handleChange } = useLocationForm({
    name: "my-form",
    reset,
    getValues,
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
      <form onSubmit={handleSubmit(onSubmit)} onChange={handleChange()}>
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
