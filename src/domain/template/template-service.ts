import { NotFoundError } from '../error/errors';
import { Template } from './template';
import { TemplateRepo } from './template-repo';

export interface TemplateService {
  ensureAndGetByID(id: Template['id']): Promise<Template>;
  create(cluster: Template): Promise<void>;

  getAll(): Promise<Template[]>;
}

export const templateServiceFactory = ({ templateRepo }: { templateRepo: TemplateRepo }): TemplateService => {
  const ensureAndGetByID = async (id: string): Promise<Template> => {
    const template = await templateRepo.getByID(id);
    if (!template) {
      throw new NotFoundError('template');
    }
    return template;
  };

  const getAll = async (): Promise<Template[]> => {
    return templateRepo.getAll();
  };

  const create = async (template: Template): Promise<void> => {
    return templateRepo.addResource(template);
  };

  return {
    create,
    ensureAndGetByID,
    getAll,
  };
};
