import { StorageService } from '../../framework/storage/storage-service';
import { AsyncUseCase } from '../../framework/use-case/use-case';

export type ImageGetURLInput = { fileType: string };
export type ImageGetURLOutput = { uploadURL: string };

export type ImageGetURLUseCase = AsyncUseCase<ImageGetURLInput, ImageGetURLOutput>;

export const imageGetURLUseCaseFactory = ({
  storageService,
  bucketName,
}: {
  storageService: StorageService;
  bucketName: string;
}): ImageGetURLUseCase => async (input) => {
  const uploadURL = await storageService.getSignedURLForUpload(
    bucketName,
    `${Math.floor(Math.random() * 1000)}`,
    input.fileType,
  );
  return { uploadURL };
};
