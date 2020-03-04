import { config } from '../config';
import { knexConfig } from './knex-config';

module.exports = knexConfig({ connectionString: config.databaseURL, log: console.log });
