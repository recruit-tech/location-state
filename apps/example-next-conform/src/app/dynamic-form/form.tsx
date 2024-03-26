"use client";

import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useFormState } from "react-dom";
import { saveTeam } from "./action";
import { teamSchema } from "./schema";

export default function Form() {
  const [lastResult, action] = useFormState(saveTeam, undefined);
  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: teamSchema });
    },
    shouldValidate: "onBlur",
  });
  const members = fields.members.getFieldList();

  return (
    <form {...getFormProps(form)} action={action} noValidate>
      <button
        type="submit"
        {...form.insert.getButtonProps({
          name: fields.members.name,
        })}
      >
        Add member
      </button>
      {members.map((member, index) => {
        const memberFields = member.getFieldset();

        return (
          <div key={member.key}>
            <div>Member {index + 1}</div>
            <input type="hidden" name={memberFields.id.name} value={index} />
            <label htmlFor={memberFields.name.id}>
              name:&nbsp;
              <input name={memberFields.name.name} />
            </label>
            <label>
              leader:&nbsp;
              <input
                {...getInputProps(fields.leaderId, {
                  type: "radio",
                  value: index.toString(),
                })}
              />
            </label>
            <label>
              engineer:&nbsp;
              <input name={memberFields.engineer.name} type="checkbox" />
            </label>
            <button
              type="submit"
              {...form.remove.getButtonProps({
                name: fields.members.name,
                index,
              })}
            >
              Remove
            </button>
            <div>{memberFields.name.errors?.join(", ")}</div>
            <div>{memberFields.engineer.errors?.join(", ")}</div>
          </div>
        );
      })}
      <button type="submit">submit</button>
    </form>
  );
}
