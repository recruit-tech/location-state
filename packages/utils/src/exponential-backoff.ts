export class ExponentialBackoff {
  private backOffDelayGenerator: Generator<number, unknown> =
    backOffDelayGenerator();
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  run(callback: () => void) {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
    }
    this.timeoutId = setTimeout(() => {
      callback();
      this.clearBackOffDelay();
    }, this.delay());
  }

  private delay() {
    return this.backOffDelayGenerator.next().value as number;
  }

  private clearBackOffDelay() {
    this.backOffDelayGenerator = backOffDelayGenerator();
  }
}

function* backOffDelayGenerator() {
  yield* [50, 100, 200, 500];
  while (true) {
    yield 1000; // max delay
  }
}
