type LoggerFn = {
  (msg: string, ...args: unknown[]): void;
  (obj: object, msg?: string, ...args: unknown[]): void;
};
export interface Logger {
  info: LoggerFn;
  fatal: LoggerFn;
  debug: LoggerFn;
  error: LoggerFn;
  warn: LoggerFn;
  child: (props: { name: string }) => Logger;
}
