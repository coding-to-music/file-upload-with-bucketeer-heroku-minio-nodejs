import { Resource } from '../resource/resource';

export type Image = Resource & {
  title: string;
  imageURL: string;
  createdAt: Date;
};

export type ImageListItemDTO = Image;

export type AddImageInputDTO = {
  title: string;
  imageURL: string;
};

export type AddImageOptions = Omit<Image, 'id'>;
