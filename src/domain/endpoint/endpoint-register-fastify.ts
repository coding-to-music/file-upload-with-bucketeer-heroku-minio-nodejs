import { lensPath, pipe, set } from 'ramda';
import { Endpoint } from './endpoint';
import { endpointFastifyMWFactory } from './endpoint-to-mw-routing-fastify';
import fastify = require('fastify');

export const registerEndpoint = <ReqBody extends {} = {}, ResBody extends object = {}>(
  server: fastify.FastifyInstance,
  endpoint: Endpoint<ReqBody, ResBody>,
): fastify.FastifyInstance => {
  const schema = pipe(
    set(lensPath(['body']), endpoint.bodyJSONSchema),
    set(lensPath(['querystring']), endpoint.queryJSONSchema),
    set(lensPath(['params']), endpoint.paramsJSONSchema),
    set(lensPath(['response']), endpoint.responseSchemas),
  )({});
  return server.route({
    url: endpoint.route,
    method: endpoint.method,
    schema: schema,
    handler: endpointFastifyMWFactory(endpoint),
  });
};
