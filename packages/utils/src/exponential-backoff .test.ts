import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { ExponentialBackoff } from "./exponential-backoff";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.runAllTimers();
  vi.clearAllTimers();
});

describe("Execute once.", () => {
  test("Not executed immediately.", () => {
    // Arrange
    const backOff = new ExponentialBackoff();
    const callback = vi.fn();
    // Act
    backOff.run(callback);
    // Assert
    expect(callback).not.toBeCalled();
  });

  test("Executed after 200ms.", () => {
    // Arrange
    const backOff = new ExponentialBackoff();
    const callback = vi.fn();
    // Act
    backOff.run(callback);
    vi.advanceTimersByTime(200);
    // Assert
    expect(callback).toBeCalledTimes(1);
  });
});

describe("Execute multiple times.", () => {
  test("Not executed after 200ms.", async () => {
    // Arrange
    const backOff = new ExponentialBackoff();
    const callback = vi.fn();
    // Act
    backOff.run(callback);
    backOff.run(callback);
    vi.advanceTimersByTime(200);
    // Assert
    expect(callback).not.toBeCalled();
  });

  test("Executed once after 400ms when two immediate calls.", async () => {
    // Arrange
    const backOff = new ExponentialBackoff();
    const callback = vi.fn();
    // Act
    backOff.run(callback);
    backOff.run(callback);
    vi.advanceTimersByTime(400);
    // Assert
    expect(callback).toBeCalledTimes(1);
  });

  test("Executed once after 600ms when three immediate call.", async () => {
    // Arrange
    const backOff = new ExponentialBackoff();
    const callback = vi.fn();
    // Act
    backOff.run(callback);
    backOff.run(callback);
    backOff.run(callback);
    vi.advanceTimersByTime(600);
    // Assert
    expect(callback).toBeCalledTimes(1);
  });

  test("Executed once after 800ms when four immediate call.", async () => {
    // Arrange
    const backOff = new ExponentialBackoff();
    const callback = vi.fn();
    // Act
    backOff.run(callback);
    backOff.run(callback);
    backOff.run(callback);
    backOff.run(callback);
    vi.advanceTimersByTime(800);
    // Assert
    expect(callback).toBeCalledTimes(1);
  });

  test("Executed once after 1000ms when five immediate call.", async () => {
    // Arrange
    const backOff = new ExponentialBackoff();
    const callback = vi.fn();
    // Act
    backOff.run(callback);
    backOff.run(callback);
    backOff.run(callback);
    backOff.run(callback);
    backOff.run(callback);
    vi.advanceTimersByTime(1000);
    // Assert
    expect(callback).toBeCalledTimes(1);
  });

  test("Executed once after 1000ms when over six immediate call.", async () => {
    // Arrange
    const backOff = new ExponentialBackoff();
    const callback = vi.fn();
    // Act
    backOff.run(callback);
    backOff.run(callback);
    backOff.run(callback);
    backOff.run(callback);
    backOff.run(callback);
    backOff.run(callback);
    vi.advanceTimersByTime(1000);
    // Assert
    expect(callback).toBeCalledTimes(1);
  });
});

describe("Execute with re-use instance.", () => {
  test("Executed twice after one call and 200ms.", async () => {
    // Arrange
    const backOff = new ExponentialBackoff();
    const callback = vi.fn();
    // Act
    backOff.run(callback);
    vi.advanceTimersByTime(200);
    backOff.run(callback);
    vi.advanceTimersByTime(200);
    // Assert
    expect(callback).toBeCalledTimes(2);
  });
});

describe("Execute with different instance.", () => {
  test("Executed twice after one call and 200ms.", async () => {
    // Arrange
    const backOff1 = new ExponentialBackoff();
    const backOff2 = new ExponentialBackoff();
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    // Act
    backOff1.run(callback1);
    backOff2.run(callback2);
    vi.advanceTimersByTime(200);
    // Assert
    expect(callback1).toBeCalledTimes(1);
    expect(callback2).toBeCalledTimes(1);
  });
});
