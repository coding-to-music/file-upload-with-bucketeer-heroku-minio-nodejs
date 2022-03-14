export interface Image {
  title: string;
  imageURL: string;
  createdAt: Date;
  id: string;
}

export interface ListResponse<T> {
  count: number;
  items: T[];
}
