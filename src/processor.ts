import { Logger } from 'simple-node-logger';

import { createLogger, delay } from './helpers';
import { ApiService } from './api-service';
import { ConfigValidator } from './config-validator';
import { ConcurrencyService } from './concurrency';
import { FileReader } from './readers/file-reader';

import { BatchConfig, Item, ItemResult, MapLikeObject } from './types';

export class Processor {
  constructor(
    private readonly config: BatchConfig,
    private readonly api: ApiService = new ApiService(config.api),
    private readonly logger: Logger = createLogger(config.logging),
    private readonly validator: ConfigValidator = new ConfigValidator(logger),
    private readonly fileReader: FileReader = new FileReader(logger, config.input),
    private readonly concurrency: ConcurrencyService = new ConcurrencyService(config.concurrency),
  ) { }

  async run(): Promise<void> {
    this.validator.validate(this.config);

    this.logger.info('Reading file...', this.config.input);
    const items = this.fileReader.readFile();
    this.logger.info(`File read, found ${items.length} items`);

    const maximumRpm = this.concurrency.getMaximumRpm();
    const maxChunkSize = this.concurrency.getMaxChunkSize();
    const minWaitTimeMs = this.concurrency.calculateMinWaitTime(maximumRpm, maxChunkSize);

    let currentChunkSize = this.concurrency.getStartingChunkSize();

    this.logger.info('Concurrency settings:', { currentChunkSize, maxChunkSize, maximumRpm, minWaitTimeMs });

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
