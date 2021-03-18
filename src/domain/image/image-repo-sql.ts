import { RunQuery } from '../../database/create-run-query';
import { KeyMapping, MappingOption, renameKeysFromDB } from '../../framework/sql/rename-keys';
import {
  addResourceFactory,
  getResourceByIDFactory,
  getResourceQueryFactory,
} from '../resource/resource-repo-sql-factory';
import { Image } from './image';
import { ImageRepo } from './image-repo';

const IMAGE_KEY_MAPPING: KeyMapping<Image> = {
  id: { mapTo: 'id', type: MappingOption.Map },
  name: { mapTo: 'name', type: MappingOption.Map },
};

const IMAGE_RESOURCE_TYPE = 'templates';

export const featureRepoSQLFactory = (runQuery: RunQuery): ImageRepo => ({
  addResource: addResourceFactory(IMAGE_RESOURCE_TYPE, IMAGE_KEY_MAPPING, runQuery),
  getByID: getResourceByIDFactory(IMAGE_RESOURCE_TYPE, IMAGE_KEY_MAPPING, runQuery),
  getAll: async () => {
    const res = await runQuery(getResourceQueryFactory({ resourceType: IMAGE_RESOURCE_TYPE }));

    return res.rows.map((row) => renameKeysFromDB<Image>(IMAGE_KEY_MAPPING, row));
  },
});
