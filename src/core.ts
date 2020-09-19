import { createSimpleLogger, Logger } from 'simple-node-logger';

import { readFile } from './file-readers';
import { delay } from './helpers';
import { BatchConfig, ChunkSizeConfig, ConcurrencyConfig, Item, LogConfig, MapLikeObject, OutputLevel } from './types';
import { validateConfig } from './validators';

const DEFAULT_CHUNK_SIZE = 50;
const DEFAULT_MAX_RPM = 50 * 6;

function getStartingChunkSize(chunkSize?: number | ChunkSizeConfig): number {
  if (!chunkSize) {
    return DEFAULT_CHUNK_SIZE;
  }

  if (typeof chunkSize === 'number') {
    return chunkSize;
  }

  return chunkSize.initial;
}

function getMaxChunkSize(concurrencyConfig: ConcurrencyConfig): number {
  if (typeof concurrencyConfig.chunkSize === 'object') {
    return concurrencyConfig.chunkSize.maximum;
  }

  return concurrencyConfig.maximumRpm || DEFAULT_CHUNK_SIZE;
}

function createLogger(logConfig?: LogConfig): Logger {
  return createSimpleLogger({

  });
}

export async function runImport(config: BatchConfig) {
  const logger = createLogger(config.logging);

  validateConfig(config, logger);

  const items = readFile(config.input);
  const itemTransformer = config.input.itemTransformer;

  let currentChunkSize = getStartingChunkSize(config.concurrency.chunkSize);

  const maximumRpm = config.concurrency.maximumRpm || DEFAULT_MAX_RPM;
  const maxChunkSize = getMaxChunkSize(config.concurrency);
  const minWaitTimeMs = 60_000 / (maximumRpm / maxChunkSize);

  while (items.length > 0) {
    const chunk = items.splice(0, currentChunkSize);
    const startTime = new Date().getTime();

    const results = await Promise.all(chunk
      .map((item: Item) => (itemTransformer ? itemTransformer(item) : item))
      .map((transformed: MapLikeObject) => sendToApi(transformed, config.api)));

    const errorCount = runValidator(results, config.validator);
    logResults(results, config.output);

    const elapsed = new Date().getTime() - startTime;
    if (elapsed < minWaitTimeMs) {
      const waitTime = minWaitTimeMs - elapsed;
      await delay(waitTime);
    }

    if (currentChunkSize < maxChunkSize) {
      currentChunkSize = calculateNewChunkSize(currentChunkSize, errorCount, config.concurrency);
    }
  }

  // TODO log overall results
}
