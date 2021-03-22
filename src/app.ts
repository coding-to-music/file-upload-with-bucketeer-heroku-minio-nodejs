import * as AWS from 'aws-sdk';
import { OpenAPIV3 } from 'openapi-types';
import { Pool } from 'pg';
import { Config } from './config';
import { queryServiceFactory } from './database/run-query-service';
import { Endpoint } from './domain/endpoint/endpoint';
import { imageRepoSQLFactory } from './domain/image/image-repo-sql';
import { imageServiceFactory } from './domain/image/image-service';
import { statusOATag } from './domain/oa-tag/status.oa-tag';
import { sqlTransactionServiceFactory } from './domain/transaction/sql-transaction-service';
import { transactedUseCaseFactory } from './domain/transaction/transaction-use-case';
import { statusEndpointFactory } from './endpoint/get-status-endpoint';
import { addImageEndpointFactory } from './endpoint/image/add-image-endpoint';
import { imageGetURLEndpointFactory } from './endpoint/image/image-get-url-endpoint';
import { listImagesEndpointFactory } from './endpoint/image/list-images-endpoint';
import { errorHandlerFactory } from './framework/error/error-handler';
import { errorMapper } from './framework/error/error-mapper';
import { fastifyServerFactory } from './framework/fastify/fastify-server.factory';
import { fastifySwaggerFactory } from './framework/fastify/fastify-swagger.factory';
import { gracefulWrapperHTTPFactory, stopGracefully } from './framework/graceful/graceful-stop';
import { Logger } from './framework/logger/logger';
import { s3ServiceS3Factory } from './framework/storage/storage-service-s3';
import { addImageUseCaseFactory } from './use-cases/image/add-image.use-case';
import { imageGetURLUseCaseFactory } from './use-cases/image/image-get-url.use-case';
import { listImagesUseCaseFactory } from './use-cases/image/list-images.use-case';

export const start = async ({ config, logger }: { config: Config; logger: Logger }): Promise<void> => {
  const pool = new Pool({
    connectionString: config.database.url,
    ...(config.database.databaseUseSSL ? { ssl: { requestCert: true, rejectUnauthorized: false } } : {}),
  });
  const sqlTransactionService = sqlTransactionServiceFactory({ pool });
  const queryService = queryServiceFactory({ sqlTransactionService });

  const s3 = new AWS.S3({
    accessKeyId: config.storage.accessKeyId,
    secretAccessKey: config.storage.secretAccessKey,
    // region: config.storage.region,
    s3ForcePathStyle: true, // needed with minio?
    signatureVersion: 'v4',
    endpoint: new AWS.Endpoint(config.storage.url).href,
    sslEnabled: false,
  });

  const imageRepo = imageRepoSQLFactory({ queryService });

  const storageService = s3ServiceS3Factory({ s3, urlExpirationSeconds: config.aws.urlExpirationSeconds });
  await storageService.createPublicBucketIfNotExists(config.storage.bucketName);
  const transactionService = sqlTransactionServiceFactory({ pool });

  const imageService = imageServiceFactory({ imageRepo });

  const statusEndpoint = statusEndpointFactory();

  const imageGetUrlEndpoint = imageGetURLEndpointFactory({
    imageGetURLUseCase: transactedUseCaseFactory({
      useCase: imageGetURLUseCaseFactory({
        bucketName: config.storage.bucketName,
        storageService,
      }),
      transactionService,
    }),
  });

  const listImagesEndpoint = listImagesEndpointFactory({
    listImagesUseCase: transactedUseCaseFactory({
      useCase: listImagesUseCaseFactory({
        imageService,
      }),
      transactionService,
    }),
  });

  const addImageEndpoint = addImageEndpointFactory({
    addImageUseCase: transactedUseCaseFactory({
      useCase: addImageUseCaseFactory({
        imageService,
      }),
      transactionService,
    }),
  });

  const endpoints = [statusEndpoint, imageGetUrlEndpoint, listImagesEndpoint, addImageEndpoint];

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
