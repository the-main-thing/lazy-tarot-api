export const log = {
  info: (...args: Array<unknown>) =>
    console.log(new Date().toISOString(), "\n", ...args),
  error: (...args: Array<unknown>) =>
    console.error(new Date().toISOString(), "\n", ...args),
  warn: (...args: Array<unknown>) =>
    console.warn(new Date().toISOString(), "\n", ...args),
};
