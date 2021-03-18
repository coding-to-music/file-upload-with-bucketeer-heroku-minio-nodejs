import { QueryResult } from 'pg';
import { TransactionService } from '../domain/transaction/transaction-service';

type RunQueryInput = { text: string; values: unknown[] };

export interface QueryService {
  run: <TRow>(input: RunQueryInput) => Promise<QueryResult<TRow>>;
}

export const queryServiceFactory = ({
  sqlTransactionService,
}: {
  sqlTransactionService: TransactionService;
}): QueryService => ({
  run: async ({ text, values }) => sqlTransactionService.poolClient.query(text, values),
});
