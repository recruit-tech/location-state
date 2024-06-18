import {
  type Mock,
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";
import { createThrottle } from "./create-throttle";

type IntervalTestParameter = {
  callUntil: number;
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

test("Throttle function is first called, it is calling back immediately.", () => {
  // Arrange
  const throttle = createThrottle();
  const callback = vi.fn();
  // Act
  throttle(callback);
  // Assert
  expect(callback).toBeCalledTimes(1);
});

describe("Throttle function is called at 10ms interval.", () => {
  test.each<IntervalTestParameter>([
    {
      callUntil: 10,
      executedTimes: [0, 50],
    },
    {
      callUntil: 50,
      executedTimes: [0, 50, 150],
    },
    {
      callUntil: 150,
      executedTimes: [0, 50, 150, 350],
    },
    {
      callUntil: 350,
      executedTimes: [0, 50, 150, 350, 850],
    },
    {
      callUntil: 850,
      executedTimes: [0, 50, 150, 350, 850, 1850],
    },
    {
      callUntil: 1850,
      executedTimes: [0, 50, 150, 350, 850, 1850, 2850],
    },
    {
      callUntil: 2850,
      executedTimes: [0, 50, 150, 350, 850, 1850, 2850, 3850],
    },
    {
      callUntil: 5000,
      executedTimes: [0, 50, 150, 350, 850, 1850, 2850, 3850, 4850, 5850],
    },
  ])(
    "Throttle function called until $callUntil ms, it will be executed $executedTimes .",
    ({ callUntil, executedTimes }) => {
      // Arrange
      const throttle = createThrottle();
      const recordExecutedTime = recordTimeMock();
      // Act
      intervalCallAndRunAllTimers(() => throttle(recordExecutedTime), {
        callUntil,
        intervalDelay: 10,
      });
      // Assert
      expect(mapExecutedIntervalTimes(recordExecutedTime)).toEqual(
        executedTimes,
      );
    },
  );

  test.each<{
    callUntil: number;
    terminatedAt: number;
  }>([
    {
      callUntil: 50,
      terminatedAt: 850,
    },
    {
      callUntil: 150,
      terminatedAt: 850,
    },
    {
      callUntil: 350,
      terminatedAt: 1850,
    },
  ])(
    "Throttle function called until $callUntil, the throttle will terminate in $terminatedAt ms.",
    ({ callUntil, terminatedAt }) => {
      // Arrange
      const throttle = createThrottle();
      const recordExecutedTime = recordTimeMock();
      const now = Date.now();
      // Act
      intervalCallAndRunAllTimers(() => throttle(recordExecutedTime), {
        callUntil,
        intervalDelay: 10,
      });
      // Assert
      expect(Date.now() - now).toBe(terminatedAt);
    },
  );
});

describe("Throttle function called at 50ms interval.", () => {
  test.each<IntervalTestParameter>([
    {
      callUntil: 150,
      executedTimes: [0, 150, 350],
    },
    {
      callUntil: 350,
      executedTimes: [0, 150, 350, 850],
    },
    {
      callUntil: 850,
      executedTimes: [0, 150, 350, 850, 1850],
    },
    {
      callUntil: 1850,
      executedTimes: [0, 150, 350, 850, 1850, 2850],
    },
    {
      callUntil: 2850,
      executedTimes: [0, 150, 350, 850, 1850, 2850, 3850],
    },
    {
      callUntil: 5000,
      executedTimes: [0, 150, 350, 850, 1850, 2850, 3850, 4850, 5850],
    },
  ])(
    "Throttle function called until $callUntil ms, it will be executed $executedTimes .",
    ({ callUntil, executedTimes }) => {
      // Arrange
      const throttle = createThrottle();
      const recordExecutedTime = recordTimeMock();
      // Act
      intervalCallAndRunAllTimers(() => throttle(recordExecutedTime), {
        callUntil,
        intervalDelay: 50,
      });
      // Assert
      expect(mapExecutedIntervalTimes(recordExecutedTime)).toEqual(
        executedTimes,
      );
    },
  );

  describe("After called at 5 times with 10ms interval.", () => {
    test.each<IntervalTestParameter>([
      {
        callUntil: 50,
        executedTimes: [0, 150],
      },
      {
        callUntil: 150,
        executedTimes: [0, 150, 350],
      },
      {
        callUntil: 350,
        executedTimes: [0, 150, 350, 850],
      },
    ])(
      "Throttle function called until $callUntil ms, it will be executed $executedTimes .",
      ({ callUntil, executedTimes }) => {
        // Arrange
        const throttle = createThrottle();
        intervalCallAndRunAllTimers(() => throttle(() => false), {
          callUntil: 50,
          intervalDelay: 10,
        });
        const recordExecutedTime = recordTimeMock();
        // Act
        intervalCallAndRunAllTimers(() => throttle(recordExecutedTime), {
          callUntil,
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

describe("Throttle function called at 100ms interval.", () => {
  test.each<IntervalTestParameter>([
    {
      callUntil: 1000,
      executedTimes: [0, 150, 350, 850, 1850],
    },
    {
      callUntil: 3000,
      executedTimes: [0, 150, 350, 850, 1850, 2850, 3850],
    },
    {
      callUntil: 5000,
      executedTimes: [0, 150, 350, 850, 1850, 2850, 3850, 4850, 5850],
    },
  ])(
    "Throttle function called until $callUntil ms, it will be executed $executedTimes .",
    ({ callUntil, executedTimes }) => {
      // Arrange
      const throttle = createThrottle();
      const recordExecutedTime = recordTimeMock();
      // Act
      intervalCallAndRunAllTimers(() => throttle(recordExecutedTime), {
        callUntil,
        intervalDelay: 100,
      });
      // Assert
      expect(mapExecutedIntervalTimes(recordExecutedTime)).toEqual(
        executedTimes,
      );
    },
  );
});

describe("Throttle function called at 1000ms interval.", () => {
  test.each<IntervalTestParameter>([
    {
      callUntil: 1000,
      executedTimes: [0, 1000],
    },
    {
      callUntil: 10000,
      executedTimes: [
        0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000,
      ],
    },
  ])(
    "Throttle function called until $callUntil ms, it will be executed $executedTimes .",
    ({ callUntil, executedTimes }) => {
      // Arrange
      const throttle = createThrottle();
      const recordExecutedTime = recordTimeMock();
      // Act
      intervalCallAndRunAllTimers(() => throttle(recordExecutedTime), {
        callUntil,
        intervalDelay: 1000,
      });
      // Assert
      expect(mapExecutedIntervalTimes(recordExecutedTime)).toEqual(
        executedTimes,
      );
    },
  );
});
