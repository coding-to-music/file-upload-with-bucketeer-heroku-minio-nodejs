import { RequestHandler } from 'fastify';
import { Endpoint } from './endpoint';
import { requestContextFastifyFactory } from './request/request-fastify';

export const endpointFastifyMWFactory = <
  ReqBody extends {} = {},
  ReqQuery extends {} = {},
  ReqParams extends {} = {},
  ResBody extends object = {}
>(
  endpoint: Endpoint<ReqBody, ReqQuery, ReqParams, ResBody>,
): RequestHandler => async (req, res) => {
  const endpointContext = requestContextFastifyFactory<ReqBody, ReqQuery, ReqParams>(req);
  const { status, body } = await endpoint.handler(endpointContext);

  return res.status(status).send(body);
};
