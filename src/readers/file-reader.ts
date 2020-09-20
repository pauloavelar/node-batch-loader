import { Readable } from 'stream';
import { extname } from 'path';
import { Logger } from 'simple-node-logger';

import { FileFormatError } from '../errors/file-format-error';
import { convertFileToStream, isString } from '../helpers';

import { File, InputConfig, Item } from '../types';
import { readStreamAsCsv } from './csv-reader';

enum FileFormat { CSV, JSON, TSV, XML }
type FileExtensions = { [key: string]: FileFormat };

const extensions: FileExtensions = {
  '.csv': FileFormat.CSV,
  '.json': FileFormat.JSON,
  '.jsonp': FileFormat.JSON,
  '.tsv': FileFormat.TSV,
  '.xml': FileFormat.XML,
};

export class FileReader {
  constructor(
    private readonly logger: Logger,
    private readonly config: InputConfig,
    private readonly dataStream: Readable = convertFileToStream(config.file),
  ) { }

  readFile(): Promise<Item[]> {
    const format = this.identifyFormat(this.config.file);

    switch (format) {
      case FileFormat.CSV:
        return this.readCsv();
      case FileFormat.JSON:
        return this.readJson();
      case FileFormat.TSV:
        return this.readTsv();
      case FileFormat.XML:
        return this.readXml();
      default:
        throw new FileFormatError('Unknown file format');
    }
  }

  private async readCsv(): Promise<Item[]> {
    return readStreamAsCsv(this.dataStream, this.config.hasHeaders);
  }

  private async readTsv(): Promise<Item[]> {
    return readStreamAsCsv(this.dataStream, this.config.hasHeaders, '\t');
  }

  private identifyFormat(file: File): FileFormat {
    return isString(file) ? this.identifyByExtension(file) : this.identifyByContent(this.dataStream);
  }

  private identifyByExtension(file: string): FileFormat {
    return extensions[extname(file).toLowerCase()];
  }

  private identifyByContent(data: Readable): FileFormat {
    // TODO safely read stream
    throw new FileFormatError('Unsupported input file format');
  }
}
