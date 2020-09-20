import { Logger } from 'simple-node-logger';
import { BatchConfig } from './types';

export class ConfigValidator {
  constructor(
    logger: Logger,
  ) { }

  validate(config: BatchConfig) {
    // TODO validate if config values are consistent
  }
}
