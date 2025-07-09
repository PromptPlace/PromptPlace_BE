export class AppError extends Error {
  public statusCode: number;
  public error: string;

  constructor(message: string, statusCode = 500, error = "InternalServerError") {
    super(message);
    this.statusCode = statusCode;
    this.error = error;
    Error.captureStackTrace(this, this.constructor);
  }
}