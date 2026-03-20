# 🌐 Cross‑Chain Intent Bridge Protocol  
## A Stellar ↔ Polygon SDK for Intent‑Driven Cross‑Chain Actions

This repository implements a **cross‑chain intent bridge protocol** as a **light SDK wrapper** that:
- Locks assets on **Stellar** (via `bridgeManager.mjs`).  
- Executes intent‑based actions on **Polygon (Amoy)**, such as:
  - Bridging (minting wrapped XLM).  
  - Providing liquidity in a pool.  
  - Staking wrapped XLM.  

You can think of it as a **Stellar SDK‑style extension** that:
- Doesn’t yet expose finalized helpers like `createIntent`, `getIntentStatus`, or `bridgeToEVM`,  
- But **will** evolve into a full, stable SDK once the API and patterns are solidified.

> ⚠️ This package is **not published to npm** yet.  
> It lives only in this GitHub repo and is **actively under development**.  
> The goal is to scale it into a proper `npm` package (e.g., `@gahlautabhinav/cross-chain-intent-sdk`) with a stable, feature‑rich API.

---

## 📂 Repository structure

At time of writing, the repo is structured like this:

```text
Cross-Chain-Intent-Bridge-Protocol/
├── packages/
│   └── intent-sdk/
│       ├── intent-sdk.js           # Main SDK entry point (this file)
│       └── package.json
├── src/
│   ├── bridgeManager.mjs           # Stellar-side bridge / lock logic
│   └── ...
├── contracts/                      # (Example) EVM / Polygon contracts
│   ├── WXLM.sol
│   ├── LiquidityPool.sol
│   └── Staking.sol
├── scripts/
│   ├── test-intent.js              # Example script to run executeCrossChainIntent
│   └── ...
├── frontend/
│   └── dapp/                       # Example UI (if present)
├── .env.example
├── .gitignore
├── tsconfig.json                   # If using TypeScript
├── package.json
└── README.md                       # This file
```

---

## 🧩 What this SDK does right now

The core module in this repo is:

> `packages/intent-sdk/intent-sdk.js`  
> exports: `executeCrossChainIntent(params)`

### 🎯 Intent flow

Given an intent definition, this SDK:

1. **Locks assets on Stellar**  
   - Calls `lockOnStellar(amount)` from `src/bridgeManager.mjs`.  
   - Returns a Stellar proof (tx hash, etc.).

2. **Executes intent logic on Polygon (Amoy)**  
   - Mints wrapped XLM (`WXLM`) on the Polygon chain.  
   - Depending on the intent `action`:
     - `"bridge"` → only mint + approve.  
     - `"liquidity"` → adds liquidity to a designated pool.  
     - `"stake"` → stakes `WXLM` in a staking contract.  
   - Uses `ethers` to interact with
     - `WXLM` contract (mint + approve).  
     - Pool or staking contract (depending on `action`).

3. **Returns a unified proof**  
   - A JSON‑like object containing:
     - `stellar` proof (tx, chain, etc.).  
     - `polygon` proof (mint, approve, action tx hashes).  
     - `status: "completed"`, timestamp, and intent metadata.

This is **intent‑driven** because:
- You pass an `intent` object with `action` instead of hard‑coding a specific path.  
- The same SDK entry point can route to different on‑chain actions on Polygon.

---

## 🚀 Quick start (local usage)

### 1. Clone and install

```bash
git clone https://github.com/gahlautabhinav/Cross-Chain-Intent-Bridge-Protocol.git
cd Cross-Chain-Intent-Bridge-Protocol

# Install dependencies
npm install
# or
yarn install
```

### 2. Install the SDK in your project

Since this is **not on npm**, install it locally or via GitHub:

#### Option A: Local path (mono‑repo‑style)

```bash
# From your app root
npm install ../Cross-Chain-Intent-Bridge-Protocol/packages/intent-sdk
```

#### Option B: Direct GitHub install

```bash
npm install git+https://github.com/gahlautabhinav/Cross-Chain-Intent-Bridge-Protocol.git
```

Then import it in your code:

```js
import { executeCrossChainIntent } from "intent-sdk";
```

> Note: you may need to adjust the import path if your `package.json`’s `name` differs from `intent-sdk`.

---

