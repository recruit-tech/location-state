export function createThrottle() {
  let timeoutGenerator: Generator<number, unknown> | null = null;
  let delayExecutedCallback: (() => void) | null = null;

  function applyTimer() {
    const timeout = timeoutGenerator!.next().value as number;
    setTimeout(() => {
      // If less than 500 ms, continue timer.
      if (!delayExecutedCallback && timeout >= 500) {
        // reset the throttle
        timeoutGenerator = null;
        return;
      }

      if (delayExecutedCallback) {
        delayExecutedCallback();
        delayExecutedCallback = null;
      }
      applyTimer();
    }, timeout);
  }

  function inTimerRunning() {
    return timeoutGenerator !== null;
  }

  return (callback: () => void) => {
    if (inTimerRunning()) {
      delayExecutedCallback = callback;
      return;
    }
    // execute immediately
    callback();
    timeoutGenerator = exponentialTimeout();
    applyTimer();
  };
}

function* exponentialTimeout() {
  yield* [50, 100, 200, 500];
  while (true) {
    yield 1000;
  }
}
