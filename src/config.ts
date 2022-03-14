import convict from 'convict';

const configObject = convict({
  port: {
    doc: 'The application port',
    format: Number,
    default: 3000,
    env: 'PORT',
  },
  domainSwagger: {
    doc: 'Domain name for swagger.',
    format: String,
    default: 'localhost:3000',
    env: 'APP_DOMAIN_SWAGGER',
  },
  domain: {
    doc: 'Domain name.',
    format: String,
    default: 'http://localhost:3000',
    env: 'APP_DOMAIN',
  },
  database: {
    url: {
      doc: 'Database URL',
      format: String,
      default: 'postgresql://user:password@localhost:1432/db',
      env: 'DATABASE_URL',
    },
    databaseUseSSL: {
      doc: 'Use ssl when connecting',
      format: Boolean,
      default: false,
      env: 'DATABASE_USE_SSL',
    },
  },
  host: {
    doc: 'The application host',
    format: String,
    default: '0.0.0.0',
    env: 'HOST',
  },
  logger: {
    level: {
      doc: 'Defines the level of the logger.',
      format: String,
      default: 'debug',
      env: 'LOGGER_LEVEL',
    },
  },
  documentationEnabled: {
    doc: 'Enable /documentation endpoints',
    format: Boolean,
    default: true,
    env: 'DOCUMENTATION_ENABLED',
  },
  storage: {
    bucketName: {
      doc: 'Storage bucket name',
      format: String,
      default: 'sample-bucket',
      env: 'STORAGE_BUCKET_NAME',
    },
    accessKeyId: {
      doc: 'Storage access key id',
      format: String,
      default: 'key',
      env: 'AWS_ACCESS_KEY_ID',
    },
    secretAccessKey: {
      doc: 'Storage secret access key id',
      format: String,
      default: 'secret1337',
      env: 'AWS_SECRET_ACCESS_KEY',
    },
    region: {
      doc: 'Storage region',
      format: String,
      default: 'us-east-1',
      env: 'STORAGE_REGION',
    },
    url: {
      doc: 'Storage url',
      format: String,
      default: 'http://127.0.0.1:9000',
      env: 'STORAGE_URL',
    },
  },
  aws: {
    urlExpirationSeconds: {
      doc: 'URL expiration seconds',
      format: Number,
      default: 5 * 60,
      env: 'URL_EXPIRATION_SECONDS',
    },
    useMinIO: {
      doc: 'Use MinIO for local storage',
      format: Boolean,
      default: false,
      env: 'USE_MINIO',
    },
  },
});

configObject.validate({ allowed: 'warn' });

export const config = configObject.getProperties();
export type Config = typeof config;
