# 🌐 Cross-Chain Intent Bridge Protocol

### ⚡ A Stellar ↔ Polygon SDK for Intent-Driven Cross-Chain Execution

> **Write intent. Let the protocol handle execution.**

---

## 🧠 What is this?

**Cross-Chain Intent Bridge Protocol** is a **developer-first SDK** that abstracts away the complexity of cross-chain interactions.

Instead of manually orchestrating:

* bridging
* wrapping
* approvals
* liquidity provision
* staking

👉 You define **what you want to achieve** — and the SDK executes it across chains.

---

## 💡 Why this matters

Cross-chain UX today is:

* fragmented
* manual
* error-prone

This SDK introduces an **intent-driven paradigm**:

```js
intent: { action: "stake" }
```

Instead of writing multi-step logic, you just declare the outcome.

---

## ⚙️ Current Architecture

```
User Intent
    ↓
SDK (intent-sdk.js)
    ↓
Stellar Lock (bridgeManager.mjs)
    ↓
Polygon Execution (ethers.js)
    ↓
Unified Proof
```

---

## 🔗 Chains & Stack

* ⭐ **Stellar** → Asset origin (lock layer)
* 🟣 **Polygon Amoy** → Execution layer
* 🔐 Smart Contracts:

  * `WXLM.sol` → Wrapped XLM
  * `LiquidityPool.sol` → LP interactions
  * `Staking.sol` → Yield layer

---

## 🚀 What the SDK does (Today)

### Single entry point:

```js
executeCrossChainIntent(params)
```

### Behind the scenes:

### 1️⃣ Lock on Stellar

* Locks XLM via `bridgeManager.mjs`
* Produces verifiable proof

### 2️⃣ Execute on Polygon

* Mint `WXLM`
* Approve contracts
* Route based on intent:

| Intent        | Action        |
| ------------- | ------------- |
| `"bridge"`    | Mint only     |
| `"liquidity"` | Add liquidity |
| `"stake"`     | Stake WXLM    |

### 3️⃣ Return unified proof

```json
{
  "status": "completed",
  "stellar": { "txHash": "..." },
  "polygon": {
    "mintTx": "...",
    "approveTx": "...",
    "actionTx": "..."
  }
}
```

---

## 🧪 Quick Start

### 1. Clone

```bash
git clone https://github.com/gahlautabhinav/Cross-Chain-Intent-Bridge-Protocol.git
cd Cross-Chain-Intent-Bridge-Protocol
npm install
```

---

### 2. Install SDK

#### Local (recommended)

```bash
npm install ../Cross-Chain-Intent-Bridge-Protocol/packages/intent-sdk
```

#### GitHub

```bash
npm install git+https://github.com/gahlautabhinav/Cross-Chain-Intent-Bridge-Protocol.git
```

---

### 3. Use it

```js
import { executeCrossChainIntent } from "intent-sdk";

const result = await executeCrossChainIntent({
  intent: { action: "liquidity" },
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

---

## 🔍 Developer Experience Philosophy

This SDK is built around 3 principles:

### 🧩 1. Intent > Transactions

You define outcomes, not steps.

### 🔌 2. Plug-and-Play

Minimal setup, maximum execution.

### 🔄 3. Chain Abstraction

Developers shouldn’t care *where* execution happens.

---

## 🧱 Repository Structure

```text
packages/
  intent-sdk/        → Core SDK

src/
  bridgeManager.mjs  → Stellar logic

contracts/
  WXLM.sol
  LiquidityPool.sol
  Staking.sol

scripts/
  test-intent.js     → Execution example

frontend/
  dapp/              → Optional UI
```

---

## ⚠️ Current Status

> 🚧 **Actively evolving — not production ready**

* Not published to npm
* API is unstable
* Internal patterns are still being refined

---

## 🛣️ Roadmap

### 🔜 SDK Evolution

* `createIntent()`
* `getIntentStatus()`
* `bridgeToChain()`

### 🌍 Multi-Chain Expansion

* Ethereum
* Solana
* More L2s

### ⚡ Advanced Intents

* Cross-chain swaps
* Lending / borrowing
* Multi-step DeFi strategies

### 🧑‍💻 DevEx Improvements

* TypeScript support
* Full documentation
* Error handling + retries
* Event indexing

---

## 🧠 Vision

This project is moving toward becoming:

> **“The Stripe for cross-chain execution.”**

A unified SDK where:

* Developers define intent
* Protocol handles execution
* Chains become implementation detail

---

## 🧪 Testing

```bash
cp .env.example .env
node scripts/test-intent.js
```

---

## 🤝 Contributing

We’re building something ambitious — contributions are welcome.

### High-impact areas:

* Modularizing execution engine
* Adding new intent types
* Multi-chain adapters
* Better logging & observability

### Steps:

1. Fork
2. Branch
3. PR 🚀

---

## 📜 License

MIT

---

## ⭐ If you like this project

Give it a ⭐ on GitHub — it helps a lot!

---

## 🧩 Final Note

This isn’t just a bridge.

It’s an **execution layer for intent-based Web3.**
