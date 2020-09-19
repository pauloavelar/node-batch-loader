import { createSimpleLogger, Logger } from 'simple-node-logger';
import fetch from 'node-fetch';

import { readFile } from './file-readers';
import { delay, isNumber, isObject, isString } from './helpers';
import { BatchConfig, ChunkSizeConfig, Item, ItemResult, MapLikeObject } from './types';

export class Processor {
  private static readonly DEFAULT_CHUNK_SIZE = 50;
  private static readonly DEFAULT_MAX_RPM = 50 * 6;

  private readonly logger: Logger;

  constructor(
    private readonly config: BatchConfig,
    private readonly restClient = fetch,
  ) {
    this.logger = createSimpleLogger({ /* TODO add options */ });
  }

  async run(): Promise<void> {
    this.validateConfig();

    const items = readFile(this.config.input);
    const maximumRpm = this.getMaximumRpm();
    const maxChunkSize = this.getMaxChunkSize();
    const minWaitTimeMs = this.calculateMinWaitTime(maximumRpm, maxChunkSize);

    let currentChunkSize = this.getStartingChunkSize();

    while (items.length > 0) {
      const chunk = items.splice(0, currentChunkSize);
      const startTime = new Date().getTime();

      const results = await Promise.all(chunk.map(
        (item: MapLikeObject) => this.sendToApi(item, this.transformItem(item)),
      ));

      const errorCount = this.runValidator(results);
      this.logResults(results, errorCount);

      const elapsed = new Date().getTime() - startTime;
      if (elapsed < minWaitTimeMs) {
        const waitTime = minWaitTimeMs - elapsed;
        await delay(waitTime);
      }

      if (currentChunkSize < maxChunkSize) {
        currentChunkSize = this.calculateNewChunkSize(currentChunkSize, errorCount);
      }
    }

    // TODO log overall results
  }

  private getStartingChunkSize(): number {
    const { chunkSize } = this.config.concurrency;

    if (!chunkSize) {
      return Processor.DEFAULT_CHUNK_SIZE;
    }

    return isNumber(chunkSize) ? chunkSize : chunkSize.initial;
  }

  private getMaxChunkSize(): number {
    const { concurrency } = this.config;

    if (isObject<ChunkSizeConfig>(concurrency.chunkSize)) {
      return concurrency.chunkSize.maximum;
    }

    return concurrency.maximumRpm || Processor.DEFAULT_CHUNK_SIZE;
  }

  private getMaximumRpm(): number {
    return this.config.concurrency.maximumRpm || Processor.DEFAULT_MAX_RPM;
  }

  private calculateMinWaitTime(maximumRpm: number, maxChunkSize: number): number {
    return 60_000 / (maximumRpm / maxChunkSize);
  }

  private transformItem(item: Item): MapLikeObject {
    const { itemTransformer } = this.config.input;
    return itemTransformer ? itemTransformer(item) : item;
  }

  private async sendToApi(item: Item, payload: MapLikeObject): Promise<ItemResult> {
    const { url, method = 'POST', headers } = this.config.api;

    const actualUrl = isString(url) ? url : url(item);
    const options = { method, headers, body: JSON.stringify(payload) };

    const response = await this.restClient(actualUrl, options);

    // TODO add id transformer if present

    return { item, status: response.status };
  }

  private validateConfig() {
    // TODO create validations
    return !!this.config;
  }
}
