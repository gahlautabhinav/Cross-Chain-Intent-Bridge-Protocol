# Architecture

## System Overview

Cross-Chain Intent Bridge Protocol connects **Stellar** (asset lock layer) to **Polygon Amoy** (execution layer) via an intent-driven SDK. Users declare outcomes; the protocol handles multi-chain orchestration.

---

## Component Map

```
┌─────────────────────────────────────────────────────────┐
│                     ENTRY POINTS                        │
│  src/index.js          src/index_copy.js               │
│  main() → full flow    main() → compile+bridge+report  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                 INTENT COMPILER                         │
│  src/intentCompiler.js                                  │
│  compileIntent(raw) → normalized intent object          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                    SDK LAYER                            │
│  packages/intent-sdk/intent-sdk.js                      │
│  executeCrossChainIntent(params)  ← public API          │
│                                                         │
│  src/sdk-extend.js                                      │
│  executeCrossChainIntent() extended variant             │
└──────────┬──────────────────────────┬───────────────────┘
           │                          │
           ▼                          ▼
┌──────────────────────┐  ┌──────────────────────────────┐
│   STELLAR LAYER      │  │      POLYGON LAYER           │
│                      │  │                              │
│  src/bridgeManager   │  │  src/executor.js             │
│  .mjs                │  │  mintAndExecuteOnPolygon()   │
│                      │  │                              │
│  lockOnStellar()     │  │  1. Mint WXLM                │
│  └── retry()         │  │  2. Approve contract         │
│                      │  │  3. Route by intent:         │
│  Locks XLM on        │  │     bridge → mint only       │
│  Stellar network     │  │     liquidity → add LP       │
│  Returns tx proof    │  │     stake → stake WXLM       │
└──────────────────────┘  └──────────────────────────────┘
           │                          │
           └──────────┬───────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│                    REPORTER                             │
│  src/report.js                                          │
│  report(stellarResult, polygonResult) → unified proof   │
└─────────────────────────────────────────────────────────┘
```

---

## On-Chain Components

### Soroban (Stellar) — Rust

**Location:** `soroban-intent/contracts/intent_liquidity_demo/src/`

| Symbol | Type | Role |
|---|---|---|
| `IntentLiquidityDemo` | Contract struct | Main contract (4 edges — god node) |
| `.record_intent()` | Method | Records user intent on-chain |
| `.record_liquidity()` | Method | Records liquidity events |
| `IntentRecorded` | Event | Emitted after intent recording |
| `LiquidityAdded` | Event | Emitted after liquidity event |

Tests: `soroban-intent/contracts/intent_liquidity_demo/src/test.rs`

### EVM (Polygon Amoy) — Solidity

**Location:** `contracts/`

| Contract | Role |
|---|---|
| `WXLM.sol` | Wrapped XLM — ERC-20 minted on Polygon after Stellar lock |
| `LiquidityPool.sol` | LP contract for WXLM liquidity provision |
| `Staking.sol` | Staking / yield layer for WXLM |

Deployment: `scripts/deploy.js` → `main()`

---

## Data Flow

```
1. User calls executeCrossChainIntent({ intent, stellar, polygon, amount })
       ↓
2. compileIntent() normalizes + validates intent object
       ↓
3. lockOnStellar() submits Stellar transaction
   - retry() wraps it with exponential backoff
   - Returns { txHash, proof }
       ↓
4. [Stellar confirmation]
       ↓
5. mintAndExecuteOnPolygon() executes on Polygon Amoy:
   a. Mint WXLM (proof of Stellar lock)
   b. Approve target contract
   c. Route: bridge | liquidity | stake
   - Returns { mintTx, approveTx, actionTx }
       ↓
6. report() aggregates both results → unified proof object
       ↓
7. Returns to caller
```

---

## God Nodes (high connectivity — change with care)

| Node | File | Edges | Why it matters |
|---|---|---|---|
| `lockOnStellar()` | `src/bridgeManager.mjs:23` | 6 | Called by both entry points + SDK; contains retry logic |
| `main()` | `src/index.js` + `src/index_copy.js` | 6 | Orchestrates entire flow; cross-community bridge |
| `IntentLiquidityDemo` | `soroban-intent/.../lib.rs:5` | 4 | Root Soroban contract; owns both record methods |
| `mintAndExecuteOnPolygon()` | `src/executor.js:6` | 4 | All Polygon execution routes through here |
| `compileIntent()` | `src/intentCompiler.js:1` | 4 | All intents pass through; normalization layer |
| `report()` | `src/report.js` | 4 | Aggregation point for all cross-chain results |

---

## Community Graph

```
Bridge Manager & Core ────────── Intent Compiler & Reporter
  (5 edges between)                  (1 edge)
       │                                │
       │                         Polygon Executor
       │                        mintAndExecuteOnPolygon()
       │
Cross Chain Bridge SDK
  (intent-sdk, ethers.js, Stellar)
       │
Soroban Intent Contracts      Polygon Liquidity Contracts
  (IntentLiquidityDemo)         (WXLM, LP, Staking)

Deployment Scripts            Soroban Test Suite
  (scripts/deploy.js)           (test.rs)

SDK Extension
  (src/sdk-extend.js)
```

---

## Technology Stack

| Layer | Tech |
|---|---|
| Stellar interaction | Stellar SDK (JS) |
| Soroban contracts | Rust + Soroban SDK |
| Soroban tests | Rust `#[test]` |
| EVM contracts | Solidity |
| EVM interaction | ethers.js |
| Bridge SDK | Node.js ESM |
| Contract deployment | Hardhat / ethers.js scripts |

---

## Known Gaps

From graph analysis (`graphify-out/GRAPH_REPORT.md`):

- `ethers.js`, `Stellar`, `WXLM.sol`, `LiquidityPool.sol` are isolated nodes — under-documented connections
- Soroban proof verification on EVM side is not yet modeled in the graph
- `src/index_copy.js` is a near-duplicate of `src/index.js` — potential consolidation target
