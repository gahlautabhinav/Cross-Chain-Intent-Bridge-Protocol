// src/bridgeManager.mjs — Resilient Stellar lock flow for Cross-Chain Intent SDK
import { Horizon, Keypair, TransactionBuilder, Networks, Operation, Asset, BASE_FEE } from "@stellar/stellar-sdk";
import dotenv from "dotenv";
dotenv.config();

// Initialize Horizon client
const server = new Horizon.Server(process.env.HORIZON_URL || "https://horizon-testnet.stellar.org");

// Utility: retry wrapper for network stability
async function retry(fn, retries = 3, delayMs = 2000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      console.warn(`⚠️ Attempt ${attempt} failed: ${err.message}`);
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}

// Main Stellar lock function
export async function lockOnStellar(amount = "50") {
  if (!process.env.STELLAR_SECRET) {
    throw new Error("Missing STELLAR_SECRET in .env — please add your testnet secret key.");
  }

  // ✅ Ensure the amount is a valid positive string
  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
    throw new Error("Invalid amount: must be a positive numeric value.");
  }
  amount = String(Number(amount)).trim();

  const source = Keypair.fromSecret(process.env.STELLAR_SECRET);
  let account;

  try {
    account = await retry(() => server.loadAccount(source.publicKey()));
  } catch (err) {
    if (err.response?.status === 404) {
      console.log("🚰 Account not found — funding via Friendbot...");
      const res = await fetch(`https://friendbot.stellar.org?addr=${source.publicKey()}`);
      if (res.ok) {
        console.log("✅ Account funded successfully! Retrying transaction...");
        await new Promise((r) => setTimeout(r, 4000));
        account = await retry(() => server.loadAccount(source.publicKey()));
      } else {
        throw new Error("❌ Friendbot funding failed.");
      }
    } else {
      throw err;
    }
  }

  console.log(`🔹 Preparing Stellar payment transaction for ${amount} XLM...`);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.payment({
        destination: process.env.STELLAR_LOCK_ADDRESS || source.publicKey(),
        asset: Asset.native(),
        amount, // already sanitized
      })
    )
    .setTimeout(180)
    .build();

  tx.sign(source);

  console.log("📡 Submitting transaction to Horizon...");
  const res = await retry(() => server.submitTransaction(tx));
  console.log(`✅ Horizon confirmed TX: ${res.hash}`);

  return { txHash: res.hash, ledger: res.ledger };
}
