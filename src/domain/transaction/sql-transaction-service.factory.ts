import { Pool } from 'pg';
import { TransactionService } from './transaction-service';
import { sqlTransactionServiceFactory } from './sql-transaction-service';

export const createSQLTransactionServiceForTest = (): TransactionService =>
  sqlTransactionServiceFactory({ pool: new Pool() });
