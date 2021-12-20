export const promisify = (fn: (...args: any) => any | void) => {
  return new Promise((resolve, reject) => {
    try {
      const ret = fn();
      resolve(ret);
    } catch (e) {
      reject(e);
    }
  });
};

export const retry = (fn: () => any, retries = 2) => {
  let count = 0;
  while (count < retries) {
    try {
      return fn();
    } catch (e) {
      Utilities.sleep(1000);
      count++;
    }
  }
  throw new Error('Retry limit reached');
};
