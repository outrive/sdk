import type {
  OutriveClientConfig,
  SystemStatus,
  TokenLaunch,
  MarketToken,
  CreditBalance,
  ChatStreamEvent,
  ChatStreamParams,
  PaginatedResponse,
} from './types';

const DEFAULT_BASE_URL = 'https://outrive.io/api';
const DEFAULT_TIMEOUT = 30_000;

export class OutriveClient {
  private baseUrl: string;
  private timeout: number;

  constructor(config: OutriveClientConfig = {}) {
    this.baseUrl = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, '');
    this.timeout = config.timeout ?? DEFAULT_TIMEOUT;
  }

  private async fetch<T>(path: string, init?: RequestInit): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);
    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        ...init,
        signal: controller.signal,
      });
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`OUTRIVE API ${res.status}: ${body}`);
      }
      return res.json() as Promise<T>;
    } finally {
      clearTimeout(timer);
    }
  }

  readonly system = {
    getStatus: (): Promise<SystemStatus> =>
      this.fetch('/system/status'),

    healthCheck: (): Promise<{ status: string }> =>
      this.fetch('/healthz'),
  };

  readonly market = {
    getTokens: (): Promise<MarketToken[]> =>
      this.fetch('/virtuals/tokens'),

    getVirtualPrice: (): Promise<{ price: number; currency: string }> =>
      this.fetch('/virtuals/virtual-price'),
  };

  readonly launches = {
    list: (params: { page?: number; limit?: number } = {}): Promise<PaginatedResponse<TokenLaunch>> => {
      const qs = new URLSearchParams();
      if (params.page !== undefined) qs.set('page', String(params.page));
      if (params.limit !== undefined) qs.set('limit', String(params.limit));
      const q = qs.toString();
      return this.fetch(`/launches${q ? `?${q}` : ''}`);
    },

    getByWallet: (address: string): Promise<TokenLaunch[]> =>
      this.fetch(`/launches/${address}`),
  };

  readonly credits = {
    getBalance: (walletAddress: string): Promise<CreditBalance> =>
      this.fetch(`/credits/${walletAddress}`),
  };

  readonly chat = {
    /**
     * Stream a chat message and yield parsed SSE events.
     * Requires a wallet address - free chat is not supported.
     */
    stream: async function* (
      this: OutriveClient,
      params: ChatStreamParams,
    ): AsyncGenerator<ChatStreamEvent> {
      const controller = new AbortController();
      const res = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const body = await res.text().catch(() => '');
        yield { type: 'error', message: body, code: String(res.status) };
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const raw = line.slice(5).trim();
          if (raw === '[DONE]') { yield { type: 'done' }; return; }
          try {
            yield JSON.parse(raw) as ChatStreamEvent;
          } catch {
            // skip malformed line
          }
        }
      }
      yield { type: 'done' };
    }.bind(this),
  };
}
