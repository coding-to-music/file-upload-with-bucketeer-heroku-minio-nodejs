import { Transaction } from './transaction';
import { PoolClient } from 'pg';

export interface TransactionService {
  begin(): Promise<Transaction>;
  poolClient: PoolClient;
}
