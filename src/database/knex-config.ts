import { Config } from 'knex';
import { Logger } from '../framework/logger/logger';

export const knexConfig = ({
  schemaName,
  logger,
  connectionString,
  migrationDirectoryPath,
}: {
  schemaName?: string;
  logger: Logger;
  connectionString: string;
  migrationDirectoryPath: string;
}): Config => {
  return {
    client: 'pg',
    connection: connectionString,
    pool: { min: 0, max: 7 },
    migrations: {
      tableName: 'knex_migrations',
      directory: migrationDirectoryPath,
      schemaName: schemaName,
    },
    log: {
      warn: (msg) => logger.warn(msg),
      error: (msg) => logger.error(msg),
      debug: (msg) => logger.debug(msg),
      deprecate: (msg) => logger.warn(msg),
    },
  };
};
