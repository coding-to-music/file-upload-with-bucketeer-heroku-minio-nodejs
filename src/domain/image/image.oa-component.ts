import { OpenAPIV3 } from 'openapi-types';

export const imageResponseOAComponent: OpenAPIV3.NonArraySchemaObject = {
  type: 'object',
  required: ['uploadURL'],
  properties: {
    uploadURL: { type: 'string' },
  },
};

export const imagesItemResponseOAComponent: OpenAPIV3.NonArraySchemaObject = {
  type: 'object',
  required: ['imageURL', 'title'],
  properties: {
    imageURL: { type: 'string' },
    title: { type: 'string' },
    createdAt: { type: 'string' },
    id: { type: 'string' },
  },
};
