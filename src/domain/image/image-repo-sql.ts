import { QueryService } from '../../database/run-query-service';
import { rootMapping, ProjectionType, renameKeysFromDB, RecordKeyType } from '../../framework/sql/rename-keys';
import sql from '../../framework/sql/sql-template';
import {
  addResourceFactory,
  getResourceCountQueryFactory,
  getResourceQueryFactory,
} from '../resource/resource-repo-sql-factory';
import { Image } from './image';
import { ImageRepo } from './image-repo';

const baseMapping = {
  id: { mapTo: 'id', type: ProjectionType.MAP },
  title: { mapTo: 'title', type: ProjectionType.MAP },
  imageURL: { mapTo: 'image_url', type: ProjectionType.MAP },
  createdAt: { mapTo: 'created_at', type: ProjectionType.MAP },
};

const IMAGE_KEY_MAPPING = rootMapping<Image>(baseMapping);

const IMAGE_RESOURCE_TYPE = 'images';

export const imageRepoSQLFactory = ({ queryService }: { queryService: QueryService }): ImageRepo => ({
  addResource: addResourceFactory(IMAGE_RESOURCE_TYPE, IMAGE_KEY_MAPPING, queryService.run),
  getAll: async ({ skip = 0, limit = 1000 }) => {
    const query = getResourceQueryFactory({
      limit,
      skip,
      resourceType: IMAGE_RESOURCE_TYPE,
      orderBy: sql`x.created_at desc`,
    });
    const res = await queryService.run<RecordKeyType>(query);

    return res.rows.map((row) => renameKeysFromDB<Image>(IMAGE_KEY_MAPPING, row));
  },
  countAll: async () => {
    const query = getResourceCountQueryFactory({
      resourceType: IMAGE_RESOURCE_TYPE,
    });

    const res = await queryService.run<{ count: string }>(query);

    return parseInt(res.rows[0].count, 10);
  },
});
