import { NotFoundError } from '../../framework/error/errors';
import { Image } from './image';
import { ImageRepo } from './image-repo';

export interface ImageService {
  ensureAndGetByID(id: Image['id']): Promise<Image>;
  create(cluster: Image): Promise<void>;

  getAll(): Promise<Image[]>;
}

export const imageServiceFactory = ({ imageRepo }: { imageRepo: ImageRepo }): ImageService => {
  const ensureAndGetByID = async (id: string): Promise<Image> => {
    const image = await imageRepo.getByID(id);
    if (!image) {
      throw new NotFoundError('image');
    }
    return image;
  };

  const getAll = async (): Promise<Image[]> => {
    return imageRepo.getAll();
  };

  const create = async (image: Image): Promise<void> => {
    return imageRepo.addResource(image);
  };

  return {
    create,
    ensureAndGetByID,
    getAll,
  };
};
