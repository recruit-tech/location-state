"use client";

import { getInputProps, parse, useForm } from "@conform-to/react";
import { useRouter } from "next/navigation";
import { useLocationForm } from "../../../lib/use-location-form";

type FormFields = {
  firstName: string;
  lastName: string;
};

export default function Form() {
  const router = useRouter();
  const [formOptions, getLocationFormProps] = useLocationForm({
    location: {
      name: "simple-form",
      storeName: "url",
    },
  });
  const [form, fields] = useForm<FormFields>({
    onValidate: ({ formData }) =>
      parse(formData, {
        resolve: (value) =>
          ({ value }) as {
            value: FormFields;
          },
      }),
    onSubmit(e, { formData }) {
      console.log(Object.fromEntries(formData.entries()));
      e.preventDefault();
      router.push("/success");
    },
    ...formOptions,
  });

  return (
    <form {...getLocationFormProps(form)} noValidate>
      <div>
        <label htmlFor={fields.firstName.id}>First name</label>
        <input
          {...getInputProps(fields.firstName, {
            type: "text",
          })}
          key={fields.firstName.key}
        />
        <div>{fields.firstName.errors}</div>
      </div>
      <div>
        <label htmlFor={fields.lastName.id}>Last name</label>
        <input
          {...getInputProps(fields.lastName, {
            type: "text",
          })}
          key={fields.firstName.key}
        />
        <div>{fields.lastName.errors}</div>
      </div>
      <button type="submit">Submit</button>
      <h2>form intent</h2>
      <div style={{ display: "flex", columnGap: "10px" }}>
        <button
          type="submit"
          {...form.update.getButtonProps({
            name: fields.firstName.name,
            value: "hoge",
          })}
        >
          Update Firstname
        </button>
        <button
          type="submit"
          {...form.reset.getButtonProps({ name: fields.firstName.name })}
        >
          Reset Firstname
        </button>
        <button type="submit" {...form.reset.getButtonProps()}>
          Reset
        </button>
      </div>
    </form>
  );
}
