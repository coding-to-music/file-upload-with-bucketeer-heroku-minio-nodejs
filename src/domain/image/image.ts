import { Resource } from '../resource/resource';

export type Image = Resource & {
  name: string;
  imageURL: string;
  createdAt: Date;
};

export type ImageListItemDTO = Image;

export type AddImageInputDTO = {
  name: string;
  imageURL: string;
};

export type AddImageOptions = Omit<Image, 'id'>;
