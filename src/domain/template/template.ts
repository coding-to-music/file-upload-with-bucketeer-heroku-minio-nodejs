import { JSONSchema7 } from 'json-schema';
import { Resource } from '../resource/resource';

export type Template = Resource & {
  name: string;
  template: string;
  inputSchema: JSONSchema7;
};
