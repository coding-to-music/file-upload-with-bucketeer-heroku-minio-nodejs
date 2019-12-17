import * as Knex from 'knex';
import { join } from 'path';
import { readSQL } from './utils/read-file';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(await readSQL(join(__dirname, './sql/1576594958575.do.sql')));
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(await readSQL(join(__dirname, './sql/1576594958575.undo.sql')));
}
