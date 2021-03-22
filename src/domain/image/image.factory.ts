import { v4 } from 'uuid';
import { Image } from './image';

export const imageFactory = ({
  id = v4(),
  title = v4(),
  createdAt = new Date(),
  imageURL = v4(),
}: Partial<Image> = {}): Image => ({
  id,
  title,
  createdAt,
  imageURL,
});
