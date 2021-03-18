import { OpenAPIV3 } from 'openapi-types';
import { EmptyObject } from '../../framework/object-types/empty-object';
import { RecordType } from '../../framework/object-types/record-type';
import { EndpointMethods } from './endpoint-methods';

export type EndpointRoute = string;
export type EndpointTag = { name: string; tag: string };
export type EndpointHandlerInput<
  THeaders extends Record<string, string | string[] | undefined> =
    | Record<string, string | string[] | undefined>
    | EmptyObject,
  TQuery extends Record<string, string | undefined> = Record<string, string | undefined> | EmptyObject,
  TParams extends Record<string, string> = Record<string, string> | EmptyObject,
  TBody extends RecordType | RecordType[] = RecordType | RecordType[]
> = {
  headers: THeaders;
  query: TQuery;
  params: TParams;
  body: TBody;
};
export type EndpointSchema = {
  summary?: string;
  description?: string;
  tags?: string[];
  headers?: OpenAPIV3.NonArraySchemaObject;
  query?: OpenAPIV3.NonArraySchemaObject;
  params?: OpenAPIV3.NonArraySchemaObject;
  body?: OpenAPIV3.NonArraySchemaObject;
  response?: { [key: string]: OpenAPIV3.NonArraySchemaObject | OpenAPIV3.ArraySchemaObject };
};
export type EndpointHandlerResponse<TResponse> = {
  status: number;
  response: TResponse;
  headers?: { [key: string]: string };
};

export type Endpoint<
  THeaders extends Record<string, string | string[] | undefined | never> = Record<
    string,
    string | string[] | undefined | never
  >,
  TQuery extends Record<string, string | undefined | never> = Record<string, string | undefined | never>,
  TParams extends Record<string, string | never> = Record<string, string | never>,
  TBody extends RecordType | RecordType[] | EmptyObject = RecordType | RecordType[] | EmptyObject,
  TResponse extends RecordType | RecordType[] | EmptyObject = RecordType | RecordType[] | EmptyObject
> = {
  method: EndpointMethods;
  route: EndpointRoute;
  schema: EndpointSchema;
  handler: (
    input: EndpointHandlerInput<THeaders, TQuery, TParams, TBody>,
  ) => Promise<EndpointHandlerResponse<TResponse>>;
};
