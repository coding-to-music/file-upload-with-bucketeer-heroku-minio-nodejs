export type SqlTemplateArg =
  | string
  | number
  | boolean
  | Date
  | null
  | { [Key in string]?: SqlTemplateArg }
  | SqlTemplateArg[];
type SqlTemplateArgIn = SqlTemplateResult | SqlTemplateArg;
type SqlTemplateArgs = (SqlTemplateArgIn | SqlTemplateArgIn[])[];
export type SqlTemplateResult = {
  text: string;
  values: SqlTemplateArg[];
};

interface SqlTemplateFunction {
  (parts: string): SqlTemplateResult;
  (parts: string[], ...args: SqlTemplateArgs): SqlTemplateResult;
  (parts: TemplateStringsArray, ...args: SqlTemplateArgs): SqlTemplateResult;
}

class SqlTemplateResultObject implements SqlTemplateResult {
  constructor(
    public text: string,
    public values: SqlTemplateArg[],
    public raw: {
      parts: string[];
      args: SqlTemplateArgs;
      counter: number;
    },
  ) {}
}

const sqlFn: SqlTemplateFunction = (
  _parts: string | string[] | TemplateStringsArray,
  ...args: SqlTemplateArgs
): SqlTemplateResult => {
  const parts = Array.isArray(_parts) ? _parts : [_parts as string];
  return parse(parts, args);
};

const sqlInsertArray: (vals: SqlTemplateArg[][]) => SqlTemplateResult = (vals) =>
  sqlFn(
    ['', ...Array<string>(Math.max(0, vals.length - 1)).fill(', '), ''],
    ...vals.map((a) => sqlFn`${sqlGroupArray(a)}`),
  );

const sqlGroupArray: (vals: SqlTemplateArg[]) => SqlTemplateResult = (vals) =>
  sqlFn(['(', ...Array<string>(Math.max(0, vals.length - 1)).fill(', '), ')'], ...vals.map((a) => sqlFn`${a}`));
const sqlArrayItems: (vals: SqlTemplateArg[]) => SqlTemplateResult = (vals) =>
  sqlFn(['ARRAY[', ...Array<string>(Math.max(0, vals.length - 1)).fill(', '), ']'], ...vals.map((a) => sqlFn`${a}`));

const sqlSetMap: (vals: { [key: string]: SqlTemplateArg }) => SqlTemplateResult = (vals) =>
  sqlFn(
    ['', ...Array<string>(Object.keys(vals).length - 1).fill(', '), ''],
    ...Object.keys(vals).map((key) => sqlFn`${sqlFn(key)} = ${vals[key]}`),
  );

const sqlAndEqual: (vals: { [key: string]: SqlTemplateArg }) => SqlTemplateResult = (vals) =>
  sqlFn(
    ['', ...Array<string>(Object.keys(vals).length - 1).fill(' AND '), ''],
    ...Object.keys(vals).map((key) => sqlFn`${sqlFn(key)} = ${vals[key]}`),
  );

interface SQLTemplate extends SqlTemplateFunction {
  insertArray: typeof sqlInsertArray;
  groupArray: typeof sqlGroupArray;
  setMap: typeof sqlSetMap;
  andEqual: typeof sqlAndEqual;
  arrayItems: typeof sqlArrayItems;
}

const sql: SQLTemplate = Object.assign(sqlFn, {
  insertArray: sqlInsertArray,
  groupArray: sqlGroupArray,
  setMap: sqlSetMap,
  andEqual: sqlAndEqual,
  arrayItems: sqlArrayItems,
});

export default sql;

export const isObject = (obj: unknown): boolean => {
  return obj === Object(obj) && typeof obj !== 'function';
};

function parse(parts: string[], args: SqlTemplateArgs, counter = 1): SqlTemplateResult {
  const result = parts.reduce<{
    text: string;
    values: SqlTemplateArg[];
    counter: number;
  }>(
    (acc, val, index) => {
      const arg = args[index];

      // last block
      if (!(index in args)) {
        return {
          text: acc.text + val,
          values: acc.values,
          counter: acc.counter,
        };
      }

      // nested value
      if (arg instanceof SqlTemplateResultObject) {
        const result = parse(arg.raw.parts, arg.raw.args, acc.counter) as SqlTemplateResultObject;
        return {
          text: acc.text + val + result.text,
          values: [...acc.values, ...result.values],
          counter: result.raw.counter,
        };
      }

      return {
        text: `${acc.text}${val}$${acc.counter}`,
        values: [...acc.values, arg as SqlTemplateArg],
        counter: acc.counter + 1,
      };
    },
    { counter, text: '', values: [] },
  );
  return new SqlTemplateResultObject(result.text, result.values, { parts, args, counter: result.counter });
}
