export function createDebounce() {
  let timeoutId: number | NodeJS.Timeout | null = null;

  return (callback: () => void, delay: number) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      callback();
      timeoutId = null;
    }, delay);
  };
}
