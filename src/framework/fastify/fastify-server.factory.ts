import fastify, { FastifyInstance, FastifyReply, FastifyRequest, RouteOptions } from 'fastify';
import fastifyCors from 'fastify-cors';
import oas, { FastifyOASOptions } from 'fastify-oas';
import { Endpoint } from '../../domain/endpoint/endpoint';
import { ErrorCode } from '../error/error-code';
import { ErrorHandler } from '../error/error-handler';
import { Logger } from '../logger/logger';
import { RecordType } from '../object-types/record-type';
import { fastifyErrorHandlingMiddlewareFactory } from './fastify-error-mw.factory';

type FastifyFactoryArgs = {
  endpoints: Endpoint[];
  swaggerOptions: FastifyOASOptions;
  logger: Logger;
  allowedOrigins: (string | RegExp)[];
  errorHandler: ErrorHandler;
};
export const fastifyServerFactory = async (factoryArgs: FastifyFactoryArgs): Promise<FastifyInstance> => {
  const fastifyServer = fastify({
    logger: false,
  });

  await fastifyServer.register(fastifyCors, {
    origin: factoryArgs.allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  await fastifyServer.register(oas, factoryArgs.swaggerOptions);
  fastifyServer.setErrorHandler(
    fastifyErrorHandlingMiddlewareFactory({
      errorHandler: factoryArgs.errorHandler,
    }),
  );
  fastifyServer.setNotFoundHandler((_, reply) => {
    void reply.status(404).send({ errorCode: ErrorCode.NOT_FOUND });
  });

  const wrappedFastifyHandler = (endpointHandler: Endpoint['handler']) => async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const endpointResult = await endpointHandler({
      headers: request.headers,
      query: request.query as Record<string, string>,
      params: request.params as Record<string, string>,
      body: request.body as RecordType | RecordType[],
    });
    factoryArgs.logger.info({ request: request.body, response: endpointResult });
    return reply
      .status(endpointResult.status)
      .headers(endpointResult.headers || {})
      .send(endpointResult.response);
  };

  factoryArgs.endpoints.forEach((endpoint) => {
    const fastifyRouteOptions: RouteOptions = {
      method: endpoint.method,
      url: endpoint.route,
      schema: endpoint.schema,
      handler: wrappedFastifyHandler(endpoint.handler),
    };
    fastifyServer.route(fastifyRouteOptions);
  });

  return fastifyServer;
};
