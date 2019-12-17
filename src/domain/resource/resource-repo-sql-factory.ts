import ramda from 'ramda';
import { KeyMapping, renameKeysFromDB, renameKeysToDB } from '../../framework/sql/rename-keys';
import sql, { SqlTemplateArg, SqlTemplateResult } from '../../framework/sql/sql-template';
import { Resource } from './resource';
import {
  AddableResourceRepo,
  ReadableResourceRepo,
  UpdatableResourceRepo,
  MultipleReadableResourceRepo,
} from './resource-repo';
import { RunQuery } from '../../database/create-run-query';
import { PageOptions, ListResult } from '../list/list';

export const addResourceFactory = <T extends Resource>(
  resourceType: string,
  keyMap: KeyMapping<T>,
  runQuery: RunQuery,
): AddableResourceRepo<T>['addResource'] => async (resource: T | T[]): Promise<void> => {
  if (Array.isArray(resource) && resource.length === 0) {
    return;
  }
  await runQuery(addResourceQueryFactory(resourceType, keyMap, resource));
};

export const addResourceQueryFactory = <T extends Resource>(
  resourceType: string,
  keyMap: KeyMapping<T>,
  resources: T | T[],
): SqlTemplateResult => {
  const resourcesSQL = Array.isArray(resources)
    ? resources.map(r => renameKeysToDB(keyMap, r))
    : [renameKeysToDB(keyMap, resources)];
  return sql`INSERT INTO ${sql(resourceType)} (${sql(getSQLKeysFromObject(resourcesSQL[0]))}) VALUES ${sql.insertArray(
    resourcesSQL.map(r => Object.values(r)),
  )};`;
};

const getSQLKeysFromObject = (resource: object): string => Object.keys(resource).join(', ');

export const getMultipleResourcesPaged = <T extends Resource>(
  resourceType: string,
  keyMap: KeyMapping<T>,
  runQuery: RunQuery,
): MultipleReadableResourceRepo<T, PageOptions>['getMultiplePaged'] => async (
  pageOptions: PageOptions,
): Promise<ListResult<T>> => {
  const [itemRes, countRes] = await Promise.all([
    runQuery(
      getResourceQueryFactory({
        resourceType,
        limit: pageOptions.limit,
        skip: pageOptions.skip,
      }),
    ),
    runQuery(countMultipleResourcesFactory(resourceType)),
  ]);

  return {
    items: itemRes.rows.map(row => renameKeysFromDB<T>(keyMap, row)),
    count: parseInt(countRes.rows[0].count, 10),
  };
};

export const countMultipleResourcesFactory = (resourceType: string): SqlTemplateResult => sql`
  SELECT
    COUNT(DISTINCT x.id)
  FROM
    ${sql(resourceType)} x
  `;

export const getResourceQueryFactory = (opts: {
  resourceType: string;
  orderBy?: SqlTemplateResult;
  where?: SqlTemplateResult;
  limit?: number;
  skip?: number;
}): SqlTemplateResult => sql`
  SELECT
    x.*
  FROM
    ${sql(opts.resourceType)} x
  ${opts.where ? sql`WHERE (${opts.where})` : sql('')}
  ${opts.orderBy ? sql`ORDER BY ${opts.orderBy}` : sql('')}
  ${isDefined(opts.limit) ? sql`LIMIT ${opts.limit}` : sql('')}
  ${isDefined(opts.skip) ? sql`OFFSET ${opts.skip}` : sql('')}
  ;
`;

export const getResourceByIDFactory = <T extends Resource>(
  resourceType: string,
  keyMap: KeyMapping<T>,
  runQuery: RunQuery,
): ReadableResourceRepo<T>['getByID'] => async (id: string): Promise<T | undefined> => {
  const res = await runQuery(getResourceQueryFactory({ resourceType, where: sql`x.id = ${id}`, limit: 1 }));

  if (res.rowCount === 0) {
    return undefined;
  }
  return renameKeysFromDB<T>(keyMap, res.rows[0]);
};

export const getMultipleByIDsFactory = <T extends Resource>(
  resourceType: string,
  keyMap: KeyMapping<T>,
  runQuery: RunQuery,
) => async (ids: T['id'][]) => {
  if (ids.length < 1) {
    return [];
  }
  const res = await runQuery(sql`
    SELECT * FROM ${sql(resourceType)}
    WHERE id IN ${sql.groupArray(ids)};
  `);

  return res.rows.map(row => renameKeysFromDB<T>(keyMap, row));
};

export const updateResourceByIDFactory = <T extends Resource, Updates extends { [key: string]: SqlTemplateArg }>(
  resourceType: string,
  keyMap: KeyMapping<T>,
  runQuery: RunQuery,
): UpdatableResourceRepo<Updates>['updateResourceByID'] => async (
  resourceID: Resource['id'],
  updates: Updates,
): Promise<void> => {
  const sqlUpdateObject = renameKeysToDB(keyMap, omitUndefined(updates));
  if (Object.keys(sqlUpdateObject).length) {
    await runQuery(updateResourceByIDQueryFactory(sqlUpdateObject, resourceID, resourceType));
  }
};

const updateResourceByIDQueryFactory = <T extends { [key: string]: SqlTemplateArg }>(
  updates: T,
  resourceID: Resource['id'],
  resourceType: string,
): SqlTemplateResult => sql`
  UPDATE ${sql(resourceType)}
  SET ${sql.setMap(updates)}
  WHERE id = ${resourceID};
`;

const omitUndefined = ramda.filter(i => i !== undefined);
const isDefined = <T>(val: T | undefined | null): val is T => !ramda.isNil(val);

export const removeResourceByIDFactory = (resourceType: string, runQuery: RunQuery) => async (resourceID: string) => {
  await runQuery(removeResourceByIDQueryFactory(resourceType, resourceID));
};

export const removeResourceByIDQueryFactory = (resourceType: string, resourceID: string): SqlTemplateResult => {
  return sql`DELETE FROM ${sql(resourceType)} WHERE (${sql.andEqual({ id: resourceID })});`;
};
