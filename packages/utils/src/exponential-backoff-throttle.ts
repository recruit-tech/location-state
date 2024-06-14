export function createThrottle() {
  let timeoutGenerator: Generator<number, unknown> | null = null;
  let delayExecutedCallback: (() => void) | null = null;

  function applyTimer() {
    const nextTimeout = timeoutGenerator!.next();
    const timeout = (nextTimeout.value as number | undefined) ?? 1000;
    setTimeout(() => {
      if (!delayExecutedCallback && nextTimeout.done) {
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
}
