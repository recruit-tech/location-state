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

function intervalCallAndRunAllTimers(
  callback: () => void,
  {
    intervalDelay,
    callUntil,
  }: {
    intervalDelay: number;
    callUntil: number;
  },
) {
  // immediate execution on 0ms
  callback();
  for (let i = 0; i < callUntil / intervalDelay; i++) {
    vi.advanceTimersByTime(intervalDelay);
    callback();
  }
  vi.runAllTimers();
}

function recordTimeMock() {
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
      const recordExecutedTime = recordTimeMock();
      // Act
      intervalCallAndRunAllTimers(() => throttle(recordExecutedTime), {
        callUntil: until,
        intervalDelay: 10,
      });
      // Assert
      expect(mapExecutedIntervalTimes(recordExecutedTime)).toEqual(
        executedTimes,
      );
    },
  );

  test("Register twice immediately, the throttle will terminate in 1850ms.", () => {
    // Arrange
    const throttle = createThrottle();
    const callback = vi.fn();
    const now = Date.now();
    // Act
    throttle(callback);
    throttle(callback);
    vi.runAllTimers();
    // Assert
    expect(Date.now() - now).toBe(850);
  });
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
      const recordExecutedTime = recordTimeMock();
      // Act
      intervalCallAndRunAllTimers(() => throttle(recordExecutedTime), {
        callUntil: until,
        intervalDelay: 50,
      });
      // Assert
      expect(mapExecutedIntervalTimes(recordExecutedTime)).toEqual(
        executedTimes,
      );
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
        intervalCallAndRunAllTimers(() => throttle(() => false), {
          callUntil: 50,
          intervalDelay: 10,
        });
        const recordExecutedTime = recordTimeMock();
        // Act
        intervalCallAndRunAllTimers(() => throttle(recordExecutedTime), {
          callUntil: until,
          intervalDelay: 50,
        });
        // Assert
        expect(mapExecutedIntervalTimes(recordExecutedTime)).toEqual(
          executedTimes,
        );
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
      const recordExecutedTime = recordTimeMock();
      // Act
      intervalCallAndRunAllTimers(() => throttle(recordExecutedTime), {
        callUntil: until,
        intervalDelay: 100,
      });
      // Assert
      expect(mapExecutedIntervalTimes(recordExecutedTime)).toEqual(
        executedTimes,
      );
    },
  );
});

describe("Register with 1000ms interval.", () => {
  test.each<IntervalTestParameter>([
    {
      until: 1000,
      executedTimes: [0, 1000],
    },
    {
      until: 10000,
      executedTimes: [
        0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000,
      ],
    },
  ])(
    "Register until $until ms, it will be executed $executedTimes times in the end.",
    ({ until, executedTimes }) => {
      // Arrange
      const throttle = createThrottle();
      const recordExecutedTime = recordTimeMock();
      // Act
      intervalCallAndRunAllTimers(() => throttle(recordExecutedTime), {
        callUntil: until,
        intervalDelay: 1000,
      });
      // Assert
      expect(mapExecutedIntervalTimes(recordExecutedTime)).toEqual(
        executedTimes,
      );
    },
  );
});
