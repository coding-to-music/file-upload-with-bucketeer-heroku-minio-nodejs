export interface ListResult<T> {
  items: T[];
  count: number;
}

export type PageOptions = {
  limit: number;
  skip: number;
};

export type SortOptions = {
  sort: {
    property: string;
    order: SortOrder;
  }[];
};

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export type FilterOptions = {
  filter: {
    property: string;
    value: string;
  }[];
};
