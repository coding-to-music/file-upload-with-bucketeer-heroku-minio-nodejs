import { baseOAErrorResponses } from '../../domain/+oa_components/responses.oa-component';
import { Endpoint } from '../../domain/endpoint/endpoint';
import { EndpointMethods } from '../../domain/endpoint/endpoint-methods';
import { AddImageInputDTO } from '../../domain/image/image';
import { EmptyObject } from '../../framework/object-types/empty-object';
import { AddImageUseCase } from '../../use-cases/image/add-image.use-case';

export type AddImageInput = AddImageInputDTO;

export const addImageEndpointFactory = ({
  addImageUseCase,
}: {
  addImageUseCase: AddImageUseCase;
}): Endpoint<EmptyObject, EmptyObject, EmptyObject, AddImageInput, EmptyObject> => ({
  method: EndpointMethods.POST,
  route: '/image-add',
  schema: {
    summary: 'This endpoint is responsible for adding an image',
    description: 'Saves the new image',
    tags: ['Image'],
    response: {
      200: { type: 'object' },
      403: baseOAErrorResponses[403],
      500: baseOAErrorResponses[500],
    },
  },
  handler: async (request) => {
    await addImageUseCase(request.body);

    return { status: 200, response: {} };
  },
});
