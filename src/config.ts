import convict from 'convict';

const configObject = convict({
  port: {
    doc: 'The application port',
    format: Number,
    default: 1337,
    env: 'PORT',
  },
  host: {
    doc: 'The application host',
    format: String,
    default: '0.0.0.0',
    env: 'HOST',
  },
  documentationEnabled: {
    doc: 'Enable /documentation endpoints',
    format: Boolean,
    default: true,
    env: 'DOCUMENTATION_ENABLED',
  },
  logLevel: {
    doc: 'The log level of the application',
    format: String,
    default: 'debug',
    env: 'LOG_LEVEL',
  },
});

configObject.validate({ allowed: 'warn' });

export const config = configObject.getProperties();
export type Config = typeof config;
