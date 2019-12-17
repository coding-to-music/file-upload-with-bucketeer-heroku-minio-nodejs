const thrower = (err: unknown): void => {
  throw err;
};

const throwToGlobal = (err: unknown): NodeJS.Immediate => setImmediate(() => thrower(err));

export const handleUnhandledRejections = (): NodeJS.Process => process.on('unhandledRejection', throwToGlobal);
