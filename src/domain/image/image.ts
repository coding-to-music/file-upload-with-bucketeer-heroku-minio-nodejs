import { Resource } from '../resource/resource';

export type ImageWithTitle = Resource & {
  title: string;
  imageURL: string;
  createdAt: Date;
};

export type ImageListItemDTO = ImageWithTitle;

export type AddImageInputDTO = {
  title: string;
  imageURL: string;
};

export type AddImageOptions = Omit<ImageWithTitle, 'id'>;
