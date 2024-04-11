"use client";

import { getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useFormState } from "react-dom";
import { useLocationForm } from "../../../lib/use-location-form";
import { saveUser } from "./action";
import { UserSchema } from "./schema";

export default function Form() {
  const [lastResult, action] = useFormState(saveUser, undefined);
  const [formOptions, getLocationFormProps] = useLocationForm({
    location: {
      name: "static-form",
      storeName: "url",
    },
  });
  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: UserSchema });
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
          key={fields.lastName.key}
        />
        <div>{fields.lastName.errors}</div>
      </div>
      <button type="submit">Submit</button>
      <div>
        <h2>form intent</h2>
        <ul>
          <li>
            <button
              type="submit"
              {...form.update.getButtonProps({
                name: fields.firstName.name,
                value: "hoge",
              })}
            >
              Update Firstname
            </button>
          </li>
          <li>
            <button
              type="submit"
              {...form.reset.getButtonProps({ name: fields.firstName.name })}
            >
              Reset Firstname
            </button>
          </li>
          <li>
            <button type="submit" {...form.reset.getButtonProps()}>
              Reset
            </button>
          </li>
        </ul>
      </div>
    </form>
  );
}
