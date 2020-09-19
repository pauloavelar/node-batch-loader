import * as path from 'path';

import { OutputLevel, runImport } from '../src';

runImport({
  api: {
    url: 'https://api.pauloavelar.com/items',
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-custom-token': '',
    },
    jitter: 100,
  },
  concurrency: {
    maximumRpm: 10000,
    retriesPerItem: 2,
    chunkSize: {
      initial: 10,
      maximum: 500,
      growth: (chunkSize, errorRate) => (errorRate < 0.05 ? chunkSize * 1.2 : chunkSize),
    },
  },
  input: {
    file: path.join(__dirname, 'items.csv'),
    itemTransformer: (item) => ({
      name: item[0],
      category: item[1],
      price: item[2],
    }),
  },
  output: {
    file: path.join(__dirname, 'results.csv'),
    level: OutputLevel.ERRORS,
    idTransformer: (body) => body.id,
  },
  validator: {
    urlBuilder: (_, id) => `https://api.pauloavelar.com/items/${id}`,
    httpMethod: 'GET',
    comparator: async (item, response) => {
      if (response.status !== 200) {
        return false;
      }

      const body = await response.json();
      return body.name === item.name && body.price === item.price;
    },
  },
  logging: {
    level: 'debug',
    toStdout: true,
    toFile: true,
  },
});
