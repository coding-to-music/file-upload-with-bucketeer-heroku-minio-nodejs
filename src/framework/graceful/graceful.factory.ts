import { Consumer, GracefulWrapper, Server } from './graceful-stop';

export const serverFactory = (): Server => ({
  close: async () => Promise.resolve(),
});
export const gracefulWrapperFactory = ({
  timeout = 1000,
  shutdown = async () => Promise.resolve(),
} = {}): GracefulWrapper => ({
  timeout,
  shutdown,
});

export const consumerFactory = ({
  isProcessing = async () => Promise.resolve(true),
  stopReception = async () => Promise.resolve(),
  closeReception = async () => Promise.resolve(),
}: Partial<Consumer>): Consumer => ({
  stopReception,
  isProcessing,
  closeReception,
});
