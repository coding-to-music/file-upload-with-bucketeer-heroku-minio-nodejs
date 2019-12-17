import { Logger } from '../logger/logger';
import { ErrorMapper } from './error-mapper';

export type ErrorHandler = (err: Error) => ReturnType<ErrorMapper>;

export const errorHandlerFactory = ({
  errorMapper,
  logger,
}: {
  errorMapper: ErrorMapper;
  logger: Logger;
}): ErrorHandler => err => {
  const errorParameters = errorMapper(err);

  if (errorParameters) {
    return errorParameters;
  }

  logger.error({ message: err, err });
  return null;
};
