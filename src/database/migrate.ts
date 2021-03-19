import Knex from 'knex';
import { join } from 'path';
import { config } from '../config';
import { Logger } from '../framework/logger/logger';
import { loggerPinoFactory } from '../framework/logger/logger-pino';
import { handleUnhandledRejections, throwToGlobal } from '../framework/unhandled-rejection/rejection-handler';
import { knexConfig } from './knex-config';

export const migrate = async ({
  drop,
  logger,
  schemaName,
  migrationDirectoryPath,
  connectionString,
}: {
  drop: boolean;
  logger: Logger;
  schemaName?: string;
  migrationDirectoryPath: string;
  connectionString: string;
}): Promise<void> => {
  const knex = Knex(knexConfig({ schemaName, logger, migrationDirectoryPath, connectionString }));

  try {
    if (drop) {
      await knex.migrate.rollback({}, true);
    } else {
      await knex.migrate.latest();
    }
    logger.info('Migration successful');
  } finally {
    await knex.destroy();
  }
};

if (!module.parent) {
  const logger = loggerPinoFactory({ level: 'debug', name: 'migration', version: '1.0' });

  handleUnhandledRejections();

  migrate({
    drop: process.argv.includes('--drop'),
    logger,
    migrationDirectoryPath: join(__dirname, './migrations'),
    connectionString: config.database.url,
    ...(config.database.databaseUseSSL ? { ssl: true } : {}),
  }).catch(throwToGlobal);
}
