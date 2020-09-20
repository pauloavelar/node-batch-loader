declare module 'simple-node-logger' {
  export type LoggerOptions = { [key: string]: any };
  export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace';

  export class Logger {
    setLevel(level: LogLevel): void;
    error(...args: any): void;
    warn(...args: any): void;
    info(...args: any): void;
    debug(...args: any): void;
    trace(...args: any): void;
  }

  export function createSimpleLogger(options?: string | LoggerOptions): Logger;
}
