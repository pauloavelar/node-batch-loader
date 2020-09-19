import { BatchConfig } from './types';
import { validateConfig } from './validators';

export function runImport(config: BatchConfig) {
  validateConfig(config);

  // TODO read file
  // TODO divide into chunks
  // TODO transform each item
  // TODO call API
  // TODO run validator if present
  // TODO log+save errors and successes
}
