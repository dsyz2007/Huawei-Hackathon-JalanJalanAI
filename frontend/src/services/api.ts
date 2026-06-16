import axios, { type AxiosInstance, type AxiosError } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 800;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function createClient(): AxiosInstance {
  const client = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
  });

  client.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
      const config = error.config as typeof error.config & { _retryCount?: number };
      if (!config) return Promise.reject(error);

      config._retryCount = config._retryCount ?? 0;
      const isRetryable =
        !error.response || error.response.status >= 500 || error.code === 'ECONNABORTED';

      if (isRetryable && config._retryCount < MAX_RETRIES) {
        config._retryCount += 1;
        await sleep(RETRY_DELAY_MS * config._retryCount);
        return client(config);
      }

      return Promise.reject(error);
    }
  );

  return client;
}

export const api = createClient();
