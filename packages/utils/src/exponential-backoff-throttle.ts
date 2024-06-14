export class ExponentialBackoffThrottle {
  private delayGenerator: Generator<number, unknown> = createExponentialDelay();
  private callback: (() => void) | null = null;
  private isFirstRegister = true;

  register(callback: () => void) {
    this.callback = callback;
    if (this.isFirstRegister) {
      this.next();
      this.isFirstRegister = false;
    }
  }

  private next() {
    const timeout = this.delayMs();
    setTimeout(() => {
      if (this.callback) {
        this.callback();
        this.callback = null;
        this.next();
      } else if (timeout === 1000) {
        this.isFirstRegister = true;
        this.delayGenerator = createExponentialDelay();
      } else {
        this.next();
      }
    }, timeout);
  }

  private delayMs() {
    return this.delayGenerator.next().value as number;
  }
}

function* createExponentialDelay() {
  yield* [0, 50, 100, 200, 500];
  while (true) {
    yield 1000; // max delay
  }
}
