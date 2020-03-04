import { RunQuery } from '../../database/create-run-query';
import { KeyMapping, MappingOption, renameKeysFromDB } from '../../framework/sql/rename-keys';
import {
  addResourceFactory,
  getResourceByIDFactory,
  getResourceQueryFactory,
} from '../resource/resource-repo-sql-factory';
import { Template } from './template';
import { TemplateRepo } from './template-repo';

const TEMPLATE_KEY_MAPPING: KeyMapping<Template> = {
  id: { mapTo: 'id', type: MappingOption.Map },
  name: { mapTo: 'name', type: MappingOption.Map },
  template: { mapTo: 'template', type: MappingOption.Map },
  inputSchema: { mapTo: 'input_schema', type: MappingOption.Map },
};

const TEMPLATE_RESOURCE_TYPE = 'templates';

export const featureRepoSQLFactory = (runQuery: RunQuery): TemplateRepo => ({
  addResource: addResourceFactory(TEMPLATE_RESOURCE_TYPE, TEMPLATE_KEY_MAPPING, runQuery),
  getByID: getResourceByIDFactory(TEMPLATE_RESOURCE_TYPE, TEMPLATE_KEY_MAPPING, runQuery),
  getAll: async () => {
    const res = await runQuery(getResourceQueryFactory({ resourceType: TEMPLATE_RESOURCE_TYPE }));

    return res.rows.map(row => renameKeysFromDB<Template>(TEMPLATE_KEY_MAPPING, row));
  },
});
