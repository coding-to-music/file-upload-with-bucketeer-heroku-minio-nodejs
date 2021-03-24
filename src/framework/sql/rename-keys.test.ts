/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  embeddedMapping,
  ProjectionType,
  renameKeysFromDB,
  renameKeysToDB,
  rootMapping,
  RecordKeyType,
  RootMapping,
} from './rename-keys';

interface TestDataItem<T extends RecordKeyType> {
  name: string;
  keyMap: RootMapping;
  original: T;
  expected: RecordKeyType;
}

type TestObj = {
  a: string;
  b?: number;
  c?: {
    d: number;
    e?: {
      f?: number;
    };
  };
};

describe('renameKeysToDB', () => {
  const testData: TestDataItem<TestObj>[] = [
    {
      name: 'should rename keys of object based on keyMap',
      keyMap: rootMapping({
        a: { mapTo: 'a_k', type: ProjectionType.MAP },
        b: { mapTo: 'b_k', type: ProjectionType.MAP },
      }),
      original: { a: 'b', b: 1 },
      expected: { a_k: 'b', b_k: 1 },
    },
    {
      name: 'should ignore keys of object based on keyMap',
      keyMap: rootMapping({
        a: { mapTo: 'a_k', type: ProjectionType.MAP },
        b: { mapTo: '', type: ProjectionType.IGNORE },
      }),
      original: { a: 'b', b: 1 },
      expected: { a_k: 'b' },
    },
    {
      name: 'should ignore keys of object based on keyMap (fromDB)',
      keyMap: rootMapping({
        a: { mapTo: 'a_k', type: ProjectionType.MAP },
        b: { mapTo: 'b_k', type: ProjectionType.ONLY_FROM_DB },
      }),
      original: { a: 'b', b: 1 },
      expected: { a_k: 'b' },
    },
    {
      name: 'should map keys of object based on keyMap (toDB)',
      keyMap: rootMapping({
        a: { mapTo: 'a_k', type: ProjectionType.MAP },
        b: { mapTo: 'b_k', type: ProjectionType.ONLY_TO_DB },
      }),
      original: { a: 'b', b: 1 },
      expected: { a_k: 'b', b_k: 1 },
    },
    {
      name: 'should ignore keys of object on invalid keyMap',
      keyMap: rootMapping({
        a: { mapTo: 'a_k', type: ProjectionType.MAP },
        b: { mapTo: 'b_k', type: 'asd' as any },
      }),
      original: { a: 'b', b: 1 },
      expected: { a_k: 'b' },
    },
    {
      name: 'should map keys to the same key of object on invalid mapTo, leaving out corrupted mappings',
      keyMap: rootMapping({
        a: { mapTo: 'a_k', type: ProjectionType.MAP },
        b: { type: ProjectionType.MAP },
      } as any),
      original: { a: 'b', b: 1 },
      expected: { a_k: 'b' },
    },
    {
      name: 'should ignore keys missing from obj',
      keyMap: rootMapping({
        a: { mapTo: 'a_k', type: ProjectionType.MAP },
        b: { mapTo: 'b_k', type: ProjectionType.MAP },
      }),
      original: { a: 'b' },
      expected: { a_k: 'b' },
    },
    {
      name: 'should enable embedded mappings',
      keyMap: rootMapping({
        a: { mapTo: 'a_k', type: ProjectionType.MAP },
        b: { mapTo: 'b_k', type: ProjectionType.MAP },
        c: embeddedMapping({
          d: { mapTo: 'c_d_k', type: ProjectionType.MAP },
        }),
      }),
      original: { a: 'b', c: { d: 3 } },
      expected: { a_k: 'b', c_d_k: 3 },
    },
    {
      name: 'should enable deep embedded mappings',
      keyMap: rootMapping({
        a: { mapTo: 'a_k', type: ProjectionType.MAP },
        b: { mapTo: 'b_k', type: ProjectionType.MAP },
        c: embeddedMapping({
          d: { mapTo: 'c_d_k', type: ProjectionType.MAP },
          e: embeddedMapping({
            f: { mapTo: 'c_e_f_k', type: ProjectionType.MAP },
          }),
        }),
      }),
      original: { a: 'b', c: { d: 3, e: { f: 4 } } },
      expected: { a_k: 'b', c_d_k: 3, c_e_f_k: 4 },
    },
  ];
  testData.forEach((d) =>
    it(d.name, () => {
      expect(renameKeysToDB(d.keyMap, d.original)).toEqual(d.expected);
    }),
  );
});

