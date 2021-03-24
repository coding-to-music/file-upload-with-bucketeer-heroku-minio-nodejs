import { runInContext, getContext } from './run-in-context';

describe('run-in-context', () => {
  test('put and read variable to and from context', () => {
    return runInContext(() => {
      {
        const context = getContext();
        context.set('foo', 'bar');
      }
      {
        const context = getContext();
        const result = context.get('foo') as string;
        expect(result).toBe('bar');
      }
    });
  });
});
