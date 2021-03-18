import { FastifyOASOptions, OpenApiSpec } from 'fastify-oas';
import { OpenAPIV3 } from 'openapi-types';

type FastifySwaggerFactoryArgs = {
  host: string;
  tags: OpenAPIV3.TagObject[];
  components: OpenAPIV3.ComponentsObject;
  security: OpenAPIV3.SecurityRequirementObject[];
};
export const fastifySwaggerFactory = (factoryArgs: FastifySwaggerFactoryArgs): FastifyOASOptions => ({
  routePrefix: '/documentation',
  exposeRoute: true,
  swagger: {
    info: {
      title: 'API',
      description: 'API description',
      version: '0.0.0',
    },
    host: factoryArgs.host,
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: factoryArgs.tags,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    components: (factoryArgs.components as unknown) as OpenApiSpec['components'],
    security: factoryArgs.security,
  },
});
