import { QueryResult } from 'pg';
import { TransactionService } from '../domain/transaction/transaction-service';

type RunQueryInput = { text: string; values: unknown[] };
export type RunQuery = (input: RunQueryInput) => Promise<QueryResult>;

export function createRunQuery(sqlTransactionService: TransactionService): RunQuery {
  return async ({ text, values }) => {
    return sqlTransactionService.poolClient.query(text, values);
  };
}
