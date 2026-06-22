# intent-sdk

Core SDK for the Cross-Chain Intent Bridge Protocol. Single function, multi-chain execution.

## Install

```bash
# Local
npm install ../Cross-Chain-Intent-Bridge-Protocol/packages/intent-sdk

# GitHub
npm install git+https://github.com/gahlautabhinav/Cross-Chain-Intent-Bridge-Protocol.git
```

## Usage

```js
import { executeCrossChainIntent } from "intent-sdk";

const result = await executeCrossChainIntent({
  intent: { action: "stake" },        // "bridge" | "liquidity" | "stake"
  stellar: {
    secret: process.env.STELLAR_SECRET,
  },
  polygon: {
    rpcUrl: process.env.AMOY_RPC_URL,
    privateKey: process.env.AMOY_PRIVATE_KEY,
    wxlmAddr: process.env.WXLM_ADDR,
    liquidityAddr: process.env.LIQUIDITY_ADDR,   // for "liquidity"
    stakingAddr: process.env.STAKING_ADDR,        // for "stake"
  },
  amount: 100,   // XLM amount to lock on Stellar
});
```

## API

### `executeCrossChainIntent(params)`

**Parameters**

| Field | Type | Description |
|---|---|---|
| `intent.action` | `"bridge" \| "liquidity" \| "stake"` | Desired outcome |
| `stellar.secret` | `string` | Stellar account secret key |
| `polygon.rpcUrl` | `string` | Polygon Amoy RPC URL |
| `polygon.privateKey` | `string` | EVM wallet private key |
| `polygon.wxlmAddr` | `string` | Deployed WXLM contract address |
| `polygon.liquidityAddr` | `string` | LiquidityPool contract (required for `"liquidity"`) |
| `polygon.stakingAddr` | `string` | Staking contract (required for `"stake"`) |
| `amount` | `number` | XLM amount to lock |

**Returns**

```ts
{
  status: "completed" | "failed",
  intent: { compiled: boolean, action: string },
  stellar: { txHash: string, proof: string },
  polygon: {
    mintTx: string,
    approveTx: string,
    actionTx: string,
  },
  report: { timestamp: string, summary: string }
}
```

## Intent Routing

| `intent.action` | What happens on Polygon |
|---|---|
| `"bridge"` | Mint WXLM only |
| `"liquidity"` | Mint WXLM → Approve → Add to LiquidityPool |
| `"stake"` | Mint WXLM → Approve → Stake in Staking contract |

## Internal Flow

```
executeCrossChainIntent()
  ├── lockOnStellar()        ← src/bridgeManager.mjs
  │     └── retry()          ← exponential backoff
  └── mintAndExecuteOnPolygon()  ← src/executor.js
```

## Extended SDK

`src/sdk-extend.js` exports an extended variant of `executeCrossChainIntent()` with additional hooks. See source for current extensions.

## Environment Variables

```env
STELLAR_SECRET=
AMOY_RPC_URL=
AMOY_PRIVATE_KEY=
WXLM_ADDR=
LIQUIDITY_ADDR=
STAKING_ADDR=
```
