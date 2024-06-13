export class ExponentialBackoffThrottle {
  private delayGenerator: Generator<number, unknown> = createExponentialDelay();
  private isFirstCall = true;
  private callback: (() => void) | null = null;
  private delayCallId: ReturnType<typeof setTimeout> | null = null;
  private resetRequestId: ReturnType<typeof setTimeout> | null = null;
  private readonly resetTimeout: number;

  constructor({
    resetTimeout,
  }:
    | {
        resetTimeout?: number;
      }
    | undefined = {}) {
    this.resetTimeout = resetTimeout || 1000;
  }

  register(callback: () => void) {
    if (this.callback) {
      this.isFirstCall = false;
    }

    this.callback = callback;
    if (this.isFirstCall) {
      this.callback();
    } else {
      this.cancelResetRequest();
    }

    // Execute after delay.
    if (this.delayCallId === null) {
      this.delayCallId = setTimeout(() => {
        if (!this.isFirstCall) {
          this.callback!();
        }
        this.delayCallId = null;
      }, this.delayMs());
      this.resetRequest();
    }
  }

  private delayMs() {
    return this.delayGenerator.next().value as number;
  }

  private resetRequest() {
    this.resetRequestId = setTimeout(() => {
      this.callback = null;
      this.delayGenerator = createExponentialDelay();
    }, this.resetTimeout);
  }

  private cancelResetRequest() {
    this.resetRequestId && clearTimeout(this.resetRequestId);
    this.resetRequestId = null;
  }
}

function* createExponentialDelay() {
  yield* [50, 100, 200, 500];
  while (true) {
    yield 1000; // max delay
  }
}
