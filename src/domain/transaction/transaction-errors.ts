import { DetailedError } from '../error/detailed-error';

export class TransactionAlreadyCommittedError extends DetailedError {
  constructor(private id: string) {
    super('Transaction already committed');
  }

  getDetails(): object {
    return { id: this.id };
  }
}

export class TransactionAlreadyRollbackedError extends DetailedError {
  constructor(private id: string) {
    super('Transaction already rollbacked');
  }

  getDetails(): object {
    return { id: this.id };
  }
}
