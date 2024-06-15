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
      executedTimes: [0, 50],
    },
    {
      until: 50,
      executedTimes: [0, 50, 150],
    },
    {
      until: 150,
      executedTimes: [0, 50, 150, 350],
    },
    {
      until: 350,
      executedTimes: [0, 50, 150, 350, 850],
    },
    {
      until: 850,
      executedTimes: [0, 50, 150, 350, 850, 1850],
    },
    {
      until: 1850,
      executedTimes: [0, 50, 150, 350, 850, 1850, 2850],
    },
    {
      until: 2850,
      executedTimes: [0, 50, 150, 350, 850, 1850, 2850, 3850],
    },
    {
      until: 5000,
      executedTimes: [0, 50, 150, 350, 850, 1850, 2850, 3850, 4850, 5850],
    },
  ])(
    "Register until $until ms, it will be executed $executedTimes times in the end.",
    ({ until, executedTimes }) => {
      // Arrange
      const throttle = createThrottle();
      const callback = createRecordCalledTimes();
      // Act
      runUntil(() => throttle(callback), {
        until,
        delay: 10,
      });
      // Assert
      expect(mapExecutedIntervalTimes(callback)).toEqual(executedTimes);
    },
  );
});

describe("Register with 50ms interval.", () => {
  test.each<IntervalTestParameter>([
    {
      until: 150,
      executedTimes: [0, 150, 350],
    },
    {
      until: 350,
      executedTimes: [0, 150, 350, 850],
    },
    {
      until: 850,
      executedTimes: [0, 150, 350, 850, 1850],
    },
    {
      until: 1850,
      executedTimes: [0, 150, 350, 850, 1850, 2850],
    },
    {
      until: 2850,
      executedTimes: [0, 150, 350, 850, 1850, 2850, 3850],
    },
    {
      until: 5000,
      executedTimes: [0, 150, 350, 850, 1850, 2850, 3850, 4850, 5850],
    },
  ])(
    "Register until $until ms, it will be executed $executedTimes times in the end.",
    ({ until, executedTimes }) => {
      // Arrange
      const throttle = createThrottle();
      const callback = createRecordCalledTimes();
      // Act
      runUntil(() => throttle(callback), {
        until,
        delay: 50,
      });
      // Assert
      expect(mapExecutedIntervalTimes(callback)).toEqual(executedTimes);
    },
  );

  describe("After register with 5 times with 10ms interval.", () => {
    test.each<IntervalTestParameter>([
      {
        until: 50,
        executedTimes: [0, 150],
      },
      {
        until: 150,
        executedTimes: [0, 150, 350],
      },
      {
        until: 350,
        executedTimes: [0, 150, 350, 850],
      },
    ])(
      "Register until $until ms, it will be executed $executedTimes times in the end.",
      ({ until, executedTimes }) => {
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
        expect(mapExecutedIntervalTimes(callback)).toEqual(executedTimes);
      },
    );
  });
});

describe("Register with 100ms interval.", () => {
  test.each<IntervalTestParameter>([
    {
      until: 1000,
      executedTimes: [0, 150, 350, 850, 1850],
    },
    {
      until: 3000,
      executedTimes: [0, 150, 350, 850, 1850, 2850, 3850],
    },
    {
      until: 5000,
      executedTimes: [0, 150, 350, 850, 1850, 2850, 3850, 4850, 5850],
    },
  ])(
    "Register until $until ms, it will be executed $executedTimes times in the end.",
    ({ until, executedTimes }) => {
      // Arrange
      const throttle = createThrottle();
      const callback = createRecordCalledTimes();
      // Act
      runUntil(() => throttle(callback), {
        until,
        delay: 100,
      });
      // Assert
      expect(mapExecutedIntervalTimes(callback)).toEqual(executedTimes);
    },
  );
});

describe("Register with 1000ms interval.", () => {
  test.each<IntervalTestParameter>([
    {
      until: 1000,
      executedTimes: [0, 1850],
    },
    {
      until: 10000,
      executedTimes: [
        0, 1850, 2850, 3850, 4850, 5850, 6850, 7850, 8850, 9850, 10850,
      ],
    },
  ])(
    "Register until $until ms, it will be executed $executedTimes times in the end.",
    ({ until, executedTimes }) => {
      // Arrange
      const throttle = createThrottle();
      const callback = createRecordCalledTimes();
      // Act
      runUntil(() => throttle(callback), {
        until,
        delay: 1000,
      });
      // Assert
      expect(mapExecutedIntervalTimes(callback)).toEqual(executedTimes);
    },
  );
});
