import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ErrorHandler } from '../error/error-handler';
import { ValidationError } from '../error/errors';

export const fastifyErrorHandlingMiddlewareFactory = ({
  errorHandler,
}: {
  errorHandler: ErrorHandler;
}): ((error: FastifyError, request: FastifyRequest, reply: FastifyReply) => void) => (err, _, res) => {
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
