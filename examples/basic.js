import * as path from 'path';

import { runImport } from '../src';

runImport({
  api: {
    url: 'https://api.pauloavelar.com/items',
  },
  concurrency: {
    chunkSize: 200,
    maximumRpm: 10000,
  },
  input: {
    file: path.join(__dirname, 'items.csv'),
    itemTransformer: ([name, category, price]) => ({ name, category, price }),
  },
  output: {
    file: path.join(__dirname, 'results.csv'),
  },
});
