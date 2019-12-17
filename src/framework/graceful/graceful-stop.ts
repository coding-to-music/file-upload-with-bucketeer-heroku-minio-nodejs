import { race } from 'bluebird';

export class TimeoutError extends Error {}

export const delay = (ttl: number): Promise<void> => new Promise<void>(res => setTimeout(() => res(), ttl));
export const timeout = (ttl: number): Promise<never> =>
  new Promise((_, rej) => setTimeout(() => rej(new TimeoutError()), ttl));
export const runWithTimeout = <T>(ttl: number, promise: Promise<T>): PromiseLike<T> => race([promise, timeout(ttl)]);

export interface Server {
  close: () => Promise<void>;
}

export interface GracefulWrapper {
  shutdown: () => Promise<void>;
  timeout: number;
}

export interface Consumer {
  stopReception: () => Promise<void>;
  closeReception: () => Promise<void>;
  isProcessing: () => Promise<boolean>;
}

export const gracefulWrapperConsumerFactory = (consumer: Consumer, timeout = 10000): GracefulWrapper => {
  return {
    timeout,
    shutdown: async () => {
      await consumer.stopReception();

      const endTime = Date.now() + (timeout - 100);
      while (endTime > Date.now() && (await consumer.isProcessing())) {
        await delay(50);
      }

      await consumer.closeReception();
    },
  };
};

export const gracefulWrapperHTTPFactory = (server: Server, timeout = 10000): GracefulWrapper => {
  return {
    timeout,
    shutdown: async () => {
      await server.close();
    },
  };
};

export const stopGracefully = ({
  gracefulWrappers,
  cleanup,
  processSignals = ['SIGTERM', 'SIGINT'],
  timeout = 10000,
  onShutdownGracefulSuccess,
  onShutdownGracefulFail,
  onShutdownStart,
}: {
  gracefulWrappers: GracefulWrapper[];
  timeout?: number;
  processSignals?: NodeJS.Signals[];
  cleanup?: () => Promise<void>;
  onShutdownStart?: () => void;
  onShutdownGracefulSuccess?: () => void;
  onShutdownGracefulFail?: () => void;
}): void => {
  processSignals.forEach(signal =>
    process.on(
      signal,
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      terminationHandlerFactory({
        timeout,
        gracefulWrappers,
        cleanup,
        onShutdownStart,
        onShutdownGracefulFail,
        onShutdownGracefulSuccess,
      }),
    ),
  );
};

export const terminationHandlerFactory = ({
  timeout,
  gracefulWrappers,
  cleanup,
  onShutdown = process.exit,
  onShutdownStart = () => {
    return;
  },
  onShutdownGracefulSuccess = () => {
    return;
  },
  onShutdownGracefulFail = () => {
    return;
  },
}: {
  timeout: number;
  gracefulWrappers: GracefulWrapper[];
  cleanup?: () => Promise<void>;
  onShutdown?: (code: number) => void;
  onShutdownStart?: () => void;
  onShutdownGracefulSuccess?: () => void;
  onShutdownGracefulFail?: () => void;
}) => async () => {
  try {
    onShutdownStart();
    await runWithTimeout(
      timeout,
      (async () => {
        await Promise.all(gracefulWrappers.map(g => runWithTimeout(g.timeout, g.shutdown())));
        if (cleanup) {
          await cleanup();
        }
      })(),
    );
  } catch (err) {
    onShutdownGracefulFail();
    return onShutdown(1);
  }
  onShutdownGracefulSuccess();
  return onShutdown(0);
};
