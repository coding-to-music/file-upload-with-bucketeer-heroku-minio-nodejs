import { ImageService } from '../../domain/image/image-service';
import { AsyncUseCase } from '../../framework/use-case/use-case';
import { AddImageInputDTO } from '../../domain/image/image';

export type AddImageInput = AddImageInputDTO;

export type AddImageOutput = void;

export type AddImageUseCase = AsyncUseCase<AddImageInput, AddImageOutput>;

export const addImageUseCaseFactory = ({ imageService }: { imageService: ImageService }): AddImageUseCase => async (
  input,
) => {
  await imageService.create({
    createdAt: new Date(),
    name: input.name,
    imageURL: input.imageURL,
  });
};
