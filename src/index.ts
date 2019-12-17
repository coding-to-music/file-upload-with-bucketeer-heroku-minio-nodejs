import { name, version } from '../package.json';
import { getApp } from './app';
import { config } from './config';
import { loggerFactoryPino } from './domain/logger/logger-pino';
import { gracefulWrapperHTTPFactory, stopGracefully } from './framework/graceful/graceful-stop';
import { handleUnhandledRejections } from './framework/unhandled-rejection/rejection-handler';

if (!module.parent) {
  handleUnhandledRejections();
  const main = async (): Promise<void> => {
    const logger = loggerFactoryPino({ level: config.logLevel, name, version });
    const app = await getApp({ logger });

    const gracefulHTTP = gracefulWrapperHTTPFactory(app, 1000);
    stopGracefully({
      gracefulWrappers: [gracefulHTTP],
      processSignals: ['SIGINT', 'SIGTERM'],
      timeout: 3000,
      onShutdownStart: () => logger.info('shutting down gracefully'),
      onShutdownGracefulFail: () => logger.fatal('could not shut down gracefully'),
      onShutdownGracefulSuccess: () => logger.info('shut down gracefully'),
    });

    app.listen(config.port, config.host);
  };
  main();
}
