"use client";

import { useLocationForm } from "@location-state/react-hook-form";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";

type FormValues = {
  leaderId: string;
  engineerIds: string[];
  members: Array<{
    name: string;
  }>;
};

export function Form() {
  const { register, control, handleSubmit, reset, getValues } =
    useForm<FormValues>();
  const { fields, append } = useFieldArray({
    control,
    name: "members",
  });

  const { handleChange } = useLocationForm({
    name: "my-form",
    reset,
    getValues,
  });

  const router = useRouter();
  const onSubmit = (data: FormValues) => {
    console.log(data);
    router.push(
      `/success?members=${JSON.stringify(data.members)}&leaderId=${
        data.leaderId
      }&engineerIds=${JSON.stringify(data.engineerIds)}`,
    );
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} onChange={handleChange()}>
        <button type="button" onClick={() => append({ name: "" })}>
          append
        </button>
        <ul>
          {fields.map((field, index) => (
            <li key={field.id}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <label>
                  name:&nbsp;
                  <input type="text" {...register(`members.${index}.name`)} />
                </label>
                <label>
                  leader:&nbsp;
                  <input type="radio" {...register("leaderId")} value={index} />
                </label>
                <label>
                  engineer:&nbsp;
                  <input
                    type="checkbox"
                    {...register("engineerIds")}
                    value={index}
                  />
                </label>
              </div>
            </li>
          ))}
        </ul>
        {/* todo: insert */}
        {/* todo: swap */}
        {/* todo: remove */}
        <button>submit</button>
      </form>
    </>
  );
}
