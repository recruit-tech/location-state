"use client";

import { getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useLocationForm } from "@location-state/conform";
import { useFormState } from "react-dom";
import { saveUser } from "./action";
import { User } from "./schema";

export default function Form({ storeName }: { storeName: "session" | "url" }) {
  const [lastResult, action] = useFormState(saveUser, undefined);
  const [formOptions, getLocationFormProps] = useLocationForm({
    location: {
      name: "static-form",
      storeName,
    },
  });
  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: User });
    },
    ...formOptions,
  });

  return (
    <form {...getLocationFormProps(form)} action={action} noValidate>
      <div style={{ display: "flex", columnGap: "10px" }}>
        <label htmlFor={fields.firstName.id}>First name</label>
        <input
          {...getInputProps(fields.firstName, {
            type: "text",
          })}
          key={fields.firstName.key}
        />
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
        </div>
        <div>{fields.firstName.errors}</div>
      </div>
      <div style={{ display: "flex", columnGap: "10px", marginTop: "10px" }}>
        <label htmlFor={fields.lastName.id}>Last name</label>
        <input
          {...getInputProps(fields.lastName, {
            type: "text",
          })}
          key={fields.firstName.key}
        />
        <div style={{ display: "flex", columnGap: "10px" }}>
          <button
            type="submit"
            {...form.update.getButtonProps({
              name: fields.lastName.name,
              value: "fuga",
            })}
          >
            Update Lastname
          </button>
          <button
            type="submit"
            {...form.reset.getButtonProps({ name: fields.lastName.name })}
          >
            Reset Lastname
          </button>
        </div>
        <div>{fields.lastName.errors}</div>
      </div>
      <div style={{ display: "flex", columnGap: "10px" }}>
        <button type="submit">submit</button>
        <button type="submit" {...form.reset.getButtonProps()}>
          Reset
        </button>
      </div>
    </form>
  );
}
