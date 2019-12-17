import fastify, { FastifyInstance } from 'fastify';
import oas from 'fastify-oas';
import { description, name, version } from '../package.json';
import { config } from './config';
import { Endpoint } from './domain/endpoint/endpoint';
import { registerEndpoint } from './domain/endpoint/endpoint-register-fastify';
import { errorHandlerFactory } from './domain/error/error-handler';
import { errorHandlerMWFastifyFactory } from './domain/error/error-handling-mw-fastify';
import { errorMapper } from './domain/error/error-mapper';
import { Logger } from './domain/logger/logger';
import { statusEndpointFactory } from './endpoint/get-status-endpoint';

export const getApp = async ({ logger }: { logger: Logger }): Promise<FastifyInstance> => {
  const app = fastify({
    logger,
  });
  const errorHandler = errorHandlerFactory({ logger, errorMapper });

  app.register(oas, {
    routePrefix: '/documentation',
    addModels: true,
    exposeRoute: config.documentationEnabled,
    swagger: {
      info: {
        title: name,
        version,
        description,
      },
      externalDocs: {
        url: 'https://swagger.io',
        description: 'Find more info here',
      },
      securitySchemes: {
        bearerToken: {
          type: 'http',
          scheme: 'bearer',
        },
      },
      consumes: ['application/json'],
      produces: ['application/json'],
    },
  });
  app.ready(err => {
    if (err) {
      throw err;
    }
    app.oas();
  });
  app.setErrorHandler(errorHandlerMWFastifyFactory({ errorHandler }));
  app.setNotFoundHandler((_, resp) => resp.status(404).send({ errorCode: 'NOT_FOUND' }));

  const statusEndpoint = statusEndpointFactory({ version });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const endpoints: Endpoint<any, any, any, any>[] = [statusEndpoint];

  endpoints.forEach(endpoint => registerEndpoint(app, endpoint));

  return app;
};
