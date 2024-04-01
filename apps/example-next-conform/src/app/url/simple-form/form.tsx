"use client";

import { parseWithZod } from "@conform-to/zod";
import { useFormState } from "react-dom";
import { getInputProps, useLocationForm } from "../../../lib/use-location-form";
import { saveUser } from "./action";
import { userSchema } from "./schema";

export default function Form() {
  const [lastResult, action] = useFormState(saveUser, undefined);
  const [form, fields, getLocationFormProps] = useLocationForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: userSchema });
    },
    shouldValidate: "onBlur",
    location: {
      name: "simple-form",
      storeName: "url",
    },
  });

  return (
    <form {...getLocationFormProps()} action={action} noValidate>
      <div>
        <label htmlFor={fields.firstName.id}>First name</label>
        <input
          {...getInputProps(fields.firstName, {
            type: "text",
          })}
          key={undefined}
        />
        <div>{fields.firstName.errors}</div>
      </div>
      <div>
        <label htmlFor={fields.lastName.id}>Last name</label>
        <input
          {...getInputProps(fields.lastName, {
            type: "text",
          })}
          key={undefined}
        />
        <div>{fields.lastName.errors}</div>
      </div>
      <button type="submit">Submit</button>
    </form>
  );
}
