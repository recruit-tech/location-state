"use client";

import { getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useEffect, useReducer } from "react";
import { useFormState } from "react-dom";
import { useLocationForm } from "../../../lib/use-location-form";
import { saveTeam } from "./action";
import { teamSchema } from "./schema";

export default function Form() {
  const [lastResult, action] = useFormState(saveTeam, undefined);
  const [formOptions, getLocationFormProps] = useLocationForm({
    location: {
      name: "dynamic-form",
      storeName: "url",
    },
  });
  const [form, fields] = useForm({
    ...formOptions,
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: teamSchema });
    },
  });
  const members = fields.members.getFieldList();

  // Force rendering when `form.id` changes,  until next conform released
  // https://github.com/edmundhung/conform/pull/571
  const forceRerender = useReducer((v) => v + 1, 0)[1];
  // biome-ignore lint/correctness/useExhaustiveDependencies: force rendering when `form.id` changes
  useEffect(forceRerender, [form.id]);

  return (
    <form {...getLocationFormProps(form)} action={action} noValidate>
      <div>
        <button
          type="submit"
          {...form.insert.getButtonProps({
            name: fields.members.name,
            index: 0,
          })}
        >
          Add member to first
        </button>
        <button
          type="submit"
          {...form.insert.getButtonProps({
            name: fields.members.name,
          })}
        >
          Add member to last
        </button>
      </div>
      <ul>
        {members.map((member, index) => {
          const memberFields = member.getFieldset();

          return (
            <li key={member.key}>
              <div>Member {index + 1}</div>
              <input type="hidden" name={memberFields.id.name} value={index} />
              <label style={{ display: "block" }}>
                name:&nbsp;
                <input
                  {...getInputProps(memberFields.name, {
                    type: "text",
                  })}
                  key={memberFields.engineer.key}
                />
              </label>
              <label style={{ display: "block" }}>
                leader:&nbsp;
                <input
                  {...getInputProps(fields.leaderId, {
                    type: "radio",
                    value: index.toString(),
                  })}
                  key={memberFields.engineer.key}
                />
              </label>
              <div>
                <button
                  type="submit"
                  {...form.insert.getButtonProps({
                    name: memberFields.numbers.name,
                    index: memberFields.numbers.getFieldList().length,
                  })}
                >
                  Add number
                </button>
                {memberFields.numbers.getFieldList().map((number, index) => (
                  <div>
                    <input
                      {...getInputProps(number, { type: "text" })}
                      key={number.key}
                    />
                    <p>{memberFields.numbers.errors?.join(", ")}</p>
                  </div>
                ))}
              </div>
              <label style={{ display: "block" }}>
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
              <button
                type="submit"
                {...form.reorder.getButtonProps({
                  name: fields.members.name,
                  from: index,
                  to: 0,
                })}
              >
                Move to First
              </button>
              <button
                type="submit"
                {...form.reorder.getButtonProps({
                  name: fields.members.name,
                  from: index,
                  to: members.length - 1,
                })}
              >
                Move to Last
              </button>
              <div>{memberFields.name.errors?.join(", ")}</div>
              <div>{memberFields.engineer.errors?.join(", ")}</div>
            </li>
          );
        })}
      </ul>
      <button type="submit">submit</button>
    </form>
  );
}
