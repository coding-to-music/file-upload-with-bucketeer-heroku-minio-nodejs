import { ImageListItemDTO } from '../../domain/image/image';
import { ImageService } from '../../domain/image/image-service';
import { ListResult, PageOptions } from '../../domain/list/list';
import { AsyncUseCase } from '../../framework/use-case/use-case';

export type ListImagesInput = PageOptions;
export type ListImagesOutput = ListResult<ImageListItemDTO>;

export type ListImagesUseCase = AsyncUseCase<ListImagesInput, ListImagesOutput>;

export const listImagesUseCaseFactory = ({ imageService }: { imageService: ImageService }): ListImagesUseCase => async (
  input,
) => {
  const { count, items } = await imageService.getAll({
    skip: input.skip,
    limit: input.limit,
  });

  return {
    count,
    items,
  };
};
