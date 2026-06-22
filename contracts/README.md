# contracts

Solidity smart contracts for the Polygon Amoy execution layer of the Cross-Chain Intent Bridge Protocol.

---

## Contracts

### `WXLM.sol` — Wrapped XLM

ERC-20 token minted on Polygon Amoy as proof of XLM locked on Stellar.

- Minted by `mintAndExecuteOnPolygon()` after `lockOnStellar()` confirms
- Burned / tracked as the liquidity/staking unit on the EVM side
- All intent actions (`bridge`, `liquidity`, `stake`) begin with minting WXLM

### `LiquidityPool.sol` — LP Contract

Accepts WXLM deposits from bridged intents.

- Used when `intent.action === "liquidity"`
- Flow: mint WXLM → approve LiquidityPool → `addLiquidity()`

### `Staking.sol` — Staking / Yield Layer

Staking contract for WXLM.

- Used when `intent.action === "stake"`
- Flow: mint WXLM → approve Staking → `stake()`

---

## Intent → Contract Routing

| `intent.action` | Contract called | Method |
|---|---|---|
| `"bridge"` | — | Mint WXLM only, no further contract |
| `"liquidity"` | `LiquidityPool.sol` | `addLiquidity()` |
| `"stake"` | `Staking.sol` | `stake()` |

Routing logic lives in `src/executor.js` → `mintAndExecuteOnPolygon()`.

---

## Deploy

```bash
node scripts/deploy.js
```

Deploys all three contracts to Polygon Amoy. Set env vars first:

```env
AMOY_RPC_URL=
AMOY_PRIVATE_KEY=
```

After deploy, copy the output addresses into `.env`:

```env
WXLM_ADDR=
LIQUIDITY_ADDR=
STAKING_ADDR=
```

---

## Network

**Polygon Amoy** (testnet)
- Chain ID: `80002`
- RPC: `https://rpc-amoy.polygon.technology`
- Explorer: `https://amoy.polygonscan.com`

---

## Dependencies

- `ethers.js` — all contract interaction goes through `src/executor.js`
- No Hardhat config is required for the deploy script — uses ethers directly via `scripts/deploy.js`
