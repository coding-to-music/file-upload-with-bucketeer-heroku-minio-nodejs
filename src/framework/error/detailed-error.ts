export abstract class DetailedError extends Error {
  abstract getDetails(): Record<string, unknown>;
}

export const isDetailedError = (err: Error | DetailedError): err is DetailedError =>
  (err as DetailedError).getDetails && !!(err as DetailedError).getDetails();
