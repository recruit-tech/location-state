"use client";

import { getInputProps } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useFormState } from "react-dom";
import { useLocationForm } from "../../lib/use-location-form";
import { saveTeam } from "./action";
import { teamSchema } from "./schema";

export default function Form() {
  const [lastResult, action] = useFormState(saveTeam, undefined);
  const [form, fields, getLocationFormProps] = useLocationForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: teamSchema });
    },
    shouldValidate: "onBlur",
    location: {
      name: "dynamic-form",
      storeName: "session",
    },
  });
  const members = fields.members.getFieldList();

  return (
    <form {...getLocationFormProps()} action={action} noValidate>
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
              <input
                {...getInputProps(memberFields.name, {
                  type: "text",
                })}
                key={memberFields.engineer.key}
              />
            </label>
            <label>
              leader:&nbsp;
              <input
                {...getInputProps(fields.leaderId, {
                  type: "radio",
                  value: index.toString(),
                })}
                key={memberFields.engineer.key}
              />
            </label>
            <label>
              engineer:&nbsp;
              <input
                {...getInputProps(memberFields.engineer, {
                  type: "checkbox",
                })}
                key={memberFields.engineer.key}
              />
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
