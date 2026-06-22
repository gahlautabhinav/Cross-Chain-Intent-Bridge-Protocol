# soroban-intent

Soroban smart contracts for the Cross-Chain Intent Bridge Protocol. Records user intents and liquidity events on the Stellar network.

---

## Structure

```
soroban-intent/
├── Cargo.toml                          ← workspace root
└── contracts/
    ├── hello_world/                    ← scaffold (dev reference)
    │   └── src/
    │       ├── lib.rs
    │       └── test.rs
    └── intent_liquidity_demo/          ← main contract
        ├── Cargo.toml
        └── src/
            ├── lib.rs                  ← IntentLiquidityDemo contract
            └── test.rs                 ← test suite
```

---

## Contract: `IntentLiquidityDemo`

**File:** `contracts/intent_liquidity_demo/src/lib.rs`

Main contract struct. Records cross-chain intents and liquidity events on-chain before the bridge executes on Polygon.

### Methods

#### `.record_intent()` — `lib.rs:23`

Records a user's cross-chain intent on Stellar before execution begins. Called as part of the `lockOnStellar()` flow.

#### `.record_liquidity()` — `lib.rs:33`

Records a liquidity event (add/remove) associated with a bridged intent.

### Events

| Event | Location | Emitted when |
|---|---|---|
| `IntentRecorded` | `lib.rs:8` | Intent successfully recorded on-chain |
| `LiquidityAdded` | `lib.rs:15` | Liquidity event recorded |

---

## Build

```bash
cd soroban-intent
cargo build --target wasm32-unknown-unknown --release
```

---

## Test

```bash
cd soroban-intent
cargo test
```

Tests live in `contracts/intent_liquidity_demo/src/test.rs` — `test()` function at `test.rs:7`.

---

## Deploy (Testnet)

```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/intent_liquidity_demo.wasm \
  --source <YOUR_STELLAR_SECRET> \
  --network testnet
```

---

## Role in the Bridge

```
lockOnStellar()  ← src/bridgeManager.mjs
    ├── submit Stellar XLM lock tx
    └── call IntentLiquidityDemo.record_intent()
            ↓
        IntentRecorded event emitted
            ↓
        proof returned to bridge orchestrator
```

The recorded intent on Soroban serves as the verifiable on-chain anchor before `mintAndExecuteOnPolygon()` runs on the EVM side.

---

## Prerequisites

- Rust toolchain + `wasm32-unknown-unknown` target
- Stellar CLI (`stellar`)
- Soroban SDK (declared in `Cargo.toml`)

```bash
rustup target add wasm32-unknown-unknown
cargo install stellar-cli
```
