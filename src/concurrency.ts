import { isNumber, isObject } from './helpers';
import { ChunkSizeConfig, ConcurrencyConfig } from './types';

export class ConcurrencyService {
  private static readonly DEFAULT_CHUNK_SIZE = 50;
  private static readonly DEFAULT_MAX_RPM = 50 * 6;

  constructor(
    private readonly config: ConcurrencyConfig,
  ) { }

  getStartingChunkSize(): number {
    const { chunkSize } = this.config;

    if (!chunkSize) {
      return ConcurrencyService.DEFAULT_CHUNK_SIZE;
    }

    return isNumber(chunkSize) ? chunkSize : chunkSize.initial;
  }

  getMaxChunkSize(): number {
    if (isObject<ChunkSizeConfig>(this.config.chunkSize)) {
      return this.config.chunkSize.maximum;
    }

    return this.config.maximumRpm || ConcurrencyService.DEFAULT_CHUNK_SIZE;
  }

  getMaximumRpm(): number {
    return this.config.maximumRpm || ConcurrencyService.DEFAULT_MAX_RPM;
  }

  calculateMinWaitTime(maximumRpm: number, maxChunkSize: number): number {
    return 60_000 / (maximumRpm / maxChunkSize);
  }

  calculateNewChunkSize(current: number, errorCount: number): number {
    if (!this.config.chunkSize) {
      return current;
    }

    if (isNumber(this.config.chunkSize)) {
      return this.config.chunkSize;
    }

    if (isNumber(this.config.chunkSize?.growth)) {
      return current * this.config.chunkSize?.growth;
    }

    const errorRate = errorCount / current;
    return this.config.chunkSize.growth(current, errorRate);
  }
}
