# @outrive/sdk

**TypeScript SDK for the OUTRIVE API**

Programmatic access to the OUTRIVE launchpad - query market data, read system status, fetch token launches, and manage chat sessions against the OUTRIVE API server.

> **SDK coming soon** — Package will be published to npm once the OUTRIVE API reaches stable v1.0. Star this repo to be notified.

---

## Quick Start

```typescript
import { OutriveClient } from '@outrive/sdk';

const client = new OutriveClient({
  baseUrl: 'https://outrive.io/api',
});

// Get system status
const status = await client.system.getStatus();
console.log(status.factoryAddress, status.chainId);

// List launched tokens
const launches = await client.launches.list({ limit: 20 });
for (const token of launches.items) {
  console.log(token.name, token.ticker, token.contractAddress);
}

// Get live market data
const market = await client.market.getTokens();
```

---

## API Reference

### `OutriveClient`

```typescript
new OutriveClient(config: {
  baseUrl?: string;   // Default: https://outrive.io/api
  timeout?: number;   // Request timeout in ms. Default: 30000
})
```

### `client.system`

| Method | Description |
|---|---|
| `getStatus()` | System calibration, factory address, RPC health |
| `healthCheck()` | Simple liveness probe |

### `client.market`

| Method | Description |
|---|---|
| `getTokens()` | All indexed agent tokens with price and volume |
| `getVirtualPrice()` | Current $VIRTUAL token price |

### `client.launches`

| Method | Description |
|---|---|
| `list(params?)` | Paginated list of token launches |
| `getByWallet(address)` | All launches for a specific wallet |

### `client.credits`

| Method | Description |
|---|---|
| `getBalance(walletAddress)` | Credit balance for a wallet |

### `client.chat`

```typescript
// Stream a chat message (returns an async iterator of SSE events)
for await (const event of client.chat.stream({
  walletAddress: '0x...',
  message: 'Launch an agent called NEXUS with ticker $NXS',
  conversationId: 'optional-session-id',
})) {
  if (event.type === 'text_delta') process.stdout.write(event.delta);
  if (event.type === 'work_order') console.log('TX ready:', event.tx);
  if (event.type === 'done') break;
}
```

---

## Environment

All requests go to `https://outrive.io/api` by default. For local development against a self-hosted API server:

```typescript
const client = new OutriveClient({ baseUrl: 'http://localhost:8080/api' });
```

---

## Chain Reference

| Network | Chain ID | RPC | Explorer |
|---|---|---|---|
| Robinhood Mainnet | 4663 | https://rpc.mainnet.chain.robinhood.com | https://robinhoodchain.blockscout.com |
| Robinhood Testnet | 46630 | https://rpc.testnet.chain.robinhood.com | https://explorer.testnet.chain.robinhood.com |

---

## Links

- OUTRIVE: [outrive.io](https://outrive.io)
- Virtuals Protocol: [app.virtuals.io](https://app.virtuals.io)
- Robinhood Chain Explorer: [robinhoodchain.blockscout.com](https://robinhoodchain.blockscout.com)
- X (Twitter): [@outrive_](https://x.com/outrive_)

---

## License

MIT
