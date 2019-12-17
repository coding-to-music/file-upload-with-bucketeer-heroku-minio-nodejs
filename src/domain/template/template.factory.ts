import { v4 } from 'uuid';
import { Template } from './template';

export const templateFactory = ({
  id = v4(),
  name = v4(),
  template = v4(),
  inputSchema = { type: 'object' },
}: Partial<Template> = {}): Template => ({
  id,
  name,
  template,
  inputSchema,
});
