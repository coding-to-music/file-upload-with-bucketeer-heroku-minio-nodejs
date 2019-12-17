import { JSONSchema4 } from 'json-schema';
import { EndpointMethods } from './endpoint-methods';
import { RequestContext } from './request/request';
import { Response } from './response/response';

export interface Endpoint<
  ReqBody extends object = {},
  Query extends object = {},
  Params extends object = {},
  ResBody extends object = {}
> {
  method: EndpointMethods;
  route: string;
  handler: (request: RequestContext<ReqBody, Query, Params>) => Promise<Response<ResBody>>;
  bodyJSONSchema?: JSONSchema4;
  queryJSONSchema?: JSONSchema4;
  paramsJSONSchema?: JSONSchema4;
  responseSchemas?: {
    [code: number]: JSONSchema4;
  };
}
