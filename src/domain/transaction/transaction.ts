import { v4 } from 'uuid';

import { TransactionState } from './transaction-state';
import { TransactionAlreadyCommittedError, TransactionAlreadyRollbackedError } from './transaction-errors';

export abstract class Transaction {
  private state: TransactionState;
  private id = v4();

  constructor() {
    this.state = TransactionState.CREATED;
  }

  async commit(): Promise<void> {
    this.validate();
    this.state = TransactionState.COMMITTED;
    return Promise.resolve();
  }

  async rollback(): Promise<void> {
    this.validate();
    this.state = TransactionState.ROLLBACKED;
    return Promise.resolve();
  }

  private validate(): void {
    if (this.state === TransactionState.COMMITTED) {
      throw new TransactionAlreadyCommittedError(this.id);
    }

    if (this.state === TransactionState.ROLLBACKED) {
      throw new TransactionAlreadyRollbackedError(this.id);
    }
  }
}
