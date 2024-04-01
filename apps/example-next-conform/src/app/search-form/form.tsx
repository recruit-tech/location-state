"use client";

import { getInputProps } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useFormState } from "react-dom";
import { useLocationForm } from "../../lib/use-location-form";
import { search } from "./action";
import { searchSchema } from "./schema";

export default function Form() {
  const [lastResult, action] = useFormState(search, undefined);
  const [_form, fields, getLocationFormProps] = useLocationForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: searchSchema });
    },
    shouldValidate: "onBlur",
    location: {
      name: "search-form",
      storeName: "url",
    },
  });

  // fixme: ホットリロード後しかうまく動作しない

  return (
    <>
      <form {...getLocationFormProps()} action={action} noValidate>
        <div>
          <input
            {...getInputProps(fields.title, {
              type: "text",
            })}
            key={fields.title.id}
            placeholder="free word"
          />
          {fields.title.errors && <p>{fields.title.errors}</p>}
        </div>
        <ul>
          <li>
            <label htmlFor={fields.news.id}>News</label>
            <input
              {...getInputProps(fields.news, {
                type: "checkbox",
              })}
              key={fields.news.id}
            />
          </li>
          <li>
            <label htmlFor={fields.tech.id}>Tech</label>
            <input
              {...getInputProps(fields.tech, {
                type: "checkbox",
              })}
              key={fields.tech.id}
            />
          </li>
        </ul>
        <button type="submit">search</button>
      </form>
    </>
  );
}
