import { AddableResourceRepo, ReadableResourceRepo } from '../resource/resource-repo';
import { Template } from './template';

export interface TemplateRepo extends AddableResourceRepo<Template>, ReadableResourceRepo<Template> {
  getAll(): Promise<Template[]>;
}
