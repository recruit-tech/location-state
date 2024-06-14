export function createThrottle() {
  let timeoutGenerator: Generator<number, unknown> = exponentialTimeout();
  let delayExecutedCallback: (() => void) | null = null;
  let inRunningTimer = true;

  function applyTimer() {
    const nextTimeout = timeoutGenerator.next();
    const timeout = (nextTimeout.value as number | undefined) ?? 500;
    setTimeout(() => {
      if (!delayExecutedCallback && nextTimeout.done) {
        // reset the throttle
        inRunningTimer = true;
        timeoutGenerator = exponentialTimeout();
        return;
      }

      if (delayExecutedCallback) {
        delayExecutedCallback();
        delayExecutedCallback = null;
      }
      applyTimer();
    }, timeout);
  }

  return (callback: () => void) => {
    if (inRunningTimer) {
      // execute immediately
      callback();
      applyTimer();
      inRunningTimer = false;
    } else {
      delayExecutedCallback = callback;
    }
  };
}

function* exponentialTimeout() {
  yield* [50, 100, 200, 500];
}
