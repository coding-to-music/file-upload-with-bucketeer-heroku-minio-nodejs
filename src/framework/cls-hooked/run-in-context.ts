import { getNamespace, createNamespace, Namespace } from 'cls-hooked';

export const NAMESPACE_KEY_CONTEXT = 'context';
export const runInContext = <T>(fn: (...args: unknown[]) => T): T => {
  const context = getNamespace(NAMESPACE_KEY_CONTEXT) || createNamespace(NAMESPACE_KEY_CONTEXT);
  return context.runAndReturn<T>(fn);
};

export const getContext = (): Namespace => {
  const context = getNamespace(NAMESPACE_KEY_CONTEXT);
  if (!context) {
    throw new Error('Context was not set before getting');
  }
  return context;
};
