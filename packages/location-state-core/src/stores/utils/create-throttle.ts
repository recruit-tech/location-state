export function createThrottle() {
  let delayExecutedCallback: (() => void) | null = null;
  let isThrottleRunning = false;

  return (callback: () => void) => {
    if (isThrottleRunning) {
      delayExecutedCallback = callback;
      return;
    }
    isThrottleRunning = true;
    // execute immediately on first call
    callback();
    handleTimeout(exponentialTimeout());
  };

  function handleTimeout(timeoutGenerator: Generator<number, unknown>) {
    const timeout = timeoutGenerator.next().value as number;
    // If over 1000ms and no delayExecutedCallback, stop the timer and reset the throttle.
    if (timeout === 1000 && !delayExecutedCallback) {
      isThrottleRunning = false;
      return;
    }
    if (delayExecutedCallback) {
      delayExecutedCallback();
      delayExecutedCallback = null;
    }
    setTimeout(() => handleTimeout(timeoutGenerator), timeout);
  }
}

function* exponentialTimeout() {
  yield* [50, 100, 200, 500];
  while (true) {
    yield 1000;
  }
}
