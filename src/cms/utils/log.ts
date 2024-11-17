export const log = {
  info: (...args: Array<unknown>) =>
    console.log(new Date().toISOString(), "\n", ...args),
  error: (...args: Array<unknown>) =>
    console.log(new Date().toISOString(), "\n", ...args),
  warn: (...args: Array<unknown>) =>
    console.log(new Date().toISOString(), "\n", ...args),
};
