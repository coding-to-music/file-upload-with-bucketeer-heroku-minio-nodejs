import { AddableResourceRepo } from '../resource/resource-repo';
import { ImageWithTitle } from './image';

export interface ImageRepo extends AddableResourceRepo<ImageWithTitle> {
  getAll(params: { skip: number; limit: number }): Promise<ImageWithTitle[]>;
  countAll(): Promise<number>;
}
