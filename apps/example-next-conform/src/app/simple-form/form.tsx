"use client";

import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useFormState } from "react-dom";
import { saveUser } from "./action";
import { userSchema } from "./schema";

export default function Form() {
  const [lastResult, action] = useFormState(saveUser, undefined);
  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: userSchema });
    },
    shouldValidate: "onBlur",
  });

  return (
    <form {...getFormProps(form)} action={action} noValidate>
      <div>
        <label htmlFor={fields.firstName.id}>First name</label>
        <input
          {...getInputProps(fields.firstName, {
            type: "text",
          })}
        />
        <div>{fields.firstName.errors}</div>
      </div>
      <div>
        <label htmlFor={fields.lastName.id}>Last name</label>
        <input
          {...getInputProps(fields.lastName, {
            type: "text",
          })}
        />
        <div>{fields.lastName.errors}</div>
      </div>
      <button type="submit">Submit</button>
    </form>
  );
}
