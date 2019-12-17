import { JSONSchema4 } from 'json-schema';

export const listSchemaFactory = (itemSchema: JSONSchema4): JSONSchema4 => ({
  type: 'object',
  required: ['items', 'count'],
  additionalProperties: false,
  properties: {
    items: {
      type: 'array',
      items: itemSchema,
    },
    count: {
      type: 'number',
    },
  },
});
