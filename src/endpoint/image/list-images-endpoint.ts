import { oaIDFactory } from '../../domain/+oa_components/oa-id.factory';
import { baseOAErrorResponses } from '../../domain/+oa_components/responses.oa-component';
import { Endpoint } from '../../domain/endpoint/endpoint';
import { EndpointMethods } from '../../domain/endpoint/endpoint-methods';
import { ImageListItemDTO } from '../../domain/image/image';
import { imageResponseOAComponent } from '../../domain/image/image.oa-component';
import { ListImagesUseCase } from '../../use-cases/image/list-images.use-case';
import { EmptyObject } from './../../framework/object-types/empty-object';

export type ListImageOutput = { items: ImageListItemDTO[]; count: number };

export type ListImageQuery = {
  skip?: string;
  limit?: string;
};

export const listImagesEndpointFactory = ({
  listImagesUseCase,
}: {
  listImagesUseCase: ListImagesUseCase;
}): Endpoint<EmptyObject, ListImageQuery, EmptyObject, EmptyObject, ListImageOutput> => ({
  method: EndpointMethods.GET,
  route: '/images',
  schema: {
    query: oaIDFactory(['skip', 'limit']),
    summary: 'This endpoint is responsible for listing the images',
    description: 'This endpoint returns an array of images',
    tags: ['Image'],
    response: {
      200: {
        type: 'object',
        required: ['count', 'items'],
        additionalProperties: false,
        properties: {
          totalCount: { type: 'number' },
          items: { type: 'array', items: imageResponseOAComponent },
        },
      },
      403: baseOAErrorResponses[403],
      500: baseOAErrorResponses[500],
    },
  },
  handler: async (request) => {
    const response = await listImagesUseCase({
      skip: parseInt(request.query?.skip || '0', 10) || 0,
      limit: parseInt(request.query?.limit || '10', 10) || 10,
    });
    return {
      status: 200,
      response,
    };
  },
});
