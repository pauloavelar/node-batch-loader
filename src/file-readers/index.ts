import { extname } from 'path';
import { ReadStream } from 'fs';

import { FileFormatError } from '../errors/file-format';
import { InputConfig, Item } from '../types';
import { readCsv } from './csv';

enum FileFormat {
  CSV = 'CSV',
  JSON = 'JSON',
  TSV = 'TSV',
  XML = 'XML',
}

export type File = string | Buffer | ReadStream;

export type FileReader = (file: string | Buffer, listLocation?: string) => Item[];

export type FileReaders = { [key: string]: FileReader };
export type FileExtensions = { [key: string]: FileFormat };

const extensions: FileExtensions = {
  '.csv': FileFormat.CSV,
  '.json': FileFormat.JSON,
  '.jsonp': FileFormat.JSON,
  '.tsv': FileFormat.TSV,
  '.xml': FileFormat.XML,
};

const fileReaders: FileReaders = {
  [FileFormat.CSV]: readCsv,
  [FileFormat.JSON]: readJson,
  [FileFormat.XML]: readXml,
};

function identifyByExtension(file: string): FileFormat {
  const extension = extname(file).toLowerCase();
  return extensions[extension];
}

function identifyByContent(file: Buffer): FileFormat {
  if (!Buffer.isBuffer(file)) {
    throw new FileFormatError('The provided file is not a buffer');
  }

  (file as ReadStream).
}

function identifyFormat(file: string | Buffer): FileFormat {
  if (typeof file === 'string') {
    return identifyByExtension(file);
  }

  return identifyByContent(file);
}

export function readFile(file: InputConfig): Item[] {
  const fileReader = fileReaders[identifyFormat(file)];
  if (!fileReader) {
    throw new FileFormatError('The input file is not supported');
  }

  return [];
}
