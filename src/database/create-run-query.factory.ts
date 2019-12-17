import { createSQLTransactionServiceForTest } from '../domain/transaction/sql-transaction-service.factory';
import { createRunQuery, RunQuery } from './create-run-query';

export const createRunQueryForTest = ({ transactionService = createSQLTransactionServiceForTest() } = {}): RunQuery =>
  createRunQuery(transactionService);
