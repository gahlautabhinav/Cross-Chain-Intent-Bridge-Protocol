import "dotenv/config";
import { compileIntent } from "./intentCompiler.js";
import { lockOnStellar } from "./bridgeManager.mjs";
import { mintAndExecuteOnPolygon } from "./executor.js";
import { report } from "./report.js";

async function main() {
  console.log("🚀 Starting Cross-Chain Intent demo...");

  const raw = {
    fromChain: "Stellar",
    toChain: "Polygon",
    asset: "XLM",
    amount: "50",
    intent: "stake",
    destinationContract: process.env.STAKING_ADDR
  };

  const intent = compileIntent(raw);

  console.log("🔹 Step 1 — Locking on Stellar...");
  const stellarProof = await lockOnStellar(intent.amount);
  console.log("👉 Stellar tx:", stellarProof.txHash);

  console.log("🔹 Step 2 — Mint & Stake on Polygon...");
  const polygonResult = await mintAndExecuteOnPolygon(intent, stellarProof);
  console.log("👉 Mint tx:", polygonResult.mintTxHash, "Stake tx:", polygonResult.stakeTxHash);

  const unified = report(stellarProof, polygonResult);
  console.log("✅ Unified report:\n", JSON.stringify(unified, null, 2));
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
