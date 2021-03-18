import { DetailedError } from '../../framework/error/detailed-error';

export class TransactionAlreadyCommittedError extends DetailedError {
  constructor(private id: string) {
    super('Transaction already committed');
  }

  getDetails(): Record<string, unknown> {
    return { id: this.id };
  }
}

export class TransactionAlreadyRollbackedError extends DetailedError {
  constructor(private id: string) {
    super('Transaction already rollbacked');
  }

  getDetails(): Record<string, unknown> {
    return { id: this.id };
  }
}
