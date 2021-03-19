import { ImageRepo } from './image-repo';
import { imageFactory } from './image.factory';

export const createImageRepoForTest = (): ImageRepo => ({
  getAll: async () => await Promise.resolve([imageFactory()]),
  countAll: async () => await Promise.resolve([imageFactory()].length),
  addResource: async () => await Promise.resolve(),
});
