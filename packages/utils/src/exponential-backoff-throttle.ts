export function createThrottle() {
  let timeoutGenerator: Generator<number, unknown> = exponentialTimeout();
  let latestCallback: (() => void) | null = null;
  let isFirstRegister = true;

  function applyTimer() {
    const nextTimeout = timeoutGenerator.next();
    const timeout = (nextTimeout.value as number | undefined) ?? 500;
    setTimeout(() => {
      if (!latestCallback && nextTimeout.done) {
        // reset the throttle
        isFirstRegister = true;
        timeoutGenerator = exponentialTimeout();
        return;
      }

      if (latestCallback) {
        latestCallback();
        latestCallback = null;
      }
      applyTimer();
    }, timeout);
  }

  return (callback: () => void) => {
    latestCallback = callback;
    if (isFirstRegister) {
      applyTimer();
      isFirstRegister = false;
    }
  };
}

function* exponentialTimeout() {
  yield* [0, 50, 100, 200, 500];
}
