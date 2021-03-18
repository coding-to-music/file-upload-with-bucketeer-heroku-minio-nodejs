import { OpenAPIV3 } from 'openapi-types';

export const detailedOAErrorResponse: OpenAPIV3.NonArraySchemaObject = {
  type: 'object',
  additionalProperties: false,
  description: 'handled error happened during the request',
  required: ['errorCode'],
  properties: {
    errorCode: { type: 'string' },
    details: { type: 'object' },
  },
};

export const baseOAErrorResponses: {
  [key: number]: OpenAPIV3.NonArraySchemaObject;
} = {
  403: {
    ...detailedOAErrorResponse,
    description: 'user is not authorized for the endpoint',
  },
  500: {
    ...detailedOAErrorResponse,
    description: 'not handled error happened',
  },
};

export const baseOAResponses: {
  [key: number]: OpenAPIV3.NonArraySchemaObject;
} = {
  204: {
    type: 'object',
  },
};
