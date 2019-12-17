import { Endpoint } from '../domain/endpoint/endpoint';
import { EndpointMethods } from '../domain/endpoint/endpoint-methods';

export type GetStatusEndpointResponseBody = {
  status: 'ok';
  timestamp: number;
  version: string;
};
export type GetStatusEndpoint = Endpoint<{}, {}, {}, GetStatusEndpointResponseBody>;
export const statusEndpointFactory = ({ version }: { version: string }): GetStatusEndpoint => ({
  method: EndpointMethods.GET,
  route: '/status',
  handler: () => {
    return Promise.resolve({ body: { version, status: 'ok', timestamp: Date.now() }, status: 200 });
  },
  responseSchemas: {
    200: {
      type: 'object',
      additionalProperties: false,
      required: ['status', 'timestamp'],
      properties: {
        status: {
          type: 'string',
        },
        timestamp: {
          type: 'number',
        },
        version: {
          type: 'string',
        },
      },
    },
  },
});
