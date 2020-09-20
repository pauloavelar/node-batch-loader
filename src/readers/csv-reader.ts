import { Readable } from 'stream';
import csv from 'csv-parser';

import { IoError } from '../errors/io-error';
import { Item } from '../types';

export function readStreamAsCsv(stream: Readable, hasHeaders = true, separator = ','): Promise<Item[]> {
  return new Promise((resolve, reject) => {
    const results: Item[] = [];
    stream.pipe(csv({ separator, headers: hasHeaders }))
      .on('line', (line) => results.push(line))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(new IoError('Error reading file as CSV', err)));
  });
}
