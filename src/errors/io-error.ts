export class IoError extends Error {
  constructor(message: string, cause: Error) {
    super(`${message}: ${cause.message}`);
    this.stack = cause.stack;
  }
}
