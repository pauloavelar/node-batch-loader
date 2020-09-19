import { Response } from 'node-fetch';

export type HeadlessCsvItem = { [key: number]: any };
export type MapLikeObject = { [key: string]: any };

export type Item = MapLikeObject | HeadlessCsvItem;
export type ItemTransformer = (item: Item) => MapLikeObject;

export type ApiHeaders = { [key:string]: string };
export type ApiResponse = Response;

export type ValidatorFunction = (item: Item) => boolean;
export interface ValidatorOptions {
  urlBuilder: (item: Item) => string;
  httpMethod: string;
  comparator: (item: Item, response: ApiResponse) => boolean | Promise<boolean>;
}
export type ResultValidator = ValidatorFunction | ValidatorOptions;
export interface ItemResult {
  success: boolean;
  statusCode: number;
  item: Item;
}

export type ChunkGrowthFunction = (currentChunkSize: number, previousChunkErrorRate: number) => number;

export type UrlBuilder = (item: Item) => string;

export enum LogLevel {
  VERBOSE = 'VERBOSE',
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export enum OutputLevel {
  ERRORS = 'ERRORS',
  ALL = 'ALL',
}

export interface ApiConfig {
  url: string | UrlBuilder;
  method?: string;
  headers?: ApiHeaders;
  jitter?: number;
}

export interface InputConfig {
  file: string | Buffer;
  listLocation?: string;
  itemTransformer?: ItemTransformer;
}

export interface OutputConfig {
  file: string | Buffer;
  level?: OutputLevel;
  idTransformer?: (responseBody: any) => any;
}

export interface ChunkSizeConfig {
  initial: number;
  maximum: number;
  growth: number | ChunkGrowthFunction;
}

export interface ConcurrencyConfig {
  retriesPerItem?: number;
  maximumRpm?: number;
  chunkSize?: number | ChunkSizeConfig;
}

export interface LogConfig {
  level: 'error' | 'warn' | 'info' | 'debug' | 'trace';
  toStdout?: boolean;
  toFile?: boolean | string;
}

export interface BatchConfig {
  api: ApiConfig;
  input: InputConfig;
  output?: OutputConfig;
  validator?: ResultValidator;
  concurrency: ConcurrencyConfig;
  logging?: LogConfig;
}
