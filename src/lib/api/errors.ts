export type ApiErrorCode =
  "network" | "not_found" | "validation" | "server" | "invalid_response" | "unknown";

export type FieldErrors = Record<string, string>;

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number | null;
  readonly fieldErrors: FieldErrors | undefined;

  constructor(
    code: ApiErrorCode,
    message: string,
    options: { status?: number; fieldErrors?: FieldErrors } = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = options.status ?? null;
    this.fieldErrors = options.fieldErrors;
  }

  /** Worth retrying automatically: the request may succeed without changes. */
  get isTransient(): boolean {
    return this.code === "network" || this.code === "server";
  }
}

const DEFAULT_MESSAGES: Record<ApiErrorCode, string> = {
  network: "Can't reach the server. Check your connection and try again.",
  not_found: "We couldn't find what you were looking for.",
  validation: "Some fields need your attention.",
  server: "Something went wrong on our side. Please try again.",
  invalid_response: "The server sent a response we couldn't understand.",
  unknown: "Something went wrong. Please try again.",
};

export function defaultMessage(code: ApiErrorCode): string {
  return DEFAULT_MESSAGES[code];
}

export function codeFromStatus(status: number): ApiErrorCode {
  if (status === 404) return "not_found";
  if (status === 400 || status === 422) return "validation";
  if (status >= 500) return "server";
  return "unknown";
}

/** Normalises anything thrown into an ApiError so UI code handles one shape. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (error instanceof TypeError) return new ApiError("network", DEFAULT_MESSAGES.network);
  return new ApiError("unknown", DEFAULT_MESSAGES.unknown);
}

export function getErrorMessage(error: unknown): string {
  return toApiError(error).message;
}

/** React Query retry policy: only retry failures that might resolve on their own. */
export function shouldRetry(failureCount: number, error: unknown): boolean {
  return toApiError(error).isTransient && failureCount < 2;
}
