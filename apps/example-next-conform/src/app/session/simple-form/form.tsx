"use client";

import { getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useFormState } from "react-dom";
import { useLocationForm } from "../../../lib/use-location-form";
import { saveUser } from "./action";
import { userSchema } from "./schema";

export default function Form() {
  const [lastResult, action] = useFormState(saveUser, undefined);
  const [formOptions, getLocationFormProps] = useLocationForm({
    location: {
      name: "simple-form",
      storeName: "session",
    },
  });
  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: userSchema });
    },
    ...formOptions,
  });

  return (
    <form {...getLocationFormProps(form)} action={action} noValidate>
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
