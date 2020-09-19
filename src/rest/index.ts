import fetch from 'node-fetch';
import { isString } from '../helpers';

import { ApiConfig, Item, ItemResult, MapLikeObject } from '../types';

export class ApiService {
  constructor(
    private readonly config: ApiConfig,
    private readonly restClient = fetch,
  ) { }

  async send(item: Item, payload: MapLikeObject): Promise<ItemResult> {
    const { url, method = 'POST', headers } = this.config;

    const actualUrl = isString(url) ? url : url(item);
    const options = { method, headers, body: JSON.stringify(payload) };

    const response = await this.restClient(actualUrl, options);

    // TODO add id transformer if present

    return { item, status: response.status };
  }
}
