import { ImageRepo } from './image-repo';
import { createImageRepoForTest } from './image-repo.factory';
import { ImageService, imageServiceFactory } from './image-service';

export const createImageServiceForTest = ({
  imageRepo = createImageRepoForTest(),
}: {
  imageRepo: ImageRepo;
}): ImageService => imageServiceFactory({ imageRepo });
