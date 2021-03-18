import pino from 'pino';
import { Logger } from './logger';

export const loggerPinoFactory = ({ level, name, version }: { level: string; name: string; version: string }): Logger =>
  pino({
    name,
    level,
    timestamp: () => `,"time":"${new Date().toISOString()}"`,
    messageKey: 'message',
  }).child({ version });
