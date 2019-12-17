import {
  delay,
  GracefulWrapper,
  gracefulWrapperHTTPFactory,
  gracefulWrapperConsumerFactory,
  runWithTimeout,
  stopGracefully,
  terminationHandlerFactory,
  timeout,
  TimeoutError,
} from './graceful-stop';
import { gracefulWrapperFactory, consumerFactory, serverFactory } from './graceful.factory';

describe('timeout', () => {
  test('should reject on timeout', async () => {
    await expect(timeout(1)).rejects.toThrow(TimeoutError);
  });
});

describe('delay', () => {
  test('should resolve on delay', async () => {
    await expect(delay(1)).resolves.toBeUndefined();
  });
});

describe('runWithTimeout', () => {
  test('should reject on timeout', async () => {
    await expect(runWithTimeout(1, delay(4))).rejects.toThrow(TimeoutError);
  });

  test('should not reject on non-timeout', async () => {
    const res = await runWithTimeout(4, delay(1));
    expect(res).toBeUndefined();
  });
});

describe('stopGracefully', () => {
  test('should setup emission listeners', () => {
    const gracefulWrapper = gracefulWrapperFactory();
    gracefulWrapper.shutdown = jest.fn();

    process.on = jest.fn();
    stopGracefully({
      processSignals: ['SIGINT', 'SIGTERM'],
      gracefulWrappers: [gracefulWrapper],
    });

    expect(process.on).toBeCalledWith('SIGTERM', expect.any(Function));
    expect(process.on).toBeCalledWith('SIGINT', expect.any(Function));
  });
});

describe('terminationHandlerFactory', () => {
  interface TestCase {
    name: string;
    expectedExitCode: number;
    timeout: number;
    cleanup?: () => Promise<void>;
    gracefulWrappers: GracefulWrapper[];
  }

  const cases: TestCase[] = [
    {
      name: 'should exit with 0 if completed in time',
      expectedExitCode: 0,
      timeout: 10,
      gracefulWrappers: [gracefulWrapperFactory()],
    },
    {
      name: 'should exit with 0 if completed in time with cleanup',
      expectedExitCode: 0,
      timeout: 10,
      cleanup: async () => Promise.resolve(),
      gracefulWrappers: [gracefulWrapperFactory()],
    },
    {
      name: 'should exit with 1 if cleanup could not finish in time',
      expectedExitCode: 1,
      timeout: 10,
      cleanup: () => delay(20),
      gracefulWrappers: [gracefulWrapperFactory()],
    },
    {
      name: 'should exit with 1 if cleanup and gracefulwrappers could not finish in time',
      expectedExitCode: 1,
      timeout: 10,
      cleanup: () => delay(7),
      gracefulWrappers: [gracefulWrapperFactory({ shutdown: () => delay(8) })],
    },
    {
      name: 'should exit with 1 if gracefulwrapper could not finish in time',
      expectedExitCode: 1,
      timeout: 1,
      gracefulWrappers: [gracefulWrapperFactory({ shutdown: () => delay(2) })],
    },
    {
      name: 'should exit with 1 if gracefulwrapper could not finish in its own time',
      expectedExitCode: 1,
      timeout: 10,
      gracefulWrappers: [gracefulWrapperFactory({ shutdown: () => delay(15), timeout: 1 })],
    },
  ];

  cases.forEach(({ name, expectedExitCode, timeout, cleanup, gracefulWrappers }) =>
    test(name, async () => {
      const onShutdown = jest.fn();
      const terminationFn = terminationHandlerFactory({ timeout, gracefulWrappers, onShutdown, cleanup });
      await terminationFn();

      expect(onShutdown).toHaveBeenCalledWith(expectedExitCode);
    }),
  );
});

describe('gracefulWrapperConsumerFactory', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('should initiate consumer shutdown', async () => {
    const consumer = consumerFactory({ isProcessing: () => Promise.resolve(false) });
    const spy = jest.spyOn(consumer, 'stopReception');

    await gracefulWrapperConsumerFactory(consumer).shutdown();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('should shutdown if no active requests are present', async () => {
    const consumer = consumerFactory({
      isProcessing: jest
        .fn()
        .mockResolvedValue(false)
        .mockResolvedValueOnce(true),
    });
    const spy = jest.spyOn(consumer, 'isProcessing');

    await gracefulWrapperConsumerFactory(consumer).shutdown();
    expect(spy).toHaveBeenCalledTimes(2);
  });
});

describe('gracefulWrapperHTTPFactory', () => {
  test('should shutdown', async () => {
    const server = serverFactory();
    server.close = jest.fn();
    const warpper = gracefulWrapperHTTPFactory(server);

    await warpper.shutdown();

    expect(server.close).toHaveBeenCalled();
  });
});
