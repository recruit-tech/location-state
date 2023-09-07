import {
  LocationStateDefinition,
  useLocationSetState,
  useLocationState,
  useLocationStateValue,
} from "./hooks";
import { LocationStateProvider } from "./provider";
import { createNavigationMock } from "test-utils";
import { renderWithUser } from "test-utils";
import { screen, waitFor } from "@testing-library/react";

const mockNavigation = createNavigationMock("/");
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
globalThis.navigation = mockNavigation;

beforeEach(() => {
  mockNavigation.navigate("/");
  sessionStorage.clear();
});

describe("`useLocationState` used.", () => {
  function LocationSyncCounter() {
    const [count, setCount] = useLocationState({
      name: "count",
      defaultValue: 0,
      storeName: "session",
    });
    return (
      <div>
        <h1>count: {count}</h1>
        <button onClick={() => setCount(count + 1)}>increment</button>
        <button onClick={() => setCount((prev) => prev + 1)}>
          increment with callback
        </button>
      </div>
    );
  }

  function LocationSyncCounterPage() {
    return (
      <LocationStateProvider>
        <LocationSyncCounter />
      </LocationStateProvider>
    );
  }

  test("`count` can be updated.", async () => {
    // Arrange
    mockNavigation.navigate("/count-update");
    const { user } = renderWithUser(<LocationSyncCounterPage />);
    // Act
    await user.click(await screen.findByRole("button", { name: "increment" }));
    // Assert
    expect(screen.getByRole("heading")).toHaveTextContent("count: 1");
  });

  test("`count` can be updated with callback.", async () => {
    // Arrange
    mockNavigation.navigate("/count-update");
    const { user } = renderWithUser(<LocationSyncCounterPage />);
    // Act
    await user.click(
      await screen.findByRole("button", { name: "increment with callback" }),
    );
    // Assert
    expect(screen.getByRole("heading")).toHaveTextContent("count: 1");
  });

  test("`count` is reset at navigation.", async () => {
    // Arrange
    mockNavigation.navigate("/count-reset");
    const { user } = renderWithUser(<LocationSyncCounterPage />);
    await user.click(await screen.findByRole("button", { name: "increment" }));
    // Act
    mockNavigation.navigate("/anywhere");
    // Assert
    await waitFor(() =>
      expect(screen.getByRole("heading")).toHaveTextContent("count: 0"),
    );
  });
});

describe("`useLocationStateValue`/`useLocationSetState` used.", () => {
  function LocationSyncCounter() {
    const counter: LocationStateDefinition<number> = {
      name: "counter",
      defaultValue: 0,
      storeName: "session",
    };
    const count = useLocationStateValue(counter);
    const setCount = useLocationSetState(counter);
    return (
      <div>
        <h1>count: {count}</h1>
        <button onClick={() => setCount(count + 1)}>increment</button>
      </div>
    );
  }

  function LocationSyncCounterPage() {
    return (
      <LocationStateProvider>
        <LocationSyncCounter />
      </LocationStateProvider>
    );
  }

  test("`count` can be updated.", async () => {
    // Arrange
    mockNavigation.navigate("/count-update");
    const { user } = renderWithUser(<LocationSyncCounterPage />);
    // Act
    await user.click(await screen.findByRole("button", { name: "increment" }));
    // Assert
    expect(screen.getByRole("heading")).toHaveTextContent("count: 1");
  });

  test("`count` is reset at navigation.", async () => {
    // Arrange
    mockNavigation.navigate("/count-reset");
    const { user } = renderWithUser(<LocationSyncCounterPage />);
    await user.click(await screen.findByRole("button", { name: "increment" }));
    // Act
    mockNavigation.navigate("/anywhere");
    // Assert
    await waitFor(() =>
      expect(screen.getByRole("heading")).toHaveTextContent("count: 0"),
    );
  });
});
