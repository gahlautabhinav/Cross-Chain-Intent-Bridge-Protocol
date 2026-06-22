# Cross-Chain Intent Bridge Protocol

**A Stellar ↔ Polygon SDK for intent-driven cross-chain execution.**

> Write intent. Let the protocol handle execution.

---

## What is this?

Cross-Chain Intent Bridge Protocol is a developer-first SDK that abstracts cross-chain complexity. Instead of manually orchestrating bridging, wrapping, approvals, liquidity provision, and staking — you declare **what you want to achieve** and the SDK executes it across chains.

```js
executeCrossChainIntent({ intent: { action: "stake" }, amount: 100, ... })
```

---

## Architecture

```
User Intent
    ↓
compileIntent()          ← src/intentCompiler.js
    ↓
executeCrossChainIntent()  ← packages/intent-sdk/intent-sdk.js
    ├── lockOnStellar()    ← src/bridgeManager.mjs  (with retry())
    │       ↓
    │   [Stellar XLM locked — proof generated]
    │       ↓
    └── mintAndExecuteOnPolygon()  ← src/executor.js
            ↓
        Mint WXLM → Approve → Route by intent
            ↓
report()               ← src/report.js
    ↓
Unified cross-chain proof
```

---

## Chains & Stack

| Layer | Technology |
|---|---|
| Asset origin / lock | Stellar (XLM) |
| On-chain intent recording | Soroban (Rust) |
| Execution layer | Polygon Amoy (EVM) |
| EVM interaction | ethers.js |
| Bridge SDK | `packages/intent-sdk` |

### Smart Contracts

**Soroban (Stellar)** — `soroban-intent/contracts/intent_liquidity_demo/src/lib.rs`
- `IntentLiquidityDemo` — main contract struct
- `.record_intent()` — records user intent on-chain
- `.record_liquidity()` — records liquidity events

**EVM (Polygon Amoy)** — `contracts/`
- `WXLM.sol` — Wrapped XLM token
- `LiquidityPool.sol` — LP interactions
- `Staking.sol` — Yield / staking layer

---

## Intent Routing

| `intent.action` | Polygon Execution |
|---|---|
| `"bridge"` | Mint WXLM only |
| `"liquidity"` | Mint → Approve → Add liquidity |
| `"stake"` | Mint → Approve → Stake WXLM |

---

## Quick Start

### 1. Clone & install

```bash
git clone https://github.com/gahlautabhinav/Cross-Chain-Intent-Bridge-Protocol.git
cd Cross-Chain-Intent-Bridge-Protocol
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# fill in AMOY_RPC_URL, AMOY_PRIVATE_KEY, STELLAR_SECRET, contract addresses
```

### 3. Deploy contracts (Polygon Amoy)

```bash
node scripts/deploy.js
```

### 4. Run

```js
import { executeCrossChainIntent } from "intent-sdk";

const result = await executeCrossChainIntent({
  intent: { action: "liquidity" },
  stellar: {
    secret: process.env.STELLAR_SECRET,
  },
  polygon: {
    rpcUrl: process.env.AMOY_RPC_URL,
    privateKey: process.env.AMOY_PRIVATE_KEY,
    wxlmAddr: process.env.WXLM_ADDR,
    liquidityAddr: process.env.LIQUIDITY_ADDR,
  },
  amount: 100,
});

console.log(result);
```

### SDK install options

```bash
# Local path
npm install ../Cross-Chain-Intent-Bridge-Protocol/packages/intent-sdk

# GitHub
npm install git+https://github.com/gahlautabhinav/Cross-Chain-Intent-Bridge-Protocol.git
```

---

## Return Value

```json
{
  "status": "completed",
  "intent": { "compiled": true, "action": "liquidity" },
  "stellar": { "txHash": "...", "proof": "..." },
  "polygon": {
    "mintTx": "...",
    "approveTx": "...",
    "actionTx": "..."
  },
  "report": { "timestamp": "...", "summary": "..." }
}
```

---

## Repository Structure

```
packages/
  intent-sdk/
    intent-sdk.js          ← executeCrossChainIntent() — main SDK entry
    README.md              ← SDK API reference

src/
  bridgeManager.mjs        ← lockOnStellar(), executeCrossChainIntent(), retry()
  intentCompiler.js        ← compileIntent()
  executor.js              ← mintAndExecuteOnPolygon()
  report.js                ← report()
  sdk-extend.js            ← extended executeCrossChainIntent() variant
  index.js                 ← main entry point
  index_copy.js            ← alternate entry (compileIntent + report variant)

soroban-intent/
  contracts/
    intent_liquidity_demo/
      src/
        lib.rs             ← IntentLiquidityDemo contract
        test.rs            ← Soroban test suite

contracts/
  WXLM.sol
  LiquidityPool.sol
  Staking.sol

scripts/
  deploy.js                ← contract deployment

demo_use_package.js        ← SDK usage demo
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed component relationships.

---

## Testing

```bash
# Soroban contracts
cd soroban-intent
cargo test

# Integration (Polygon Amoy)
node demo_use_package.js
```

---

## Status

> **Actively evolving — not production ready**

- Not published to npm
- API surface is unstable
- Soroban contract → EVM proof verification is in progress

---

## Roadmap

**SDK**
- `createIntent()` / `getIntentStatus()` / `bridgeToChain()`
- TypeScript types
- Error handling + retry surface exposed to callers

**Multi-chain**
- Ethereum mainnet / Arbitrum / Optimism
- Solana

**Advanced intents**
- Cross-chain swaps
- Lending / borrowing
- Multi-step DeFi strategies

**DevEx**
- Full API documentation
- Event indexing
- Observability hooks

---

## Contributing

High-impact areas:
- New intent types (extend `executor.js` routing)
- Multi-chain adapters
- Soroban proof verification on EVM side
- Better logging in `report.js`

Steps: Fork → branch → PR.

---

## License

MIT

---

This isn't just a bridge.

It's an **execution layer for intent-based Web3.**
