import { Endpoint } from './endpoint';
import { v4 } from 'uuid';
import { EndpointMethods } from './endpoint-methods';

export const createEndpointForTest = ({
  method = EndpointMethods.GET,
  bodyJSONSchema,
  route = `/${v4()}`,
  handler = () =>
    Promise.resolve({
      status: 200,
      body: {},
    }),
  responseSchemas = [{ 200: { type: 'object' } }],
}: Partial<Endpoint> = {}): Endpoint => ({
  method,
  route,
  handler,
  responseSchemas,
  bodyJSONSchema,
});
