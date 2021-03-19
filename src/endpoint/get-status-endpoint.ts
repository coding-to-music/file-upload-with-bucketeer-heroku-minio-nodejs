import { baseOAErrorResponses } from '../domain/+oa_components/responses.oa-component';
import { Endpoint } from '../domain/endpoint/endpoint';
import { EndpointMethods } from '../domain/endpoint/endpoint-methods';
import { statusOATag } from '../domain/oa-tag/status.oa-tag';
import { EmptyObject } from '../framework/object-types/empty-object';

type Response = {
  status: string;
};

export const statusEndpointFactory = (): Endpoint<EmptyObject, EmptyObject, EmptyObject, EmptyObject, Response> => ({
  method: EndpointMethods.GET,
  route: '/status',
  schema: {
    summary: 'This endpoint is responsible for returning the status of the API',
    description: 'This endpoint can only return status: ok or internal server error',
    tags: [statusOATag.name],
    response: {
      200: {
        type: 'object',
        description: 'API status is ok!',
        required: ['status'],
        additionalProperties: false,
        properties: {
          status: { type: 'string' },
        },
      },
      500: baseOAErrorResponses[500],
    },
  },
  handler: async () => ({
    status: 200,
    response: {
      status: 'ok',
    },
  }),
});
