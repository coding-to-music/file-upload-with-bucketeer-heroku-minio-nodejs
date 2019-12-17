/* eslint-disable @typescript-eslint/no-empty-function */
import { Logger } from './logger';

export const createLoggerForTest = (): Logger => {
  const logger = {
    info: () => {},
    error: () => {},
    fatal: () => {},
    debug: () => {},
    warn: () => {},
    child: () => logger,
  };
  return logger;
};
