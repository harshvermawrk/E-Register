const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

export class ApiClientError extends Error {
  readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.cause = cause;
  }
}

export async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  if (!apiBaseUrl) {
    throw new ApiClientError("VITE_API_BASE_URL is not configured.");
  }

  const baseUrl = apiBaseUrl.endsWith("/") ? apiBaseUrl : `${apiBaseUrl}/`;
  const base = new URL(baseUrl);
  const requestUrl = new URL(path.replace(/^\/+/, ""), baseUrl);
  if (requestUrl.origin !== base.origin) {
    throw new ApiClientError("Backend request paths must stay on the configured API origin.");
  }

  let response: Response;

  try {
    response = await fetch(requestUrl, init);
  } catch (error) {
    throw new ApiClientError(`Unable to connect to the backend at ${requestUrl.origin}.`, error);
  }

  if (!response.ok) {
    throw new ApiClientError(`The backend request failed with status ${response.status}.`);
  }

  try {
    return (await response.json()) as T;
  } catch (error) {
    throw new ApiClientError("The backend returned an invalid JSON response.", error);
  }
}
