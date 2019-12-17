export type RequestContext<Body, Query, Params> = {
  method: string;
  path: string;
  body: Body;
  query: Query;
  parameters: Params;
  headers: { [key: string]: string | string[] };
};
