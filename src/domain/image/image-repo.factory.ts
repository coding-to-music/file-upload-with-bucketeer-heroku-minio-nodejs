import { ImageRepo } from './image-repo';
import { imageFactory } from './image.factory';

export const createImageRepoForTest = (): ImageRepo => ({
  getAll: async () => await Promise.resolve([imageFactory()]),
  getByID: async () => await Promise.resolve(imageFactory()),
  addResource: async () => await Promise.resolve(),
});
