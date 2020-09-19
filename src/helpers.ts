export async function delay(ms: number): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(() => resolve(), ms));
}

export function isNumber(value: any): value is number {
  return typeof value === 'number';
}

export function isString(value: any): value is string {
  return typeof value === 'string';
}

export function isObject<T>(value: any | T): value is T {
  return typeof value === 'object';
}
