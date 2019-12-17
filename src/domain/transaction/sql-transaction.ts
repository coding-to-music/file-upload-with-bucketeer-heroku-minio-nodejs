import { PoolClient } from 'pg';

import { Transaction } from './transaction';

export class SQLTransaction extends Transaction {
  constructor(private poolClient: PoolClient) {
    super();
  }

  async commit(): Promise<void> {
    await super.commit();
    await this.poolClient.query('COMMIT');
    this.poolClient.release();
  }

  async rollback(): Promise<void> {
    await super.rollback();
    await this.poolClient.query('ROLLBACK');
    this.poolClient.release();
  }
}
