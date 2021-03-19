import { equals, flatten, isNil, lensPath, not, reduce, set, view } from 'ramda';

export enum ProjectionType {
  IGNORE = 0,
  MAP = 1,
  ONLY_TO_DB = 2,
  ONLY_FROM_DB = 3,
}
export type ProjectionValue = { mapTo: string; type: ProjectionType };

type ProjectionFn = (opts: {
  fromPath: string[];
  toPath: string[];
  sourceObject: Record<string, unknown>;
  targetObject: Record<string, unknown>;
  fromDB: boolean;
}) => Record<string, unknown>;

const projectionMap: Record<number, ProjectionFn> = {
  [ProjectionType.IGNORE]: ({ targetObject }) => targetObject,
  [ProjectionType.MAP]: ({ fromDB, ...props }) =>
    fromDB
      ? projectionMap[ProjectionType.ONLY_FROM_DB]({ ...props, fromDB })
      : projectionMap[ProjectionType.ONLY_TO_DB]({ ...props, fromDB }),
  [ProjectionType.ONLY_FROM_DB]: ({ targetObject, fromDB, fromPath, toPath, sourceObject }) =>
    fromDB
      ? projectFromTo({
          fromPath: toPath,
          targetObject,
          sourceObject,
          toPath: fromPath,
        })
      : targetObject,
  [ProjectionType.ONLY_TO_DB]: ({ targetObject, fromDB, fromPath, toPath, sourceObject }) =>
    fromDB
      ? targetObject
      : projectFromTo({
          fromPath: fromPath,
          targetObject,
          sourceObject,
          toPath: toPath,
        }),
};

type ProjectFromToFn = (opts: {
  fromPath: string[];
  toPath: string[];
  sourceObject: Record<string, unknown>;
  targetObject: Record<string, unknown>;
}) => Record<string, unknown>;
const getFromPath = (obj: Record<string, unknown>, path: string[]): unknown => view(lensPath(path), obj);
const projectFromTo: ProjectFromToFn = ({ sourceObject, targetObject, fromPath, toPath }) =>
  not(equals(getFromPath(sourceObject, fromPath), undefined))
    ? set(lensPath(toPath), getFromPath(sourceObject, fromPath), targetObject)
    : targetObject;

type MappingProjection = { from: string[]; to: string[]; projectionType: ProjectionType };
const mapKeys = (rootMapping: RootMapping, obj: RecordKeyType, fromDB: boolean): RequiredRecordType => {
  const getMappings = (keyMapping: EmbeddedMapping | FlatMapping): MappingProjection[] => {
    if (keyMapping.mappingType === MappingType.FLAT) {
      return [{ from: keyMapping.fromKey, to: keyMapping.toKey, projectionType: keyMapping.projectionType }];
    }
    return flatten(keyMapping.mappings.map((m) => getMappings(m)));
  };

  const mappingProjections: MappingProjection[] = flatten(rootMapping.mappings.map((m) => getMappings(m)));

  return reduce(
    (acc, mappingProjection) =>
      projectionMap[mappingProjection.projectionType]({
        fromDB,
        fromPath: mappingProjection.from,
        toPath: mappingProjection.to,
        sourceObject: obj,
        targetObject: acc,
      }),
    {},
    mappingProjections,
  );
};

export const renameKeysToDB = (keyMapping: RootMapping, obj: RecordKeyType): RequiredRecordType =>
  mapKeys(keyMapping, obj, false);

export const renameKeysFromDB = <T extends RecordKeyType>(keyMapping: RootMapping, obj: RecordKeyType): T =>
  mapKeys(keyMapping, obj, true) as T;

export enum MappingType {
  ROOT = 0,
  EMBEDDED = 1,
  FLAT = 2,
}
export type RootMapping = {
  mappingType: MappingType.ROOT;
  mappings: Mapping[];
};
export type EmbeddedMapping = {
  mappingType: MappingType.EMBEDDED;
  fromKey: string[];
  mappings: Mapping[];
};
export type FlatMapping = {
  mappingType: MappingType.FLAT;
  fromKey: string[];
  toKey: string[];
  projectionType: ProjectionType;
};

export type Mapping = EmbeddedMapping | FlatMapping;
const projectionTypes = Object.values(ProjectionType);
const isMappingValue = (value: EmbeddedMapping | ProjectionValue): value is ProjectionValue =>
  projectionTypes.includes((value as ProjectionValue).type);
const isEmbeddedMapping = (value: EmbeddedMapping | unknown): value is EmbeddedMapping =>
  (value as EmbeddedMapping).mappingType === MappingType.EMBEDDED;

export type RecordValues = string | number | boolean | Date | null | RecordKeyType | RecordValues[];
export type RecordKeyType = { [Key in string]?: RecordValues };
export type RequiredRecordType = { [Key in string]: RecordValues };
export const embeddedMapping = <TRecord extends RecordKeyType>(
  record: { [K in keyof TRecord]: EmbeddedMapping | ProjectionValue },
): EmbeddedMapping => {
  const mappings = getMappings(record);

  return {
    mappings,
    fromKey: [],
    mappingType: MappingType.EMBEDDED,
  };
};

export const rootMapping = <TRecordType extends RecordKeyType>(
  record: { [K in keyof TRecordType]: EmbeddedMapping | ProjectionValue },
): RootMapping => {
  const mappings = getMappings(record);

  return {
    mappings,
    mappingType: MappingType.ROOT,
  };
};

const isDefined = <T>(val: T | null | undefined): val is T => !isNil(val);

const getMappings = <TRecordType extends RecordKeyType>(
  record: { [K in keyof TRecordType]: EmbeddedMapping | ProjectionValue },
): Mapping[] =>
  Object.entries(record)
    .map(([key, value]) => {
      if (isMappingValue(value)) {
        if (!value.mapTo) {
          return null;
        }
        return {
          mappingType: MappingType.FLAT,
          fromKey: [key],
          toKey: [value.mapTo],
          projectionType: value.type,
        };
      }

      if (isEmbeddedMapping(value)) {
        return appendFromPathToMapping([key], value);
      }

      return null;
    })
    .filter(isDefined) as Mapping[];

const appendFromPathToMapping = (fromPath: string[], mapping: Mapping): Mapping =>
  isEmbeddedMapping(mapping)
    ? {
        ...mapping,
        fromKey: [...fromPath, ...mapping.fromKey],
        mappings: mapping.mappings.map((m) => appendFromPathToMapping(fromPath, m)),
      }
    : {
        ...mapping,
        fromKey: [...fromPath, ...mapping.fromKey],
      };
