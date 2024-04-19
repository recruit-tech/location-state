import { getInputProps, parse, useForm } from "@conform-to/react";
import { LocationStateProvider } from "@location-state/core";
import { createNavigationMock, renderWithUser } from "@repo/test-utils";
import { act, screen, within } from "@testing-library/react";
import { useEffect, useReducer } from "react";
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
  members: Array<{
    firstName: string;
  }>;
};

function DynamicForm({ defaultValue }: { defaultValue?: FormFields }) {
  const [formOptions, getLocationFormProps] = useLocationForm({
    location: {
      name: "dynamic-form",
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
  const members = fields.members.getFieldList();

  // Force rendering when `form.id` changes,  until next conform released
  // https://github.com/edmundhung/conform/pull/571
  const forceRerender = useReducer((v) => v + 1, 0)[1];
  // biome-ignore lint/correctness/useExhaustiveDependencies: force rendering when `form.id` changes
  useEffect(forceRerender, [form.id]);

  return (
    // @ts-ignore
    <form {...getLocationFormProps(form)} noValidate>
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
      <ul>
        {members.map((member, index) => {
          const memberFields = member.getFieldset();

          return (
            <li key={member.key} aria-label={`Member ${index}`}>
              <div>Member {index}</div>
              <label htmlFor={memberFields.firstName.id}>First name</label>
              <input
                {...getInputProps(memberFields.firstName, {
                  type: "text",
                })}
                key={memberFields.firstName.key}
              />
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
            </li>
          );
        })}
      </ul>
      <button type="submit">submit</button>
      <button type="submit" {...form.reset.getButtonProps()}>
        Reset
      </button>
    </form>
  );
}

describe("dynamic form use case.", () => {
  function DynamicFormPage() {
    return (
      <LocationStateProvider>
        <DynamicForm />
      </LocationStateProvider>
    );
  }

  test("On click `Add member to first`, add member", async () => {
    // Arrange
    const { user } = renderWithUser(<DynamicFormPage />);
    await user.click(
      screen.getByRole("button", { name: "Add member to first" }),
    );
    await user.type(
      within(screen.getByRole("listitem", { name: "Member 0" })).getByRole(
        "textbox",
        { name: "First name" },
      ),
      "Test Firstname",
    );
    // Act
    await user.click(
      screen.getByRole("button", { name: "Add member to first" }),
    );
    // Assert
    expect(
      within(screen.getByRole("listitem", { name: "Member 0" })).getByRole(
        "textbox",
        { name: "First name" },
      ),
    ).toHaveValue("");
    expect(
      within(screen.getByRole("listitem", { name: "Member 1" })).getByRole(
        "textbox",
        { name: "First name" },
      ),
    ).toHaveValue("Test Firstname");
  });

  test("On click `Add member to last`, add member last", async () => {
    // Arrange
    const { user } = renderWithUser(<DynamicFormPage />);
    await user.click(
      screen.getByRole("button", { name: "Add member to last" }),
    );
    await user.type(
      within(screen.getByRole("listitem", { name: "Member 0" })).getByRole(
        "textbox",
        { name: "First name" },
      ),
      "Test Firstname",
    );
    // Act
    await user.click(
      screen.getByRole("button", { name: "Add member to last" }),
    );
    // Assert
    expect(
      within(screen.getByRole("listitem", { name: "Member 0" })).getByRole(
        "textbox",
        { name: "First name" },
      ),
    ).toHaveValue("Test Firstname");
    expect(
      within(screen.getByRole("listitem", { name: "Member 1" })).getByRole(
        "textbox",
        { name: "First name" },
      ),
    ).toHaveValue("");
  });

  test("On click `Remove`, remove member", async () => {
    // Arrange
    const { user } = renderWithUser(<DynamicFormPage />);
    await user.click(
      screen.getByRole("button", { name: "Add member to first" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Add member to last" }),
    );
    // Act
    await user.click(
      within(screen.getByRole("listitem", { name: "Member 1" })).getByRole(
        "button",
        { name: "Remove" },
      ),
    );
    // Assert
    expect(screen.queryByRole("listitem", { name: "Member 0" })).not.toBeNull();
    expect(screen.queryByRole("listitem", { name: "Member 1" })).toBeNull();
  });

  test("On click `Move to First`, move member to first", async () => {
    // Arrange
    const { user } = renderWithUser(<DynamicFormPage />);
    await user.click(
      screen.getByRole("button", { name: "Add member to first" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Add member to last" }),
    );
    await user.type(
      within(screen.getByRole("listitem", { name: "Member 0" })).getByRole(
        "textbox",
        { name: "First name" },
      ),
      "Test Firstname",
    );
    // Act
    await user.click(
      within(screen.getByRole("listitem", { name: "Member 1" })).getByRole(
        "button",
        { name: "Move to First" },
      ),
    );
    // Assert
    expect(
      within(screen.getByRole("listitem", { name: "Member 0" })).getByRole(
        "textbox",
        { name: "First name" },
      ),
    ).toHaveValue("");
    expect(
      within(screen.getByRole("listitem", { name: "Member 1" })).getByRole(
        "textbox",
        { name: "First name" },
      ),
    ).toHaveValue("Test Firstname");
  });

  test("On click `Move to Last`, move member to last", async () => {
    // Arrange
    const { user } = renderWithUser(<DynamicFormPage />);
    await user.click(
      screen.getByRole("button", { name: "Add member to first" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Add member to last" }),
    );
    await user.type(
      within(screen.getByRole("listitem", { name: "Member 0" })).getByRole(
        "textbox",
        { name: "First name" },
      ),
      "Test Firstname",
    );
    // Act
    await user.click(
      within(screen.getByRole("listitem", { name: "Member 0" })).getByRole(
        "button",
        { name: "Move to Last" },
      ),
    );
    // Assert
    expect(
      within(screen.getByRole("listitem", { name: "Member 0" })).getByRole(
        "textbox",
        { name: "First name" },
      ),
    ).toHaveValue("");
    expect(
      within(screen.getByRole("listitem", { name: "Member 1" })).getByRole(
        "textbox",
        { name: "First name" },
      ),
    ).toHaveValue("Test Firstname");
  });

  test("On click `submit`, submit form", async () => {
    // Arrange
    const { user } = renderWithUser(<DynamicFormPage />);
    await user.click(
      screen.getByRole("button", { name: "Add member to first" }),
    );
    await user.type(
      within(screen.getByRole("listitem", { name: "Member 0" })).getByRole(
        "textbox",
        { name: "First name" },
      ),
      "Test Firstname 0",
    );
    await user.click(
      screen.getByRole("button", { name: "Add member to last" }),
    );
    await user.type(
      within(screen.getByRole("listitem", { name: "Member 1" })).getByRole(
        "textbox",
        { name: "First name" },
      ),
      "Test Firstname 1",
    );
    // Act
    await user.click(screen.getByRole("button", { name: "submit" }));
    // Assert
    expect(submitData?.get("members[0].firstName")).toBe("Test Firstname 0");
    expect(submitData?.get("members[1].firstName")).toBe("Test Firstname 1");
  });

  test("On click `Reset`, reset form", async () => {
    // Arrange
    const { user } = renderWithUser(<DynamicFormPage />);
    await user.click(
      screen.getByRole("button", { name: "Add member to first" }),
    );
    await user.type(
      within(screen.getByRole("listitem", { name: "Member 0" })).getByRole(
        "textbox",
        { name: "First name" },
      ),
      "Test Firstname",
    );
    await user.click(
      screen.getByRole("button", { name: "Add member to last" }),
    );
    await user.type(
      within(screen.getByRole("listitem", { name: "Member 1" })).getByRole(
        "textbox",
        { name: "First name" },
      ),
      "Test Firstname 2",
    );
    // Act
    await user.click(screen.getByRole("button", { name: "Reset" }));
    // Assert
    expect(screen.queryByRole("listitem", { name: "Member 0" })).toBeNull();
    expect(screen.queryByRole("listitem", { name: "Member 1" })).toBeNull();
  });
});

describe("dynamic form use case with defaultValue.", () => {
  function DynamicFormPage() {
    return (
      <LocationStateProvider>
        <DynamicForm
          defaultValue={{
            members: [
              {
                firstName: "default first name",
              },
            ],
          }}
        />
      </LocationStateProvider>
    );
  }

  test("Default form value is props value.", async () => {
    // Act
    renderWithUser(<DynamicFormPage />);
    // Assert
    expect(screen.getByRole("textbox", { name: "First name" })).toHaveValue(
      "default first name",
    );
  });
});
