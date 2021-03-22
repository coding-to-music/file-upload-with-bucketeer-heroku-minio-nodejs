import ramda from 'ramda';
import { RunQuery } from '../../database/create-run-query';
import { renameKeysFromDB, renameKeysToDB, RootMapping } from '../../framework/sql/rename-keys';
import sql, { SqlTemplateArg, SqlTemplateResult } from '../../framework/sql/sql-template';
import { Resource } from './resource';
import {
  AddableResourceRepo,
  ReadableResourceRepo,
  RemovableResourceRepo,
  UpdatableResourceRepo,
} from './resource-repo';

export const addResourceFactory = <T extends Resource>(
  resourceType: string,
  keyMap: RootMapping,
  runQuery: RunQuery,
): AddableResourceRepo<T>['addResource'] => async (resource: T | T[]) => {
  if (Array.isArray(resource) && resource.length === 0) {
    return;
  }
  await runQuery(addResourceQueryFactory(resourceType, keyMap, resource));
};

export const getResourceByIDFactory = <T extends Resource>(
  resourceType: string,
  keyMap: RootMapping,
  runQuery: RunQuery,
): ReadableResourceRepo<T>['getByID'] => async (id) => {
  const res = await runQuery(getResourceQueryFactory({ resourceType, where: sql`x.id = ${id}`, limit: 1 }));

  if (res.rowCount === 0) {
    return null;
  }
  return renameKeysFromDB<T>(keyMap, res.rows[0]);
};

export const getResourceCountQueryFactory = (opts: {
  resourceType: string;
  where?: SqlTemplateResult;
}): SqlTemplateResult => sql`
  SELECT
    COUNT(DISTINCT x.id)
  FROM
    ${sql(opts.resourceType)} x
  ${opts.where ? sql`WHERE (${opts.where})` : sql('')}
  ;
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
  ;`;

export const addResourceQueryFactory = <T extends Resource>(
  resourceType: string,
  keyMap: RootMapping,
  resources: T | T[],
): SqlTemplateResult => {
  const resourcesSQL = Array.isArray(resources)
    ? resources.map((r) => renameKeysToDB(keyMap, r))
    : [renameKeysToDB(keyMap, resources)];
  return sql`INSERT INTO ${sql(resourceType)} (${sql(getSQLKeysFromObject(resourcesSQL[0]))}) VALUES ${sql.insertArray(
    resourcesSQL.map((r) => Object.values(r)),
  )};`;
};

const getSQLKeysFromObject = (resource: Record<string, unknown>): string => Object.keys(resource).join(', ');

export const updateResourceByIDFactory = <TUpdates extends Partial<{ [key: string]: SqlTemplateArg }>>(
  resourceType: string,
  keyMap: RootMapping,
  runQuery: RunQuery,
): UpdatableResourceRepo<TUpdates>['updateResourceByID'] => async (id, updates): Promise<void> => {
  const sqlUpdateObject = renameKeysToDB(keyMap, omitUndefined(updates));
  if (Object.keys(sqlUpdateObject).length) {
    await runQuery(updateResourceByIDQueryFactory(sqlUpdateObject, id, resourceType));
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

const isNotUndefined = <T>(val: T | undefined): val is T => val !== undefined;
const omitUndefined = ramda.filter(isNotUndefined);
export const isDefined = <T>(val: T | undefined | null): val is T => !ramda.isNil(val);

export const removeResourceByIDFactory = <T extends Resource>(
  resourceType: string,
  runQuery: RunQuery,
): RemovableResourceRepo<T>['removeByID'] => async (id) => {
  await runQuery(removeResourceByIDQueryFactory(resourceType, id));
};

export const removeResourceByIDQueryFactory = (resourceType: string, resourceID: string): SqlTemplateResult => {
  return sql`DELETE FROM ${sql(resourceType)} WHERE (${sql.andEqual({ id: resourceID })});`;
};
