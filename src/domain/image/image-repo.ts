import { AddableResourceRepo, ReadableResourceRepo } from '../resource/resource-repo';
import { Image } from './image';

export interface ImageRepo extends AddableResourceRepo<Image>, ReadableResourceRepo<Image> {
  getAll(): Promise<Image[]>;
}