describe('renameKeysFromDB', () => {
  interface TestDataItem<T extends RecordKeyType> {
    name: string;
    keyMap: RootMapping;
    original: RecordKeyType;
    expected: T;
  }

  type TestObj = {
    a: string;
    b?: number;
    c?: {
      d: number;
      e?: {
        f?: number;
      };
    };
  };

  const testData: TestDataItem<TestObj>[] = [
    {
      name: 'should rename keys of object based on keyMap',
      keyMap: rootMapping({
        a: { mapTo: 'a_k', type: ProjectionType.MAP },
        b: { mapTo: 'b_k', type: ProjectionType.MAP },
      }),
      original: { a_k: 'b', b_k: 1 },
      expected: { a: 'b', b: 1 },
    },
    {
      name: 'should ignore keys of object based on keyMap',
      keyMap: rootMapping({
        a: { mapTo: 'a_k', type: ProjectionType.MAP },
        b: { mapTo: 'b_k', type: ProjectionType.IGNORE },
      }),
      original: { a_k: 'b', b_k: 1 },
      expected: { a: 'b' },
    },
    {
      name: 'should map keys of object based on keyMap (fromDB)',
      keyMap: rootMapping({
        a: { mapTo: 'a_k', type: ProjectionType.MAP },
        b: { mapTo: 'b_k', type: ProjectionType.ONLY_FROM_DB },
      }),
      original: { a_k: 'b', b_k: 1 },
      expected: { a: 'b', b: 1 },
    },
    {
      name: 'should ignore keys of object based on keyMap (toDB)',
      keyMap: rootMapping({
        a: { mapTo: 'a_k', type: ProjectionType.MAP },
        b: { mapTo: 'b_k', type: ProjectionType.ONLY_TO_DB },
      }),
      original: { a_k: 'b', b_k: 1 },
      expected: { a: 'b' },
    },
    {
      name: 'should ignore keys of object on invalid keyMap',
      keyMap: rootMapping({
        a: { mapTo: 'a_k', type: ProjectionType.MAP },
        b: { mapTo: 'b_k', type: 'asd' as any },
      }),
      original: { a_k: 'b', b_k: 1 },
      expected: { a: 'b' },
    },
    {
      name: 'should map keys to the same key of object on invalid mapTo, leaving out fields that are corrupt',
      keyMap: rootMapping({
        a: { mapTo: 'a_k', type: ProjectionType.MAP },
        b_k: { type: ProjectionType.MAP },
      } as any),
      original: { a_k: 'b', b_k: 1 },
      expected: { a: 'b' } as any,
    },
    {
      name: 'should ignore keys missing from obj',
      keyMap: rootMapping({
        a: { mapTo: 'a_k', type: ProjectionType.MAP },
        b: { mapTo: 'b_k', type: ProjectionType.MAP },
      }),
      original: { a_k: 'b' },
      expected: { a: 'b' },
    },
    {
      name: 'should enable embedded mappings back from db',
      keyMap: rootMapping({
        a: { mapTo: 'a_k', type: ProjectionType.MAP },
        b: { mapTo: 'b_k', type: ProjectionType.MAP },
        c: embeddedMapping({
          d: { mapTo: 'c_d_k', type: ProjectionType.MAP },
        }),
      }),
      original: { a_k: 'b', c_d_k: 3 },
      expected: { a: 'b', c: { d: 3 } },
    },
    {
      name: 'should enable deep embedded mappings back from db',
      keyMap: rootMapping({
        a: { mapTo: 'a_k', type: ProjectionType.MAP },
        b: { mapTo: 'b_k', type: ProjectionType.MAP },
        c: embeddedMapping({
          d: { mapTo: 'c_d_k', type: ProjectionType.MAP },
          e: embeddedMapping({
            f: { mapTo: 'c_e_f_k', type: ProjectionType.MAP },
          }),
        }),
      }),
      original: { a_k: 'b', c_d_k: 3, c_e_f_k: 4 },
      expected: { a: 'b', c: { d: 3, e: { f: 4 } } },
    },
  ];
  testData.forEach((d) =>
    it(d.name, () => {
      expect(renameKeysFromDB(d.keyMap, d.original)).toEqual(d.expected);
    }),
  );
});
