import { baseOAErrorResponses } from '../../domain/+oa_components/responses.oa-component';
import { Endpoint } from '../../domain/endpoint/endpoint';
import { EndpointMethods } from '../../domain/endpoint/endpoint-methods';
import { imageResponseOAComponent } from '../../domain/image/image.oa-component';
import { EmptyObject } from '../../framework/object-types/empty-object';
import { ImageGetURLUseCase } from '../../use-cases/image/image-get-url.use-case';

export type ImageGetURLOutput = { uploadURL: string };
export type ImageGetURLRequestQuery = { fileType: string };

export const imageGetURLEndpointFactory = ({
  imageGetURLUseCase,
}: {
  imageGetURLUseCase: ImageGetURLUseCase;
}): Endpoint<EmptyObject, ImageGetURLRequestQuery, EmptyObject, EmptyObject, ImageGetURLOutput> => ({
  method: EndpointMethods.GET,
  route: '/image-get-url',
  schema: {
    summary: 'This endpoint is responsible for generating a signed put url for an image',
    description: 'Returns a url which can be used to upload image to bucket',
    tags: ['Image'],
    response: {
      200: imageResponseOAComponent,
      403: baseOAErrorResponses[403],
      500: baseOAErrorResponses[500],
    },
  },
  handler: async (request) => {
    const fileType = request.query.fileType;
    const response = await imageGetURLUseCase({ fileType });

    return { status: 200, response };
  },
});
