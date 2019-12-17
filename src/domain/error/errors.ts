import { DetailedError } from './detailed-error';

export class Unauthorized extends Error {
  constructor() {
    super('UNAUTHORIZED');
  }
}

export class NotFoundError extends DetailedError {
  constructor(private entityName: string) {
    super('NOT_FOUND');
  }

  getDetails(): object {
    return {
      entityName: this.entityName,
    };
  }
}

export class ValidationError extends DetailedError {
  constructor(private errors: object) {
    super('VALIDATION_ERROR');
  }

  getDetails(): object {
    return { errors: this.errors };
  }
}
