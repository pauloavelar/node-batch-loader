import { createReadStream, ReadStream } from 'fs';
import { Readable } from 'stream';
import { createSimpleLogger, Logger } from 'simple-node-logger';

import { File, LogConfig } from './types';

const DEFAULT_LOG_FILE = 'batch-loader-logs.txt';

export async function delay(ms: number): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(() => resolve(), ms));
}

export function isNumber(value: any): value is number {
  return typeof value === 'number';
}

export function isString(value: any): value is string {
  return typeof value === 'string';
}

export function isObject<T>(value: any | T): value is T {
  return typeof value === 'object';
}

export function createLogger(config?: LogConfig): Logger {
  if (config?.toFile) {
    if (isString(config.toFile)) {
      return createSimpleLogger(config.toFile);
    }

    return createSimpleLogger(DEFAULT_LOG_FILE);
  }

  return createSimpleLogger();
}

export function convertFileToStream(file: File): Readable {
  if (Buffer.isBuffer(file)) {
    return Readable.from(file.toString());
  }
  if (file instanceof ReadStream) {
    return file;
  }

  return createReadStream(file);
}
