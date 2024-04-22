"use client";

import { getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useLocationForm } from "@location-state/conform";
import { useEffect, useReducer } from "react";
import { useFormState } from "react-dom";
import { saveTeam } from "./action";
import { Team } from "./schema";

export default function Form({ storeName }: { storeName: "session" | "url" }) {
  const [lastResult, action] = useFormState(saveTeam, undefined);
  const [formOptions, getLocationFormProps] = useLocationForm({
    location: {
      name: "dynamic-form",
      storeName,
    },
  });
  const [form, fields] = useForm({
    ...formOptions,
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: Team });
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
          const numbers = memberFields.numbers.getFieldList();

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
                {numbers.map((number) => (
                  <div key={number.key}>
                    <input
                      {...getInputProps(number, { type: "text" })}
                      key={number.key}
                    />
                    <p>{number.errors?.join(", ")}</p>
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
      <div style={{ display: "flex", columnGap: "10px" }}>
        <button type="submit">submit</button>
        <button type="submit" {...form.reset.getButtonProps()}>
          Reset
        </button>
      </div>
    </form>
  );
}
