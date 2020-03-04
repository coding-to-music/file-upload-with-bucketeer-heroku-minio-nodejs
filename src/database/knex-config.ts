import { join } from 'path';
import { Config } from 'knex';

export const knexConfig = ({
  connectionString,
  schemaName,
  log,
}: {
  connectionString: string;
  schemaName?: string;
  log: (...msg: unknown[]) => void;
}): Config => ({
  client: 'pg',
  connection: connectionString,
  pool: { min: 0, max: 7 },
  migrations: {
    tableName: 'knex_migrations',
    directory: join(__dirname, './migrations'),
    schemaName: schemaName,
  },
  log: {
    warn: log.bind(null, 'warn'),
    error: log.bind(null, 'error'),
    deprecate: log.bind(null, 'deprecate'),
    debug: log.bind(null, 'debug'),
  },
});
