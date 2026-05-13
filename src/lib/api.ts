const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(
  /\/$/,
  "",
);
const DEFAULT_API_BASE_URL = (
  import.meta.env.VITE_DEFAULT_API_BASE_URL ??
  "https://legal-debt-solution-backend.onrender.com"
).replace(/\/$/, "");

const unique = (values: string[]) => Array.from(new Set(values));

const getCurrentOrigin = () => {
  if (typeof window === "undefined") return "";
  return window.location.origin.replace(/\/$/, "");
};

const buildApiEndpoints = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const currentOrigin = getCurrentOrigin();
  const endpoints: string[] = [];

  if (API_BASE_URL) {
    endpoints.push(`${API_BASE_URL}${normalizedPath}`);
  }

  endpoints.push(normalizedPath);

  if (
    DEFAULT_API_BASE_URL &&
    DEFAULT_API_BASE_URL !== currentOrigin &&
    DEFAULT_API_BASE_URL !== API_BASE_URL
  ) {
    endpoints.push(`${DEFAULT_API_BASE_URL}${normalizedPath}`);
  }

  return unique(endpoints);
};

export const postJsonToApi = async <ResponseBody extends { success?: boolean }>(
  path: string,
  payload: unknown,
) => {
  const endpoints = buildApiEndpoints(path);
  const failures: string[] = [];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const rawBody = await response.text();
      let data: ResponseBody | undefined;

      try {
        data = rawBody ? (JSON.parse(rawBody) as ResponseBody) : undefined;
      } catch (parseError) {
        failures.push(
          `${endpoint}: invalid JSON response (${response.status})`,
        );
        console.error("API response parse error", {
          endpoint,
          status: response.status,
          rawBody,
          parseError,
        });
        continue;
      }

      if (response.ok && data?.success) {
        return data;
      }

      failures.push(`${endpoint}: ${response.status} ${rawBody.slice(0, 200)}`);
    } catch (error) {
      failures.push(
        `${endpoint}: ${error instanceof Error ? error.message : "request failed"}`,
      );
      console.error("API request error", { endpoint, error });
    }
  }

  throw new Error(`API request failed. Attempts: ${failures.join("; ")}`);
};
