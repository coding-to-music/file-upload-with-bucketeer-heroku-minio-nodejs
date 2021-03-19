import { v4 } from 'uuid';
import { Image } from './image';

export const imageFactory = ({
  id = v4(),
  name = v4(),
  createdAt = new Date(),
  imageURL = v4(),
}: Partial<Image> = {}): Image => ({
  id,
  name,
  createdAt,
  imageURL,
});
