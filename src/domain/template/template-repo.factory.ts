import { TemplateRepo } from './template-repo';
import { templateFactory } from './template.factory';

export const createTemplateRepoForTest = (): TemplateRepo => ({
  getAll: () => Promise.resolve([templateFactory()]),
  getByID: () => Promise.resolve(templateFactory()),
  addResource: () => Promise.resolve(),
});
