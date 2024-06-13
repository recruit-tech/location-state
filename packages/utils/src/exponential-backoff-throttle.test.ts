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

describe("Execute with 10ms interval.", () => {
  test("First execution is immediate applied.", () => {
    // Arrange
    const backOff = new ExponentialBackoffThrottle();
    const callback = vi.fn();
    // Act
    backOff.register(callback);
    vi.runAllTimers();
    // Assert
    expect(callback).toBeCalledTimes(1);
  });

  test("Executed 2 times after 10ms.", () => {
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

  test("Executed 2 times after 50ms.", () => {
    // Arrange
    const backOff = new ExponentialBackoffThrottle();
    const callback = vi.fn();
    // Act
    runUntil(() => backOff.register(callback), {
      until: 50,
      delay: 10,
    });
    // Assert
    expect(callback).toBeCalledTimes(2);
  });

  test("Executed 2 times after 60ms.", () => {
    // Arrange
    const backOff = new ExponentialBackoffThrottle();
    const callback = vi.fn();
    // Act
    runUntil(() => backOff.register(callback), {
      until: 60,
      delay: 10,
    });
    // Assert
    expect(callback).toBeCalledTimes(3);
  });

  test("Executed 3 times after 150ms.", () => {
    // Arrange
    const backOff = new ExponentialBackoffThrottle();
    const callback = vi.fn();
    // Act
    runUntil(() => backOff.register(callback), {
      until: 150,
      delay: 10,
    });
    // Assert
    expect(callback).toBeCalledTimes(3);
  });

  test("Executed 4 times after 350ms.", () => {
    // Arrange
    const backOff = new ExponentialBackoffThrottle();
    const callback = vi.fn();
    // Act
    runUntil(() => backOff.register(callback), {
      until: 350,
      delay: 10,
    });
    // Assert
    expect(callback).toBeCalledTimes(4);
  });

  test("Executed 5 times after 850ms.", () => {
    // Arrange
    const backOff = new ExponentialBackoffThrottle();
    const callback = vi.fn();
    // Act
    runUntil(() => backOff.register(callback), {
      until: 850,
      delay: 10,
    });
    // Assert
    expect(callback).toBeCalledTimes(5);
  });

  test("Executed 6 times after 1850ms.", () => {
    // Arrange
    const backOff = new ExponentialBackoffThrottle();
    const callback = vi.fn();
    // Act
    runUntil(() => backOff.register(callback), {
      until: 1850,
      delay: 10,
    });
    // Assert
    expect(callback).toBeCalledTimes(6);
  });

  test("Executed 7 times after 2850ms.", () => {
    // Arrange
    const backOff = new ExponentialBackoffThrottle();
    const callback = vi.fn();
    // Act
    runUntil(() => backOff.register(callback), {
      until: 2850,
      delay: 10,
    });
    // Assert
    expect(callback).toBeCalledTimes(7);
  });

  test("Executed 8 times after 3000ms.", () => {
    // Arrange
    const backOff = new ExponentialBackoffThrottle();
    const callback = vi.fn();
    // Act
    runUntil(() => backOff.register(callback), {
      until: 3000,
      delay: 10,
    });
    // Assert
    expect(callback).toBeCalledTimes(8);
  });

  test("Executed 35 times after 30000ms.", () => {
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

describe("Execute with 50ms interval.", () => {
  test("Executed 4 times after 150ms.", () => {
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

  test("Executed 4 times after 350ms.", () => {
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

  describe("After executed 5 times with 10ms interval.", () => {
    test("Executed 3 times after 150ms.", () => {
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

describe("Execute with 100ms interval.", () => {
  test("Executed 6 times after 1000ms.", () => {
    // Arrange
    const backOff = new ExponentialBackoffThrottle();
    const callback = vi.fn();
    // Act
    runUntil(() => backOff.register(callback), {
      until: 1000,
      delay: 100,
    });
    // Assert
    expect(callback).toBeCalledTimes(6);
  });

  test("Executed 8 times after 3000ms.", () => {
    // Arrange
    const backOff = new ExponentialBackoffThrottle();
    const callback = vi.fn();
    // Act
    runUntil(() => backOff.register(callback), {
      until: 3000,
      delay: 100,
    });
    // Assert
    expect(callback).toBeCalledTimes(8);
  });
});

describe("Execute with 1000ms interval.", () => {
  test("Executed 11 times after 10000ms.", () => {
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

  test("Executed 31 times after 30000ms.", () => {
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
