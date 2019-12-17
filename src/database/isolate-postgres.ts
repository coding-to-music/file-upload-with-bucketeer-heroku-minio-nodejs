import { Pool, PoolClient } from 'pg';
import { parse as pgConnectionString } from 'pg-connection-string';
import pgDatabaseUrl from 'pg-database-url';
import { v4 } from 'uuid';
import { config } from '../config';
import { migrate } from './migrate';

interface PostgresIsolation {
  pool: Pool;
  name: string;
  dbConnectionString: string;
  cleanup(): Promise<void>;
}

const createIsolation = async (): Promise<PostgresIsolation> => {
  const rootPool = new Pool({ connectionString: config.databaseURL });
  const rootPoolClient = await rootPool.connect();
  const runQuery = async (query: string): Promise<void> => {
    await rootPoolClient.query(query);
  };

  const name = `test_${v4().replace(/-/g, '')}`;
  const password = v4().replace(/-/g, '');

  await runQuery(`
    CREATE SCHEMA ${name};
    CREATE USER ${name} WITH PASSWORD '${password}';
    ALTER USER ${name} WITH SUPERUSER;
    ALTER USER ${name} SET search_path to ${name};
  `);

  const rootConnectionData = pgConnectionString(config.databaseURL);
  const dbConnectionString = pgDatabaseUrl({
    ...rootConnectionData,
    password,
    username: name,
  });
  const pool = new Pool({
    connectionString: dbConnectionString,
  });
  const cleanup = async (): Promise<void> => {
    await pool.end();
    await runQuery(`
      DROP SCHEMA ${name} CASCADE;
      DROP USER ${name};
    `);
    rootPoolClient.release();
    await rootPool.end();
  };

  return {
    name,
    pool,
    cleanup,
    dbConnectionString,
  };
};

export const withIsolatedDB = (opts: { migrate: boolean }): { getIsolation: () => PostgresIsolation } => {
  let poolClient: PoolClient;
  let isolation: PostgresIsolation;
  beforeAll(async () => {
    try {
      isolation = await createIsolation();
      if (opts.migrate) {
        await migrate({
          dbConnectionString: isolation.dbConnectionString,
          drop: false,
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          log: () => {},
          schema: isolation.name,
        });
      }
      poolClient = await isolation.pool.connect();
    } catch (err) {
      console.error('isolate-postgres:withIsolatedDB:beforeAll', err);
      throw err;
    }
  });

  afterAll(async () => {
    poolClient?.release();
    await isolation.cleanup();
  });

  const getIsolation = (): PostgresIsolation => {
    if (!isolation) {
      throw new Error('withIsolatedDB init failed');
    }
    return isolation;
  };
  return {
    getIsolation,
  };
};
