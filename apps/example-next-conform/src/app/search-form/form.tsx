"use client";

import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useRef } from "react";
import { useDebouncedCallback } from "use-debounce";
import { search } from "./action";
import { type SearchParams, searchSchema } from "./schema";

export default function Form({
  defaultParams,
}: { defaultParams: SearchParams }) {
  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: searchSchema });
    },
    shouldValidate: "onBlur",
    defaultValue: defaultParams,
  });
  const formRef = useRef<HTMLFormElement>();
  const handleChange = useDebouncedCallback(() => {
    formRef.current?.requestSubmit();
  }, 1000);

  return (
    <form
      {...getFormProps(form)}
      action={search}
      onChange={handleChange}
      ref={formRef}
      noValidate
    >
      <div>
        <input
          {...getInputProps(fields.title, {
            type: "text",
          })}
          placeholder="free word"
        />
      </div>
      <div>
        <label>
          <input
            {...getInputProps(fields.news, {
              type: "checkbox",
            })}
          />
          News
        </label>
        <label>
          <input
            {...getInputProps(fields.tech, {
              type: "checkbox",
            })}
          />
          Tech
        </label>
      </div>
      <button type="submit">Search</button>
    </form>
  );
}
