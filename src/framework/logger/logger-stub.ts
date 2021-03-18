import { Logger } from './logger';

export const loggerStubFactory = (): Logger => ({
  error: () => {
    return;
  },
  info: () => {
    return;
  },
  warn: () => {
    return;
  },
  debug: () => {
    return;
  },
  fatal: () => {
    return;
  },
});
