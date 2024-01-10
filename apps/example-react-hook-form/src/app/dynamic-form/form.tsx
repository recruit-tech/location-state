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

const createNewItem = () => ({ name: "" });

export function Form() {
  const { register, control, handleSubmit, reset, getValues } =
    useForm<FormValues>();
  const { fields, append, insert, swap, remove } = useFieldArray({
    control,
    name: "members",
  });

  const { handleChange, withSave } = useLocationForm({
    name: "my-form",
    reset,
    getValues,
  });

  const router = useRouter();
  const onSubmit = (data: FormValues) => {
    router.push(
      `/success?members=${JSON.stringify(data.members)}&leaderId=${
        data.leaderId
      }&engineerIds=${JSON.stringify(data.engineerIds)}`,
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} onChange={handleChange()}>
      <button type="button" onClick={withSave(() => append(createNewItem()))}>
        append
      </button>
      <ul
        style={{
          display: "flex",
          flexDirection: "column",
          rowGap: "30px",
        }}
      >
        {fields.map((field, index) => (
          <li
            key={field.id}
            style={{
              display: "flex",
              columnGap: "20px",
            }}
          >
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
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                rowGap: "10px",
              }}
            >
              <button
                type="button"
                onClick={withSave(() => insert(index, createNewItem()))}
              >
                insert before
              </button>
              <button
                type="button"
                onClick={withSave(() => swap(index, index + 1))}
              >
                swap before
              </button>
              <button type="button" onClick={withSave(() => remove(index))}>
                remove
              </button>
            </div>
          </li>
        ))}
      </ul>
      <button>submit</button>
    </form>
  );
}
