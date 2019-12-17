import ramda from 'ramda';
import { SqlTemplateArg } from './sql-template';

const isDefined = <T>(val: T | undefined | null): val is T => !ramda.isNil(val);
export enum MappingOption {
  Ignore,
  Map,
  OnlyToDB,
  OnlyFromDB,
}
export type KeyMapping<T extends { [key: string]: unknown }> = {
  [P in keyof Required<T>]: { mapTo: string; type: MappingOption };
};

const subMap = {
  [MappingOption.Ignore]: () => ({}),
  [MappingOption.Map]: (key: string, obj: { [key: string]: unknown }, mapTo: string, fromDB: boolean) =>
    fromDB
      ? mapTo in obj
        ? { [key]: obj[mapTo] }
        : subMap[MappingOption.Ignore]()
      : key in obj
      ? { [mapTo]: obj[key] }
      : subMap[MappingOption.Ignore](),
  [MappingOption.OnlyFromDB]: (key: string, obj: { [key: string]: unknown }, mapTo: string, fromDB: boolean) =>
    fromDB ? subMap[MappingOption.Map](key, obj, mapTo, fromDB) : subMap[MappingOption.Ignore](),
  [MappingOption.OnlyToDB]: (key: string, obj: { [key: string]: unknown }, mapTo: string, fromDB: boolean) =>
    !fromDB ? subMap[MappingOption.Map](key, obj, mapTo, fromDB) : subMap[MappingOption.Ignore](),
};

const mapKeys = <T extends { [key: string]: SqlTemplateArg }>(
  keyMapping: KeyMapping<T>,
  obj: { [key: string]: SqlTemplateArg },
  fromDB: boolean,
): { [key: string]: SqlTemplateArg } =>
  Object.keys(keyMapping).reduce((acc, key) => {
    const keyMapVal = keyMapping[key];
    return {
      ...acc,
      ...(subMap[keyMapVal?.type] || subMap[MappingOption.Ignore])(
        key,
        obj,
        isDefined(keyMapVal?.mapTo) ? keyMapVal.mapTo : key,
        fromDB,
      ),
    };
  }, {} as { [key: string]: SqlTemplateArg });

export const renameKeysToDB = <T extends { [key: string]: SqlTemplateArg }>(
  keyMap: KeyMapping<T>,
  obj: { [key: string]: SqlTemplateArg },
): { [key: string]: SqlTemplateArg } => mapKeys(keyMap, obj, false);

export const renameKeysFromDB = <T extends { [key: string]: SqlTemplateArg }>(
  keyMap: KeyMapping<T>,
  obj: { [key: string]: SqlTemplateArg },
): T => mapKeys(keyMap, obj, true) as T;
