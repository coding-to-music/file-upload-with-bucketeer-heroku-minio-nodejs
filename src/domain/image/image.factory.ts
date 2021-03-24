import { v4 } from 'uuid';
import { ImageWithTitle } from './image';

export const imageFactory = ({
  id = v4(),
  title = v4(),
  createdAt = new Date(),
  imageURL = v4(),
}: Partial<ImageWithTitle> = {}): ImageWithTitle => ({
  id,
  title,
  createdAt,
  imageURL,
});
