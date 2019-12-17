import { TemplateRepo } from './template-repo';
import { createTemplateRepoForTest } from './template-repo.factory';
import { TemplateService, templateServiceFactory } from './template-service';

export const createTemplateServiceForTest = ({
  templateRepo = createTemplateRepoForTest(),
}: {
  templateRepo: TemplateRepo;
}): TemplateService => templateServiceFactory({ templateRepo });
