import { ValidationResult } from 'fastify-error';
import { DetailedError } from './detailed-error';
import { ErrorCode } from './error-code';

export class Unauthorized extends Error {
  constructor() {
    super(ErrorCode.UNAUTHORIZED);
  }
}

export class NotFoundError extends DetailedError {
  constructor(private entityName: string) {
    super(ErrorCode.NOT_FOUND);
  }

  getDetails(): Record<string, unknown> {
    return {
      entityName: this.entityName,
    };
  }
}

export class ValidationError extends DetailedError {
  constructor(private errors: ValidationResult[]) {
    super(ErrorCode.VALIDATION_ERROR);
  }

  getDetails(): Record<string, unknown> {
    return { errors: this.errors };
  }
}
