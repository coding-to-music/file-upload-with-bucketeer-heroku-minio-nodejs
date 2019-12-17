export type Response<Body extends object = {}> = {
  status: number;
  body: Body;
  headers?: { [key: string]: string };
};

export type ResponseSetter = (status: number, response?: object, headers?: { [key: string]: string }) => void;
