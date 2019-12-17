/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { KeyMapping, renameKeysToDB, renameKeysFromDB, MappingOption } from './rename-keys';
import { SqlTemplateArg } from './sql-template';

describe('renameKeysToDB', () => {
  interface TestDataItem<T extends { [key: string]: SqlTemplateArg }> {
    name: string;
    keyMap: KeyMapping<T>;
    original: T;
    expected: { [key: string]: SqlTemplateArg };
  }

  type TestObj = {
    a: string;
    b?: number;
  };

  const testData: TestDataItem<TestObj>[] = [
    {
      name: 'should rename keys of object based on keyMap',
      keyMap: {
        a: { mapTo: 'a_k', type: MappingOption.Map },
        b: { mapTo: 'b_k', type: MappingOption.Map },
      },
      original: { a: 'b', b: 1 },
      expected: { a_k: 'b', b_k: 1 },
    },
    {
      name: 'should ignore keys of object based on keyMap',
      keyMap: {
        a: { mapTo: 'a_k', type: MappingOption.Map },
        b: { mapTo: '', type: MappingOption.Ignore },
      },
      original: { a: 'b', b: 1 },
      expected: { a_k: 'b' },
    },
    {
      name: 'should ignore keys of object based on keyMap (fromDB)',
      keyMap: {
        a: { mapTo: 'a_k', type: MappingOption.Map },
        b: { mapTo: 'b_k', type: MappingOption.OnlyFromDB },
      },
      original: { a: 'b', b: 1 },
      expected: { a_k: 'b' },
    },
    {
      name: 'should map keys of object based on keyMap (toDB)',
      keyMap: {
        a: { mapTo: 'a_k', type: MappingOption.Map },
        b: { mapTo: 'b_k', type: MappingOption.OnlyToDB },
      },
      original: { a: 'b', b: 1 },
      expected: { a_k: 'b', b_k: 1 },
    },
    {
      name: 'should ignore keys of object on invalid keyMap',
      keyMap: {
        a: { mapTo: 'a_k', type: MappingOption.Map },
        b: { mapTo: 'b_k', type: 'asd' as any },
      },
      original: { a: 'b', b: 1 },
      expected: { a_k: 'b' },
    },
    {
      name: 'should map keys to the same key of object on invalid mapTo',
      keyMap: {
        a: { mapTo: 'a_k', type: MappingOption.Map },
        b: { type: MappingOption.Map },
      } as any,
      original: { a: 'b', b: 1 },
      expected: { a_k: 'b', b: 1 },
    },
    {
      name: 'should ignore keys missing from obj',
      keyMap: {
        a: { mapTo: 'a_k', type: MappingOption.Map },
        b: { mapTo: 'b_k', type: MappingOption.Map },
      },
      original: { a: 'b' },
      expected: { a_k: 'b' },
    },
  ];
  testData.forEach(d =>
    it(d.name, () => {
      expect(Object.keys(renameKeysToDB(d.keyMap, d.original))).toEqual(Object.keys(d.expected));
      expect(renameKeysToDB(d.keyMap, d.original)).toEqual(d.expected);
    }),
  );
});

describe('renameKeysFromDB', () => {
  interface TestDataItem<T extends { [key: string]: SqlTemplateArg }> {
    name: string;
    keyMap: KeyMapping<T>;
    original: { [key: string]: SqlTemplateArg };
    expected: T;
  }

  type TestObj = {
    a: string;
    b?: number;
  };

  const testData: TestDataItem<TestObj>[] = [
    {
      name: 'should rename keys of object based on keyMap',
      keyMap: {
        a: { mapTo: 'a_k', type: MappingOption.Map },
        b: { mapTo: 'b_k', type: MappingOption.Map },
      },
      original: { a_k: 'b', b_k: 1 },
      expected: { a: 'b', b: 1 },
    },
    {
      name: 'should ignore keys of object based on keyMap',
      keyMap: {
        a: { mapTo: 'a_k', type: MappingOption.Map },
        b: { mapTo: 'b_k', type: MappingOption.Ignore },
      },
      original: { a_k: 'b', b_k: 1 },
      expected: { a: 'b' },
    },
    {
      name: 'should map keys of object based on keyMap (fromDB)',
      keyMap: {
        a: { mapTo: 'a_k', type: MappingOption.Map },
        b: { mapTo: 'b_k', type: MappingOption.OnlyFromDB },
      },
      original: { a_k: 'b', b_k: 1 },
      expected: { a: 'b', b: 1 },
    },
    {
      name: 'should ignore keys of object based on keyMap (toDB)',
      keyMap: {
        a: { mapTo: 'a_k', type: MappingOption.Map },
        b: { mapTo: 'b_k', type: MappingOption.OnlyToDB },
      },
      original: { a_k: 'b', b_k: 1 },
      expected: { a: 'b' },
    },
    {
      name: 'should ignore keys of object on invalid keyMap',
      keyMap: {
        a: { mapTo: 'a_k', type: MappingOption.Map },
        b: { mapTo: 'b_k', type: 'asd' as any },
      },
      original: { a_k: 'b', b_k: 1 },
      expected: { a: 'b' },
    },
    {
      name: 'should map keys to the same key of object on invalid mapTo',
      keyMap: {
        a: { mapTo: 'a_k', type: MappingOption.Map },
        b_k: { type: MappingOption.Map },
      } as any,
      original: { a_k: 'b', b_k: 1 },
      expected: { a: 'b', b_k: 1 } as any,
    },
    {
      name: 'should ignore keys missing from obj',
      keyMap: {
        a: { mapTo: 'a_k', type: MappingOption.Map },
        b: { mapTo: 'b_k', type: MappingOption.Map },
      },
      original: { a_k: 'b' },
      expected: { a: 'b' },
    },
  ];
  testData.forEach(d =>
    it(d.name, () => {
      expect(Object.keys(renameKeysFromDB(d.keyMap, d.original))).toEqual(Object.keys(d.expected));
      expect(renameKeysFromDB(d.keyMap, d.original)).toEqual(d.expected);
    }),
  );
});
