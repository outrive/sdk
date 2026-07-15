export interface OutriveClientConfig {
  /** Base URL for the OUTRIVE API. Defaults to https://outrive.io/api */
  baseUrl?: string;
  /** Request timeout in milliseconds. Defaults to 30000 */
  timeout?: number;
}

export interface SystemStatus {
  status: 'ok' | 'degraded' | 'error';
  chainId: number;
  factoryAddress: string | null;
  virtualTokenAddress: string | null;
  rpcHealthy: boolean;
  graduationThreshold: string;
  network: 'mainnet' | 'testnet';
}

export interface TokenLaunch {
  id: number;
  walletAddress: string;
  name: string;
  ticker: string;
  contractAddress: string | null;
  txHash: string | null;
  createdAt: string;
}

export interface MarketToken {
  id: string;
  name: string;
  symbol: string;
  price: number;
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
  status: 'bonding' | 'graduated';
  creatorAddress: string;
  contractAddress: string;
  image?: string;
}

export interface CreditBalance {
  walletAddress: string;
  credits: number;
  tier: string;
}

export interface ChatStreamParams {
  walletAddress: string;
  message: string;
  conversationId?: string;
}

export type ChatStreamEvent =
  | { type: 'text_delta'; delta: string }
  | { type: 'tool_call'; name: string; status: string }
  | { type: 'work_order'; tx: UnsignedTx; preview: LaunchPreview }
  | { type: 'error'; message: string; code: string }
  | { type: 'done' };

export interface UnsignedTx {
  to: string;
  data: string;
  value: string;
  chainId: number;
  gasLimit?: string;
}

export interface LaunchPreview {
  name: string;
  ticker: string;
  metadataUri: string;
  buyAmountVirtual: string;
  estimatedTokens: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
