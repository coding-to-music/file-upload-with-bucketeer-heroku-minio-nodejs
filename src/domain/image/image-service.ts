import { v4 } from 'uuid';
import { ListResult } from '../list/list';
import { AddImageOptions, Image } from './image';
import { ImageRepo } from './image-repo';

export interface ImageService {
  create(cluster: AddImageOptions): Promise<void>;
  getAll(params: { skip: number; limit: number }): Promise<ListResult<Image>>;
}

export const imageServiceFactory = ({ imageRepo }: { imageRepo: ImageRepo }): ImageService => {
  const getAll: ImageService['getAll'] = async (params): Promise<ListResult<Image>> => {
    const [count, items] = await Promise.all([imageRepo.countAll(), imageRepo.getAll(params)]);

    return { count, items };
  };

  const create: ImageService['create'] = async (image): Promise<void> => {
    const id = v4();
    return imageRepo.addResource({ ...image, id });
  };

  return {
    create,
    getAll,
  };
};
