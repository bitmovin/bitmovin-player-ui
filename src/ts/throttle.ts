/**
 * Returns a new function which will invocate the original no faster
 * then every rateMs milliseconds.
 */
export function throttle(fn: Function, rateMs: number) {
   let timerFlag : null | ReturnType<typeof setTimeout> = null;

   return (...args: unknown[]) => {
      if (timerFlag === null) {
         fn(...args);
         timerFlag = setTimeout(() => {
            timerFlag = null;
         }, rateMs);
      }
   };
}

