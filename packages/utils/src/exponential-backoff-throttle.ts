export class ExponentialBackoffThrottle {
  private delayGenerator: Generator<number, unknown> = createExponentialDelay();
  private callback: (() => void) | null = null;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private isFirstRegister = true;

  register(callback: () => void) {
    this.callback = callback;
    if (this.isFirstRegister) {
      this.next();
      this.isFirstRegister = false;
    } else if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
      // re start timer.
      this.next();
    }
  }

  private next() {
    setTimeout(() => {
      if (this.callback) {
        this.callback();
        this.callback = null;
        this.next();
      } else {
        this.waitRegisterUntilTimeout();
      }
    }, this.delayMs());
  }

  private delayMs() {
    return this.delayGenerator.next().value as number;
  }

  private waitRegisterUntilTimeout() {
    this.timeoutId = setTimeout(() => {
      this.isFirstRegister = true;
      this.delayGenerator = createExponentialDelay();
    }, 1000);
  }
}

function* createExponentialDelay() {
  yield* [0, 50, 100, 200, 500];
  while (true) {
    yield 1000; // max delay
  }
}
