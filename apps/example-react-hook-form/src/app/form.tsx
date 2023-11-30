"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

type FormValues = {
  firstName: string;
  lastName: string;
};

export function Form() {
  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      firstName: "John",
      lastName: "Doe",
    },
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
      <form onSubmit={handleSubmit(onSubmit)}>
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
