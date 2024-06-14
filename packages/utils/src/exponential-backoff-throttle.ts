export function createThrottle() {
  let delayGenerator: Generator<number, unknown> = exponentialDelay();
  let latestCallback: (() => void) | null = null;
  let isFirstRegister = true;

  function applyTimer() {
    const timeoutResult = delayGenerator.next();
    const timeout = (timeoutResult.value as number | undefined) ?? 1000;
    setTimeout(() => {
      if (!latestCallback && timeoutResult.done) {
        // reset the throttle
        isFirstRegister = true;
        delayGenerator = exponentialDelay();
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

function* exponentialDelay() {
  yield* [0, 50, 100, 200, 500];
}
