export class ExponentialBackoff {
  private backoffDelayGenerator: Generator<number, unknown> =
    backoffDelayGenerator();
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  run(callback: () => void) {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
    }
    this.timeoutId = setTimeout(() => {
      callback();
      this.clearBackOffDelay();
      this.timeoutId = null;
    }, this.delay());
  }

  private delay() {
    return this.backoffDelayGenerator.next().value as number;
  }

  private clearBackOffDelay() {
    this.backoffDelayGenerator = backoffDelayGenerator();
  }
}

function* backoffDelayGenerator() {
  yield* [50, 100, 200, 500];
  while (true) {
    yield 1000; // max delay
  }
}
