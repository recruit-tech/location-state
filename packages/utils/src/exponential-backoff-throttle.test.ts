import {
  type Mock,
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";
import { createThrottle } from "./exponential-backoff-throttle";

type IntervalTestParameter = {
  until: number;
  callTimes: number;
  executedTimes?: number[];
};

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

function createRecordCalledTimes() {
  const now = Date.now();
  return vi.fn(() => Date.now() - now);
}

function mapExecutedIntervalTimes(callback: Mock) {
  return callback.mock.results.map((result) => result.value);
}

describe("Register with 10ms interval.", () => {
  test("First register callback is immediate executed.", () => {
    // Arrange
    const throttle = createThrottle();
    const callback = vi.fn();
    // Act
    throttle(callback);
    vi.runAllTimers();
    // Assert
    expect(callback).toBeCalledTimes(1);
  });

  test.each<IntervalTestParameter>([
    {
      until: 10,
      callTimes: 2,
      executedTimes: [0, 50],
    },
    {
      until: 50,
      callTimes: 3,
      executedTimes: [0, 50, 150],
    },
    {
      until: 150,
      callTimes: 4,
      executedTimes: [0, 50, 150, 350],
    },
    {
      until: 350,
      callTimes: 5,
      executedTimes: [0, 50, 150, 350, 850],
    },
    {
      until: 850,
      callTimes: 6,
      executedTimes: [0, 50, 150, 350, 850, 1850],
    },
    {
      until: 1850,
      callTimes: 7,
      executedTimes: [0, 50, 150, 350, 850, 1850, 2850],
    },
    {
      until: 2850,
      callTimes: 8,
      executedTimes: [0, 50, 150, 350, 850, 1850, 2850, 3850],
    },
    {
      until: 5000,
      callTimes: 10,
      executedTimes: [0, 50, 150, 350, 850, 1850, 2850, 3850, 4850, 5850],
    },
  ])(
    "Register until $until ms, it will be executed $callTimes times in the end.",
    ({ until, callTimes, executedTimes }) => {
      // Arrange
      const throttle = createThrottle();
      const callback = createRecordCalledTimes();
      // Act
      runUntil(() => throttle(callback), {
        until,
        delay: 10,
      });
      // Assert
      expect(callback).toBeCalledTimes(callTimes);
      expect(mapExecutedIntervalTimes(callback)).toEqual(executedTimes);
    },
  );
});

describe("Register with 50ms interval.", () => {
  test.each<IntervalTestParameter>([
    {
      until: 150,
      callTimes: 3,
      executedTimes: [0, 150, 350],
    },
    {
      until: 350,
      callTimes: 4,
      executedTimes: [0, 150, 350, 850],
    },
    {
      until: 850,
      callTimes: 5,
      executedTimes: [0, 150, 350, 850, 1850],
    },
    {
      until: 1850,
      callTimes: 6,
      executedTimes: [0, 150, 350, 850, 1850, 2850],
    },
    {
      until: 2850,
      callTimes: 7,
      executedTimes: [0, 150, 350, 850, 1850, 2850, 3850],
    },
    {
      until: 5000,
      callTimes: 9,
      executedTimes: [0, 150, 350, 850, 1850, 2850, 3850, 4850, 5850],
    },
  ])(
    "Register until $until ms, it will be executed $callTimes times in the end.",
    ({ until, callTimes, executedTimes }) => {
      // Arrange
      const throttle = createThrottle();
      const callback = createRecordCalledTimes();
      // Act
      runUntil(() => throttle(callback), {
        until,
        delay: 50,
      });
      // Assert
      expect(callback).toBeCalledTimes(callTimes);
      expect(mapExecutedIntervalTimes(callback)).toEqual(executedTimes);
    },
  );

  describe("After register with 5 times with 10ms interval.", () => {
    test.each<IntervalTestParameter>([
      {
        until: 50,
        callTimes: 2,
        executedTimes: [0, 150],
      },
      {
        until: 150,
        callTimes: 3,
        executedTimes: [0, 150, 350],
      },
      {
        until: 350,
        callTimes: 4,
        executedTimes: [0, 150, 350, 850],
      },
    ])(
      "Register until $until ms, it will be executed $callTimes times in the end.",
      ({ until, callTimes, executedTimes }) => {
        // Arrange
        const throttle = createThrottle();
        runUntil(() => throttle(() => false), {
          until: 50,
          delay: 10,
        });
        const callback = createRecordCalledTimes();
        // Act
        runUntil(() => throttle(callback), {
          until,
          delay: 50,
        });
        // Assert
        expect(callback).toBeCalledTimes(callTimes);
        expect(mapExecutedIntervalTimes(callback)).toEqual(executedTimes);
      },
    );
  });
});

describe("Register with 100ms interval.", () => {
  test.each<IntervalTestParameter>([
    {
      until: 1000,
      callTimes: 5,
      executedTimes: [0, 150, 350, 850, 1850],
    },
    {
      until: 3000,
      callTimes: 7,
      executedTimes: [0, 150, 350, 850, 1850, 2850, 3850],
    },
    {
      until: 5000,
      callTimes: 9,
      executedTimes: [0, 150, 350, 850, 1850, 2850, 3850, 4850, 5850],
    },
  ])(
    "Register until $until ms, it will be executed $callTimes times in the end.",
    ({ until, callTimes, executedTimes }) => {
      // Arrange
      const throttle = createThrottle();
      const callback = createRecordCalledTimes();
      // Act
      runUntil(() => throttle(callback), {
        until,
        delay: 100,
      });
      // Assert
      expect(callback).toBeCalledTimes(callTimes);
      expect(mapExecutedIntervalTimes(callback)).toEqual(executedTimes);
    },
  );
});

describe("Register with 1000ms interval.", () => {
  test.each<IntervalTestParameter>([
    {
      until: 1000,
      callTimes: 2,
      executedTimes: [0, 1850],
    },
    {
      until: 10000,
      callTimes: 11,
      executedTimes: [
        0, 1850, 2850, 3850, 4850, 5850, 6850, 7850, 8850, 9850, 10850,
      ],
    },
  ])(
    "Register until $until ms, it will be executed $callTimes times in the end.",
    ({ until, callTimes, executedTimes }) => {
      // Arrange
      const throttle = createThrottle();
      const callback = createRecordCalledTimes();
      // Act
      runUntil(() => throttle(callback), {
        until,
        delay: 1000,
      });
      // Assert
      expect(callback).toBeCalledTimes(callTimes);
      expect(mapExecutedIntervalTimes(callback)).toEqual(executedTimes);
    },
  );
});
