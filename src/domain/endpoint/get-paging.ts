import { PageOptions } from '../list/list';

export const getPagingOptions = ({ skip, limit }: { skip: string; limit: string }): PageOptions => ({
  skip: parseInt(skip) || 0,
  limit: parseInt(limit) || 10,
});
