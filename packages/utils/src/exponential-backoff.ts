export class ExponentialBackoff {
  private backOffDelayGenerator: Generator<number, never> =
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
    return this.backOffDelayGenerator.next().value;
  }

  private clearBackOffDelay() {
    this.backOffDelayGenerator = backOffDelayGenerator();
  }
}

function* backOffDelayGenerator(): Generator<number, never> {
  yield 200;
  yield 400;
  yield 600;
  yield 800;
  while (true) {
    yield 1000;
  }
}
