import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { ExponentialBackoffThrottle } from "./exponential-backoff-throttle";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.runAllTimers();
  vi.clearAllTimers();
});

function runUntil(
  callback: () => void,
  {
    delay,
    until,
  }: {
    delay: number;
    until: number;
  },
) {
  // immediate execution on 0ms
  callback();
  for (let i = 0; i < until / delay; i++) {
    vi.advanceTimersByTime(delay);
    callback();
  }
  vi.runAllTimers();
}

describe("Register with 10ms interval.", () => {
  test("First register callback is immediate executed.", () => {
    // Arrange
    const backOff = new ExponentialBackoffThrottle();
    const callback = vi.fn();
    // Act
    backOff.register(callback);
    vi.runAllTimers();
    // Assert
    expect(callback).toBeCalledTimes(1);
  });

  test("Register until 10ms, it will be executed 2 times in the end.", () => {
    // Arrange
    const backOff = new ExponentialBackoffThrottle();
    const callback = vi.fn();
    // Act
    runUntil(() => backOff.register(callback), {
      until: 10,
      delay: 10,
    });
    // Assert
    expect(callback).toBeCalledTimes(2);
  });

  test("Register until 20ms, it will be executed 3 times in the end.", () => {
    // Arrange
    const backOff = new ExponentialBackoffThrottle();
    const callback = vi.fn();
    // Act
    runUntil(() => backOff.register(callback), {
      until: 50,
      delay: 10,
    });
    // Assert
    expect(callback).toBeCalledTimes(3);
  });

  test("Register until 50ms, it will be executed 5 times in the end.", () => {
    // Arrange
    const backOff = new ExponentialBackoffThrottle();
    const callback = vi.fn();
    // Act
    runUntil(() => backOff.register(callback), {
      until: 150,
      delay: 10,
    });
    // Assert
    expect(callback).toBeCalledTimes(4);
  });

  test("Register until 350ms, it will be executed 5 times in the end.", () => {
    // Arrange
    const backOff = new ExponentialBackoffThrottle();
    const callback = vi.fn();
    // Act
    runUntil(() => backOff.register(callback), {
      until: 350,
      delay: 10,
    });
    // Assert
    expect(callback).toBeCalledTimes(5);
  });

  test("Register until 850ms, it will be executed 6 times in the end.", () => {
    // Arrange
    const backOff = new ExponentialBackoffThrottle();
    const callback = vi.fn();
    // Act
    runUntil(() => backOff.register(callback), {
      until: 850,
      delay: 10,
    });
    // Assert
    expect(callback).toBeCalledTimes(6);
  });

  test("Register until 1850ms, it will be executed 7 times in the end.", () => {
    // Arrange
    const backOff = new ExponentialBackoffThrottle();
    const callback = vi.fn();
    // Act
    runUntil(() => backOff.register(callback), {
      until: 1850,
      delay: 10,
    });
    // Assert
    expect(callback).toBeCalledTimes(7);
  });

  test("Register until 2850ms, it will be executed 8 times in the end.", () => {
    // Arrange
    const backOff = new ExponentialBackoffThrottle();
    const callback = vi.fn();
    // Act
    runUntil(() => backOff.register(callback), {
      until: 2850,
      delay: 10,
    });
    // Assert
    expect(callback).toBeCalledTimes(8);
  });

  test("Register until 5000ms, it will be executed 10 times in the end.", () => {
    // Arrange
    const backOff = new ExponentialBackoffThrottle();
    const callback = vi.fn();
    // Act
    runUntil(() => backOff.register(callback), {
      until: 5000,
      delay: 10,
    });
    // Assert
    expect(callback).toBeCalledTimes(10);
  });

  test("Register until 30000ms, it will be executed 35 times in the end.", () => {
    // Arrange
    const backOff = new ExponentialBackoffThrottle();
    const callback = vi.fn();
    // Act
    runUntil(() => backOff.register(callback), {
      until: 30000,
      delay: 10,
    });
    // Assert
    expect(callback).toBeCalledTimes(35);
  });
});

describe("Register with 50ms interval.", () => {
  test("Register until 150ms, it will be executed 3 times in the end.", () => {
    // Arrange
    const backOff = new ExponentialBackoffThrottle();
    const callback = vi.fn();
    // Act
    runUntil(() => backOff.register(callback), {
      until: 150,
      delay: 50,
    });
    // Assert
    expect(callback).toBeCalledTimes(3);
  });

  test("Register until 350ms, it will be executed 4 times in the end.", () => {
    // Arrange
    const backOff = new ExponentialBackoffThrottle();
    const callback = vi.fn();
    // Act
    runUntil(() => backOff.register(callback), {
      until: 350,
      delay: 50,
    });
    // Assert
    expect(callback).toBeCalledTimes(4);
  });

  describe("After register with 5 times with 10ms interval.", () => {
    test("Register until 150ms, it will be executed 3 times in the end.", () => {
      // Arrange
      const backOff = new ExponentialBackoffThrottle();
      runUntil(() => backOff.register(() => false), {
        until: 50,
        delay: 10,
      });
      const callback = vi.fn();
      // Act
      runUntil(() => backOff.register(callback), {
        until: 150,
        delay: 50,
      });
      // Assert
      expect(callback).toBeCalledTimes(3);
    });
  });
});

describe("Register with 100ms interval.", () => {
  test("Register until 1000ms, it will be executed 5 times in the end.", () => {
    // Arrange
    const backOff = new ExponentialBackoffThrottle();
    const callback = vi.fn();
    // Act
    runUntil(() => backOff.register(callback), {
      until: 1000,
      delay: 100,
    });
    // Assert
    expect(callback).toBeCalledTimes(5);
  });

  test("Register until 3000ms, it will be executed 7 times in the end.", () => {
    // Arrange
    const backOff = new ExponentialBackoffThrottle();
    const callback = vi.fn();
    // Act
    runUntil(() => backOff.register(callback), {
      until: 3000,
      delay: 100,
    });
    // Assert
    expect(callback).toBeCalledTimes(7);
  });
});

describe("Register with 1000ms interval.", () => {
  test("Register until 10000ms, it will be executed 11 times in the end.", () => {
    // Arrange
    const backOff = new ExponentialBackoffThrottle();
    const callback = vi.fn();
    // Act
    runUntil(() => backOff.register(callback), {
      until: 10000,
      delay: 1000,
    });
    // Assert
    expect(callback).toBeCalledTimes(11);
  });

  test("Register until 30000ms, it will be executed 31 times in the end.", () => {
    // Arrange
    const backOff = new ExponentialBackoffThrottle();
    const callback = vi.fn();
    // Act
    runUntil(() => backOff.register(callback), {
      until: 30000,
      delay: 1000,
    });
    // Assert
    expect(callback).toBeCalledTimes(31);
  });
});
