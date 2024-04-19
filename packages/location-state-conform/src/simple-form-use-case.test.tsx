import { getInputProps, parse, useForm } from "@conform-to/react";
import { LocationStateProvider } from "@location-state/core";
import { createNavigationMock, renderWithUser } from "@repo/test-utils";
import { act, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { useLocationForm } from "./hooks";

const mockNavigation = createNavigationMock("/");
// @ts-ignore
globalThis.navigation = mockNavigation;

let submitData: FormData | null = null;

beforeEach(() => {
  mockNavigation.navigate("/");
  submitData = null;
});

type FormFields = {
  firstName: string;
  lastName: string;
};

function SimpleForm({ defaultValue }: { defaultValue?: FormFields }) {
  const [formOptions, getLocationFormProps] = useLocationForm({
    location: {
      name: "simple-form",
      storeName: "session",
    },
  });
  const [form, fields] = useForm<FormFields>({
    defaultValue,
    // `conform` can cause unexpected submissions without onValidation.
    onValidate: ({ formData }) =>
      parse(formData, {
        resolve: (value) =>
          ({ value }) as {
            value: FormFields;
          },
      }),
    onSubmit(e, { formData }) {
      submitData = formData;
      e.preventDefault();
    },
    ...formOptions,
  });

  return (
    // @ts-ignore
    <form {...getLocationFormProps(form)} noValidate>
      <label htmlFor={fields.firstName.id}>First name</label>
      <input
        {...getInputProps(fields.firstName, {
          type: "text",
        })}
        key={fields.firstName.key}
      />
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
      <label htmlFor={fields.lastName.id}>Last name</label>
      <input
        {...getInputProps(fields.lastName, {
          type: "text",
        })}
        key={fields.lastName.key}
      />
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
      <button type="submit">submit</button>
      <button type="submit" {...form.reset.getButtonProps()}>
        Reset
      </button>
    </form>
  );
}

describe("simple form use case.", () => {
  function SimpleFormPage() {
    return (
      <LocationStateProvider>
        <SimpleForm />
      </LocationStateProvider>
    );
  }

  test("Default form value is empty.", async () => {
    // Act
    renderWithUser(<SimpleFormPage />);
    // Assert
    expect(screen.getByRole("textbox", { name: "First name" })).toHaveValue("");
    expect(screen.getByRole("textbox", { name: "Last name" })).toHaveValue("");
  });

  test("After navigation, form values are reset.", async () => {
    // Arrange
    const { user } = renderWithUser(<SimpleFormPage />);
    await user.type(
      screen.getByRole("textbox", { name: "First name" }),
      "Firstname test value",
    );
    await user.type(
      screen.getByRole("textbox", { name: "Last name" }),
      "Lastname test value",
    );
    // Act
    await act(() => mockNavigation.navigate("/anywhere"));
    // Assert
    expect(screen.getByRole("textbox", { name: "First name" })).toHaveValue("");
    expect(screen.getByRole("textbox", { name: "Last name" })).toHaveValue("");
  });

  test("The value entered at submit can be retrieved.", async () => {
    // Arrange
    const { user } = renderWithUser(<SimpleFormPage />);
    await user.type(
      screen.getByRole("textbox", { name: "First name" }),
      "Firstname test value",
    );
    await user.type(
      screen.getByRole("textbox", { name: "Last name" }),
      "Lastname test value",
    );
    // Act
    await user.click(screen.getByRole("button", { name: "submit" }));
    // Assert
    expect(submitData?.get("firstName")).toBe("Firstname test value");
    expect(submitData?.get("lastName")).toBe("Lastname test value");
  });
});

describe("simple form use case with defaultValue.", () => {
  function SimpleFormPage() {
    return (
      <LocationStateProvider>
        <SimpleForm
          defaultValue={{
            firstName: "default first name",
            lastName: "default last name",
          }}
        />
      </LocationStateProvider>
    );
  }

  test("Default form value is props value.", async () => {
    // Act
    renderWithUser(<SimpleFormPage />);
    // Assert
    expect(screen.getByRole("textbox", { name: "First name" })).toHaveValue(
      "default first name",
    );
    expect(screen.getByRole("textbox", { name: "Last name" })).toHaveValue(
      "default last name",
    );
  });

  test("After navigation, form values are reset.", async () => {
    // Arrange
    const { user } = renderWithUser(<SimpleFormPage />);
    await user.type(
      screen.getByRole("textbox", { name: "First name" }),
      "Firstname test value",
    );
    await user.type(
      screen.getByRole("textbox", { name: "Last name" }),
      "Lastname test value",
    );
    // Act
    await act(() => mockNavigation.navigate("/anywhere"));
    // Assert
    expect(screen.getByRole("textbox", { name: "First name" })).toHaveValue(
      "default first name",
    );
    expect(screen.getByRole("textbox", { name: "Last name" })).toHaveValue(
      "default last name",
    );
  });

  test("On click `Update Firstname`, update first name", async () => {
    // Arrange
    renderWithUser(<SimpleFormPage />);
    // Act
    await act(() =>
      screen.getByRole("button", { name: "Update Firstname" }).click(),
    );
    // Assert
    expect(screen.getByRole("textbox", { name: "First name" })).toHaveValue(
      "hoge",
    );
  });

  test("On click `Reset Firstname`, reset first name", async () => {
    // Arrange
    renderWithUser(<SimpleFormPage />);
    // Act
    await act(() =>
      screen.getByRole("button", { name: "Reset Firstname" }).click(),
    );
    // Assert
    expect(screen.getByRole("textbox", { name: "First name" })).toHaveValue(
      "default first name",
    );
  });

  test("On click `Update Lastname`, update last name", async () => {
    // Arrange
    renderWithUser(<SimpleFormPage />);
    // Act
    await act(() =>
      screen.getByRole("button", { name: "Update Lastname" }).click(),
    );
    // Assert
    expect(screen.getByRole("textbox", { name: "Last name" })).toHaveValue(
      "fuga",
    );
  });

  test("On click `Reset Lastname`, reset last name", async () => {
    // Arrange
    renderWithUser(<SimpleFormPage />);
    // Act
    await act(() =>
      screen.getByRole("button", { name: "Reset Lastname" }).click(),
    );
    // Assert
    expect(screen.getByRole("textbox", { name: "Last name" })).toHaveValue(
      "default last name",
    );
  });
});
