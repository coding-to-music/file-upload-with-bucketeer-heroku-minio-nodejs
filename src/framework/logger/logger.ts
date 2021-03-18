type LoggerFn = {
  (msg: string, ...args: unknown[]): void;
  (obj: Record<string, unknown>, msg?: string, ...args: unknown[]): void;
};
export interface Logger {
  info: LoggerFn;
  debug: LoggerFn;
  error: LoggerFn;
  warn: LoggerFn;
  fatal: LoggerFn;
}
