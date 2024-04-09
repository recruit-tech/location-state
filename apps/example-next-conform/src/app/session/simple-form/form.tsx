"use client";

import { getInputProps, useForm } from "@conform-to/react";
import { useLocationForm } from "../../../lib/use-location-form";

export default function Form() {
  const [formOptions, getLocationFormProps] = useLocationForm({
    location: {
      name: "simple-form",
      storeName: "session",
    },
  });
  const [form, fields] = useForm<{
    firstName: string;
    lastName: string;
  }>({
    onSubmit(e, { formData }) {
      console.log(Object.fromEntries(formData.entries()));
      e.preventDefault();
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
    </form>
  );
}