## 💻 Example usage: `executeCrossChainIntent`

This is the **current API** exposed by `intent-sdk.js`.

```js
import { executeCrossChainIntent } from "intent-sdk";

const params = {
  intent: {
    action: "liquidity", // or "stake", "bridge"
  },
  stellar: {
    // (currently minimal, may be expanded later)
  },
  polygon: {
    rpcUrl: "https://rpc-amoy.polygon.technology", // or env
    privateKey: "0x...",
    wxlmAddr: "0x...",          // WXLM contract
    liquidityAddr: "0x...",     // Pool
    stakingAddr: "0x...",       // Staking
  },
  amount: 100, // in XLM
};

const result = await executeCrossChainIntent(params);

console.log("✅ Cross‑chain intent completed:");
console.log(result);
```

### What happens internally:

- ✅ **Step 1 – Lock on Stellar**  
  Calls `lockOnStellar(amount)` and logs the Stellar tx.

- ✅ **Step 2 – Execute Polygon action**  
  - Detects `intent.action` and routes to:
    - `liquidity` → add liquidity.  
    - `stake` → stake.  
    - default → bridge‑only (mint + approve).  
  - Uses `ethers` to:
    - Mint `WXLM`.  
    - Approve the pool/staking contract.  
    - Execute the chosen action.

- ✅ **Step 3 – Unified proof**  
  Returns a structured object like:

  ```js
  {
    timestamp: "2026-03-20T...",
    intent: { action: "liquidity" },
    status: "completed",
    stellar: {
      txHash: "stellarTxHash123"
    },
    polygon: {
      mintTx: "0xabc...",
      approveTx: "0xdef...",
      actionTx: "0xghi..." // liquidity or stake tx
    }
  }
  ```

---

## 🧪 Testing and development

### Setting up environment

Copy `.env.example` and fill in:

```bash
cp .env.example .env
```

Example `.env`:

```env
AMOY_RPC_URL=https://rpc-amoy.polygon.technology
AMOY_PRIVATE_KEY=0x...
WXLM_ADDR=0x...
STAKING_ADDR=0x...
LIQUIDITY_ADDR=0x...
```

### Running a test script

You can create a simple test script, e.g.:

```js
// scripts/test-intent.js
import { executeCrossChainIntent } from "../packages/intent-sdk/intent-sdk.js";

const main = async () => {
  const result = await executeCrossChainIntent({
    intent: { action: "liquidity" },
    stellar: {},
    polygon: {
      rpcUrl: process.env.AMOY_RPC_URL,
      privateKey: process.env.AMOY_PRIVATE_KEY,
      wxlmAddr: process.env.WXLM_ADDR,
      liquidityAddr: process.env.LIQUIDITY_ADDR,
    },
    amount: 10,
  });
  console.log(result);
};

main();
```

Then run:

```bash
node scripts/test-intent.js
```

---

## 🧱 Roadmap & planned features

This is an **early, evolving SDK**. Over time, it will be expanded into a **proper SDK** with:

- More granular, stable functions such as:
  - `createIntent(...)`  
  - `getIntentStatus(...)`  
  - `bridgeToEVM(...)` / `bridgeTo[Chain](...)`  
- Support for:
  - More chains (Ethereum mainnet, Solana, etc.).  
  - More intent types (e.g., swaps, cross‑chain lending, complex multi‑step strategies).  
- Production‑grade error handling, logging, and instrumentation.
- A proper `npm` package with Typescript types and JSDoc‑style docs.

If you contribute or want to suggest features, see the **Contributing** section below.

---

## 🤝 Contributing

You’re welcome to help turn this into a **fully‑fledged, production‑ready intent SDK**. Contributions we’re especially excited about:

- Refactoring and splitting the current monolithic `executeCrossChainIntent` into:
  - Stellar‑side helpers.  
  - Polygon‑side helpers.  
  - Composable intent modules.  
- Adding TypeScript types and JSDoc / TypeDoc comments.  
- Writing tests and improving error handling.  
- Expanding chain support and intent patterns.

To contribute:

1. Fork the repo.  
2. Create a feature branch.  
3. Open a PR with a clear description and (where possible) tests.

---

## 📜 License

MIT  
See `LICENSE` in the root of the repo.
```
