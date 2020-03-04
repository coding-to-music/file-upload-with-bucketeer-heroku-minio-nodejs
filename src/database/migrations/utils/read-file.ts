import fs from 'fs';

export const readSQL = (fileName: string): Promise<string> => fs.promises.readFile(fileName, { encoding: 'utf-8' });
