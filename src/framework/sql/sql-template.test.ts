/* eslint-disable @typescript-eslint/naming-convention */
import sql, { isObject, SqlTemplateResult } from './sql-template';

interface TestDataInput {
  testName: string;
  input: unknown;
  expected: boolean;
}

describe('sql-template', () => {
  describe('isObject', () => {
    const testCases: TestDataInput[] = [
      {
        testName: 'should return true for array',
        input: [],
        expected: true,
      },
      {
        testName: 'should return true for object',
        input: { k: true },
        expected: true,
      },
      {
        testName: 'should return false for undefined',
        input: undefined,
        expected: false,
      },
      {
        testName: 'should return false for null',
        input: null,
        expected: false,
      },
      {
        testName: 'should return false for an arrow function',
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        input: (): void => {},
        expected: false,
      },
      {
        testName: 'should return false for a function',
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        input: function (): void {},
        expected: false,
      },
    ];

    testCases.forEach((t) => {
      it(t.testName, () => {
        expect(isObject(t.input)).toBe(t.expected);
      });
    });
  });
  describe('sql', () => {
    interface TestDataInput {
      testName: string;
      query: SqlTemplateResult;
      expectedText: string;
      expectedValues: unknown[];
    }

    const testCases: TestDataInput[] = [
      {
        testName: 'should work as function with regular string',
        query: sql('bur'),
        expectedText: 'bur',
        expectedValues: [],
      },
      {
        testName: 'should work as function with regular string array',
        query: sql(['bur ', 'kek']),
        expectedText: 'bur kek',
        expectedValues: [],
      },
      {
        testName: 'should work as function with regular string array and value',
        query: sql(['bur ', ' kek'], 1),
        expectedText: 'bur $1 kek',
        expectedValues: [1],
      },
      {
        testName: 'should work as function with template string',
        query: sql(`bur ${1}`),
        expectedText: 'bur 1',
        expectedValues: [],
      },
      {
        testName: 'should return empty text',
        query: sql``,
        expectedText: '',
        expectedValues: [],
      },
      {
        testName: 'should return same text',
        query: sql`SELECT * FROM users;`,
        expectedText: 'SELECT * FROM users;',
        expectedValues: [],
      },
      {
        testName: 'should return replaced text with single value',
        query: sql`SELECT * FROM users WHERE id = ${'foo'};`,
        expectedText: 'SELECT * FROM users WHERE id = $1;',
        expectedValues: ['foo'],
      },
      {
        testName: 'should return replaced text with single value on the beginning',
        query: sql`${'foo'}SELECT * FROM users WHERE id = ;`,
        expectedText: '$1SELECT * FROM users WHERE id = ;',
        expectedValues: ['foo'],
      },
      {
        testName: 'should return replaced text with single value on the end',
        query: sql`SELECT * FROM users WHERE id = ;${'foo'}`,
        expectedText: 'SELECT * FROM users WHERE id = ;$1',
        expectedValues: ['foo'],
      },
      {
        testName: 'should return replaced text with multiple values',
        query: sql`SELECT * FROM users WHERE id = ${'foo'} AND name = ${'bar'} AND age < ${21};`,
        expectedText: 'SELECT * FROM users WHERE id = $1 AND name = $2 AND age < $3;',
        expectedValues: ['foo', 'bar', 21],
      },
      {
        testName: 'should return replaced text with array',
        query: sql`SELECT * FROM users WHERE id IN ${sql.groupArray(['foo', 'bar', 'quux'])};`,
        expectedText: 'SELECT * FROM users WHERE id IN ($1, $2, $3);',
        expectedValues: ['foo', 'bar', 'quux'],
      },
      {
        testName: 'should return replaced text with array and multiple values',
        query: sql`SELECT * FROM users WHERE name = ${'kek'} AND id IN ${sql.groupArray([
          'foo',
          'bar',
          'quux',
        ])} AND age < ${21};`,
        expectedText: 'SELECT * FROM users WHERE name = $1 AND id IN ($2, $3, $4) AND age < $5;',
        expectedValues: ['kek', 'foo', 'bar', 'quux', 21],
      },
      {
        testName: 'should return nested templated text',
        query: sql`SELECT * FROM users WHERE id = ${sql('foo')};`,
        expectedText: 'SELECT * FROM users WHERE id = foo;',
        expectedValues: [],
      },
      {
        testName: 'should return nested templated text 2',
        query: sql`SELECT * FROM users WHERE id = ${sql('foo')} AND name = ${'bar'};`,
        expectedText: 'SELECT * FROM users WHERE id = foo AND name = $1;',
        expectedValues: ['bar'],
      },
      {
        testName: 'should return nested templated text 2 with array',
        query: sql`SELECT * FROM users WHERE id = ${sql('foo')} AND ${sql`age IN ${sql.groupArray([
          18,
          19,
          20,
        ])}`} AND name = ${'bar'};`,
        expectedText: 'SELECT * FROM users WHERE id = foo AND age IN ($1, $2, $3) AND name = $4;',
        expectedValues: [18, 19, 20, 'bar'],
      },
      {
        testName: 'should return nested templated text 3',
        query: sql`SELECT * FROM users WHERE id = ${sql('foo')} AND ${sql`(kek = ${sql(
          'bur',
        )} OR ${sql`foo IN ${sql.groupArray(['quux', 'baaz'])}`})`} AND ${sql`age IN ${sql.groupArray([
          18,
          19,
          20,
        ])}`} AND name = ${'bar'};`,
        expectedText:
          'SELECT * FROM users WHERE id = foo AND (kek = bur OR foo IN ($1, $2)) AND age IN ($3, $4, $5) AND name = $6;',
        expectedValues: ['quux', 'baaz', 18, 19, 20, 'bar'],
      },
      {
        testName: 'should return nested templated key value pairs',
        query: sql`UPDATE ${sql('users')} SET ${sql.setMap({
          is_disabled: true,
          password_hash: 'kl',
        })} WHERE id = ${'id'};`,
        expectedText: 'UPDATE users SET is_disabled = $1, password_hash = $2 WHERE id = $3;',
        expectedValues: [true, 'kl', 'id'],
      },
      {
        testName: 'should return multi array insert',
        query: sql`INSERT INTO resource (id, name) VALUES ${sql.insertArray([
          [1, 2],
          [3, 4],
        ])};`,
        expectedText: 'INSERT INTO resource (id, name) VALUES ($1, $2), ($3, $4);',
        expectedValues: [1, 2, 3, 4],
      },
      {
        testName: 'should return multi array insert with 1 element',
        query: sql`INSERT INTO resource (id) VALUES ${sql.insertArray([[1]])};`,
        expectedText: 'INSERT INTO resource (id) VALUES ($1);',
        expectedValues: [1],
      },
      {
        testName: 'should return return json in template',
        query: sql`INSERT INTO resource (id, json) VALUES (${1}, ${{ hello: 'world' }});`,
        expectedText: 'INSERT INTO resource (id, json) VALUES ($1, $2);',
        expectedValues: [1, { hello: 'world' }],
      },
      {
        testName: 'should return return array in template',
        query: sql`INSERT INTO resource (id, json) VALUES (${1}, ${[2, 3]});`,
        expectedText: 'INSERT INTO resource (id, json) VALUES ($1, $2);',
        expectedValues: [1, [2, 3]],
      },
    ];

    testCases.forEach((t) => {
      it(t.testName, () => {
        expect(t.query.text).toEqual(t.expectedText);
        expect(t.query.values).toEqual(t.expectedValues);
      });
    });
  });
});
