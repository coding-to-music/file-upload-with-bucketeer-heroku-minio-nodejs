import { OpenAPIV3 } from 'openapi-types';

export const imageResponseOAComponent: OpenAPIV3.NonArraySchemaObject = {
  type: 'object',
  required: ['uploadURL'],
  properties: {
    uploadURL: { type: 'string' },
  },
};
