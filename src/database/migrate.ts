import Knex from 'knex';
import { config } from '../config';
import { knexConfig } from './knex-config';
import { handleUnhandledRejections } from '../framework/unhandled-rejection/rejection-handler';

export const migrate = async (opts: {
  dbConnectionString: string;
  drop: boolean;
  log: (...msg: unknown[]) => void;
  schema?: string;
}): Promise<void> => {
  const knex = Knex(knexConfig({ connectionString: opts.dbConnectionString, schemaName: opts.schema, log: opts.log }));

  try {
    if (opts.drop) {
      await knex.migrate.rollback({}, true);
    } else {
      await knex.migrate.latest();
    }
    opts.log('Migration successful');
  } finally {
    await knex.destroy();
  }
};

if (!module.parent) {
  handleUnhandledRejections();
  migrate({
    dbConnectionString: config.databaseURL,
    drop: process.argv.includes('--drop'),
    log: console.log,
  });
}
