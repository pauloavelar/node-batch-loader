import { Processor } from './processor';
import { BatchConfig } from './types';

export async function runImport(config: BatchConfig): Promise<void> {
  return new Processor(config).run();
}
