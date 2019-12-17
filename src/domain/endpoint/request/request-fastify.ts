import { FastifyRequest } from 'fastify';
import { RequestContext } from './request';

type KeyValue = Record<string, string>;
export const requestContextFastifyFactory = <
  Body extends {},
  Query extends KeyValue = {},
  Params extends KeyValue = {}
>(
  request: FastifyRequest,
): RequestContext<Body, Query, Params> =>
  ({
    query: request.query || {},
    parameters: request.params || {},
    headers: request.headers || {},
    body: request.body || {},
  } as RequestContext<Body, Query, Params>);
