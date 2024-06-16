export function createThrottle() {
  let timeoutGenerator: Generator<number, unknown> | null = null;
  let delayExecutedCallback: (() => void) | null = null;

  function handleTimeout() {
    const timeout = timeoutGenerator!.next().value as number;
    // If over 1000ms and no delayExecutedCallback, stop the timer and reset the throttle.
    if (timeout === 1000 && !delayExecutedCallback) {
      timeoutGenerator = null;
      return;
    }
    if (delayExecutedCallback) {
      delayExecutedCallback();
      delayExecutedCallback = null;
    }
    setTimeout(handleTimeout, timeout);
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
    handleTimeout();
  };
}

function* exponentialTimeout() {
  yield* [50, 100, 200, 500];
  while (true) {
    yield 1000;
  }
}
