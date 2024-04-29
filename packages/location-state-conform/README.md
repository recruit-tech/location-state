# `@location-state/conform`

[![npm version](https://badge.fury.io/js/@location-state%2Fconform.svg)](https://badge.fury.io/js/@location-state%2Fconform)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Synchronize [conform](https://conform.guide/) with history entries.

## Features

- Manage conform state to synchronize with the history location.
- Supports Session Storage and URL as persistent destinations. View the more detail in the [`@location-state/core` docs](/packages/location-state-core/README.md).

## Packages

- [@location-state/core](/packages/location-state-core/README.md): Framework agnostic, but for Next.js App Router.
- [@location-state/conform](/packages/location-state-core/README.md): For conform.

## Quickstart for [Next.js App Router with Conform](https://conform.guide/integration/nextjs)

### Installation

```sh
npm install @location-state/core @location-state/conform
# or
yarn add @location-state/core @location-state/conform
# or
pnpm add @location-state/core @location-state/conform
```

### Configuration

```tsx
// src/app/Providers.tsx
"use client";

import { LocationStateProvider } from "@location-state/core";

export function Providers({ children }: { children: React.ReactNode }) {
  return <LocationStateProvider>{children}</LocationStateProvider>;
}
```

```tsx
// src/app/layout.tsx
import { Providers } from "./Providers";

// ...snip...

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### Working with Conform state

```tsx
// user-form.tsx
"use client";

import { getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useLocationForm } from "@location-state/conform";
import { useFormState } from "react-dom";
import { User } from "./schema"; // Your schema

export default function UserForm() {
  const [formOptions, getLocationFormProps] = useLocationForm({
    location: {
      name: "your-form", // Unique form name
      storeName: "session", // or "url"
    },
  });
  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: User });
    },
    ...formOptions, // Pass the form options from `useLocationForm`
  });

  return (
    // Use `getLocationFormProps` to get the form props
    <form {...getLocationFormProps(form)} noValidate>
      <label htmlFor={fields.firstName.id}>First name</label>
      <input
        {...getInputProps(fields.firstName, {
          type: "text",
        })}
        key={fields.firstName.key}
      />
      <div>{fields.firstName.errors}</div>
      <button type="submit">submit</button>
    </form>
  );
}
```

### Working with Conform and Server Actions

```ts
// action.ts
"use server";

import { parseWithZod } from "@conform-to/zod";
import { redirect } from "next/navigation";
import { User } from "./schema";

export async function saveUser(prevState: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: User,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  console.log("submit data", submission.value);

  redirect("/success");
}
```

```tsx
// user-form.tsx
"use client";

import { getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useLocationForm } from "@location-state/conform";
import { useFormState } from "react-dom";
import { saveUser } from "./action"; // Your action
import { User } from "./schema"; // Your schema

export default function UserForm() {
  const [lastResult, action] = useFormState(saveUser, undefined);
  const [formOptions, getLocationFormProps] = useLocationForm({
    location: {
      name: "your-form", // Unique form name
      storeName: "session", // or "url"
    },
  });
  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: User });
    },
    ...formOptions, // Pass the form options from `useLocationForm`
  });

  return (
    // Use `getLocationFormProps` to get the form props
    <form {...getLocationFormProps(form)} action={action} noValidate>
      <label htmlFor={fields.firstName.id}>First name</label>
      <input
        {...getInputProps(fields.firstName, {
          type: "text",
        })}
        key={fields.firstName.key}
      />
      <div>{fields.firstName.errors}</div>
      <button type="submit">submit</button>
    </form>
  );
}
```

## API

View the API reference [here](./docs/API.md).
