import { Logger } from 'simple-node-logger';

import { readFile } from './file-readers';
import { createLogger, delay } from './helpers';
import { BatchConfig, Item, ItemResult, MapLikeObject } from './types';
import { ApiService } from './rest';
import { ConfigValidator } from './validators';
import { ConcurrencyService } from './concurrency';

export class Processor {
  constructor(
    private readonly config: BatchConfig,
    private readonly api: ApiService = new ApiService(config.api),
    private readonly logger: Logger = createLogger(config.logging),
    private readonly validator: ConfigValidator = new ConfigValidator(logger),
    private readonly concurrency: ConcurrencyService = new ConcurrencyService(config.concurrency),
  ) { }

  async run(): Promise<void> {
    this.validator.validate(this.config);

    const items = readFile(this.config.input);
    const maximumRpm = this.concurrency.getMaximumRpm();
    const maxChunkSize = this.concurrency.getMaxChunkSize();
    const minWaitTimeMs = this.concurrency.calculateMinWaitTime(maximumRpm, maxChunkSize);

    let currentChunkSize = this.concurrency.getStartingChunkSize();

    while (items.length > 0) {
      const chunk = items.splice(0, currentChunkSize);
      const startTime = new Date().getTime();

      const results = await Promise.all(chunk.map(
        (item: Item) => this.api.send(item, this.transformItem(item)),
      ));

      const errorCount = await this.runValidator(results);
      this.logResults(results, errorCount);

      const elapsed = new Date().getTime() - startTime;
      if (elapsed < minWaitTimeMs) {
        const waitTime = minWaitTimeMs - elapsed;
        await delay(waitTime);
      }

      if (currentChunkSize < maxChunkSize) {
        currentChunkSize = this.concurrency.calculateNewChunkSize(currentChunkSize, errorCount);
      }
    }

    // TODO log overall results
  }

  private transformItem(item: Item): MapLikeObject {
    const { itemTransformer } = this.config.input;
    return itemTransformer ? itemTransformer(item) : item;
  }

  private async runValidator(results: ItemResult[]): Promise<number> {
    // TODO implement result validator, overwrite success prop
    return 0;
  }

  private logResults(results: ItemResult[], errorCount: number) {
    // TODO log all errors
  }
}
