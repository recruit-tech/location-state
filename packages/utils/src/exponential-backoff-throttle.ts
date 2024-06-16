export function createThrottle() {
  let delayExecutedCallback: (() => void) | null = null;
  let inTimerRunning = false;

  function handleTimeout(timeoutGenerator: Generator<number, unknown>) {
    const timeout = timeoutGenerator!.next().value as number;
    // If over 1000ms and no delayExecutedCallback, stop the timer and reset the throttle.
    if (timeout === 1000 && !delayExecutedCallback) {
      inTimerRunning = false;
      return;
    }
    if (delayExecutedCallback) {
      delayExecutedCallback();
      delayExecutedCallback = null;
    }
    setTimeout(() => handleTimeout(timeoutGenerator), timeout);
  }

  return (callback: () => void) => {
    if (inTimerRunning) {
      delayExecutedCallback = callback;
      return;
    }
    // execute immediately on first call
    callback();
    inTimerRunning = true;
    handleTimeout(exponentialTimeout());
  };
}

function* exponentialTimeout() {
  yield* [50, 100, 200, 500];
  while (true) {
    yield 1000;
  }
}
