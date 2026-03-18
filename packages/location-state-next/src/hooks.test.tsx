import { createNavigationMock } from "@repo/test-utils";
import { renderHook } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { useNextAppSyncer } from "./hooks";

vi.mock("next/router.js", () => ({
  useRouter: vi.fn(() => ({
    replace: vi.fn(),
  })),
  Router: {
    events: {
      on: vi.fn(),
      off: vi.fn(),
    },
  },
}));

describe("useNextAppSyncer", () => {
  test("Returns a stable Syncer instance across re-renders.", () => {
    // Arrange & Act
    const { result, rerender } = renderHook(() => useNextAppSyncer());
    const first = result.current;
    rerender();
    const second = result.current;
    // Assert
    expect(first).toBe(second);
  });

  test("Returned syncer has key, sync, and updateURL methods.", () => {
    // Arrange & Act
    const { result } = renderHook(() => useNextAppSyncer());
    // Assert
    expect(typeof result.current.key).toBe("function");
    expect(typeof result.current.sync).toBe("function");
    expect(typeof result.current.updateURL).toBe("function");
  });

  test("Uses provided navigation when options.navigation is passed.", () => {
    // Arrange
    const navigation = createNavigationMock("/");
    const { result } = renderHook(() => useNextAppSyncer({ navigation }));
    const key1 = result.current.key();
    // Act
    navigation.navigate("/hoge");
    // Assert
    const key2 = result.current.key();
    expect(key1).not.toBeUndefined();
    expect(key2).not.toBeUndefined();
    expect(key1).not.toBe(key2);
  });
});
