import { start } from './app';
import { config } from './config';
import { loggerPinoFactory } from './framework/logger/logger-pino';

const thrower = (err: unknown): void => {
  throw err;
};

const throwToGlobal = (err: unknown): NodeJS.Immediate => setImmediate(() => thrower(err));

const startApp = async (): Promise<void> => {
  const logger = loggerPinoFactory({
    name: 'fastify-backend',
    version: '1.0.0',
    level: config.logger.level,
  });

  await start({ logger, config });
};

startApp().catch(throwToGlobal);
