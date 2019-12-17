const HEADER_KEY = 'authorization';
const BEARER_PREFIX = 'Bearer ';

export const getTokenFromHeader = (headers: { [key: string]: string | string[] }): string => {
  const value = headers[HEADER_KEY];
  if (!value) {
    return '';
  }
  if (Array.isArray(value)) {
    return '';
  }
  if (!value.startsWith(BEARER_PREFIX)) {
    return '';
  }
  return value.slice(BEARER_PREFIX.length);
};
