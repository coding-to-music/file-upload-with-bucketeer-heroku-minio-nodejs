import * as AWS from 'aws-sdk';
import { OpenAPIV3 } from 'openapi-types';
import { Pool } from 'pg';
import { version } from '../package.json';
import { Config } from './config';
import { queryServiceFactory } from './database/run-query-service';
import { Endpoint } from './domain/endpoint/endpoint';
import { Logger } from './domain/logger/logger';
import { statusOATag } from './domain/oa-tag/status.oa-tag';
import { sqlTransactionServiceFactory } from './domain/transaction/sql-transaction-service';
import { statusEndpointFactory } from './endpoint/get-status-endpoint';
import { errorHandlerFactory } from './framework/error/error-handler';
import { errorMapper } from './framework/error/error-mapper';
import { fastifyServerFactory } from './framework/fastify/fastify-server.factory';
import { fastifySwaggerFactory } from './framework/fastify/fastify-swagger.factory';
import { gracefulWrapperHTTPFactory, stopGracefully } from './framework/graceful/graceful-stop';
import { s3ServiceS3Factory } from './framework/storage/storage-service-s3';

export const start = async ({ config, logger }: { config: Config; logger: Logger }): Promise<void> => {
  const pool = new Pool({
    connectionString: config.database.url,
    ...(config.database.databaseUseSSL ? { ssl: { requestCert: true, rejectUnauthorized: false } } : {}),
  });
  const sqlTransactionService = sqlTransactionServiceFactory({ pool });
  const queryService = queryServiceFactory({ sqlTransactionService });

  AWS.config.update({
    accessKeyId: config.storage.accessKeyId,
    secretAccessKey: config.storage.secretAccessKey,
    region: config.storage.region,
  });

  const s3 = new AWS.S3();

  const storageService = s3ServiceS3Factory({ s3, urlExpirationSeconds: config.aws.urlExpirationSeconds });
  await storageService.createPublicBucketIfNotExists(config.storage.bucketName);

  const statusEndpoint = statusEndpointFactory({ version });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const endpoints = [statusEndpoint];

  const securityRequirementObjects: OpenAPIV3.SecurityRequirementObject[] = [
    {
      bearerToken: [],
    },
  ];

  const components: OpenAPIV3.ComponentsObject = {
    schemas: {},
    securitySchemes: {
      bearerToken: {
        type: 'http',
        scheme: 'bearer',
      },
    },
  };

  const tags = [statusOATag];

  const swaggerOptions = fastifySwaggerFactory({
    tags,
    components,
    security: securityRequirementObjects,
    host: config.domainSwagger,
  });

  const server = await fastifyServerFactory({
    swaggerOptions,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    endpoints: (endpoints as unknown) as Endpoint[],
    logger,
    allowedOrigins: [],
    errorHandler: errorHandlerFactory({
      logger,
      errorMapper: errorMapper,
    }),
  });

  await server.listen(config.port, '0.0.0.0');
  logger.info(`app listening on port ${config.port}`);
  await server.oas();

  const gracefulHTTP = gracefulWrapperHTTPFactory(server.server, 1000);
  stopGracefully({
    gracefulWrappers: [gracefulHTTP],
    processSignals: ['SIGINT', 'SIGTERM'],
    timeout: 3000,
    onShutdownStart: () => logger.info('shutting down gracefully'),
    onShutdownGracefulFail: () => logger.fatal('could not shut down gracefully'),
    onShutdownGracefulSuccess: () => logger.info('shut down gracefully'),
  });
};
