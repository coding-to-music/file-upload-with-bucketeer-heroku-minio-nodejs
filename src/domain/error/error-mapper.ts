import { DetailedError, isDetailedError } from './detailed-error';
import { NotFoundError, Unauthorized, ValidationError } from './errors';

type ErrorHandler = (message: string, details?: object) => MappedError;

export type MappedError = {
  status: number;
  errorCode: string;
  details?: object;
};

type ErrorMap = {
  errorHandler: ErrorHandler;
  errors: unknown[];
}[];

export type ErrorMapper = (err: Error) => MappedError | null;

const errorMap: ErrorMap = [
  {
    errorHandler: (errorCode: string, details?: object) => ({
      errorCode,
      status: 401,
      ...(details ? { details } : {}),
    }),
    errors: [Unauthorized],
  },

  {
    errorHandler: (errorCode: string, details?: object) => ({
      errorCode,
      status: 400,
      ...(details ? { details } : {}),
    }),
    errors: [ValidationError],
  },

  {
    errorHandler: (errorCode: string, details?: object) => ({
      errorCode,
      status: 404,
      ...(details ? { details } : {}),
    }),
    errors: [NotFoundError],
  },
];

export const errorMapper = (err: Error | DetailedError): MappedError | null => {
  const mappedError = errorMap.find(e => e.errors.includes(err.constructor));
  if (!mappedError) {
    return null;
  }

  return mappedError.errorHandler(err.message, isDetailedError(err) ? err.getDetails() : undefined);
};
