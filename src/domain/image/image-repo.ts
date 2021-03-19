import { AddableResourceRepo } from '../resource/resource-repo';
import { Image } from './image';

export interface ImageRepo extends AddableResourceRepo<Image> {
  getAll(params: { skip: number; limit: number }): Promise<Image[]>;
  countAll(): Promise<number>;
}
