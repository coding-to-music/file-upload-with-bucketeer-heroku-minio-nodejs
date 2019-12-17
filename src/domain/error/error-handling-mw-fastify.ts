import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ServerResponse } from 'http';
import { ErrorHandler } from './error-handler';
import { ValidationError } from './errors';

export const errorHandlerMWFastifyFactory = ({
  errorHandler,
}: {
  errorHandler: ErrorHandler;
}): ((error: FastifyError, request: FastifyRequest, reply: FastifyReply<ServerResponse>) => void) => (err, _, res) => {
  const errorParameters = errorHandler(err.validation ? new ValidationError(err.validation) : err);
  if (errorParameters) {
    return res.status(errorParameters.status).send({
      errorCode: errorParameters.errorCode,
      ...(errorParameters.details ? { details: errorParameters.details } : {}),
    });
  }

  return res.status(500).send({
    errorCode: 'INTERNAL_SERVER_ERROR',
  });
};
