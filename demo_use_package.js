// demo_use_package.js
import dotenv from "dotenv";
dotenv.config();

import { executeCrossChainIntent } from "@stellar/intent-sdk"; // replace with your SDK package name

console.log("\n🌉 CROSS-CHAIN INTENT PROTOCOL DEMO\n");

// --------------------------------------------------------
// 🧩 1. Define User Intent (this drives all cross-chain logic)
// --------------------------------------------------------
const userIntent = {
  fromChain: "Stellar",
  toChain: "Polygon",
  asset: "XLM",
  amount: process.env.INTENT_AMOUNT || "20", // default fallback
  action: "liquidity", // or "stake"
  description:
    "User wants to provide liquidity with bridged XLM on Polygon Amoy testnet",
};

// --------------------------------------------------------
// 🧩 2. Preflight Configuration Check (for hackathon clarity)
// --------------------------------------------------------
console.log("🔍 Environment Preflight Check:");
console.log("HORIZON_URL:", process.env.HORIZON_URL || "❌ Missing");
console.log("STELLAR_SECRET:", process.env.STELLAR_SECRET ? "✅ Present" : "❌ Missing");
console.log("AMOY_RPC_URL:", process.env.AMOY_RPC_URL || "❌ Missing");
console.log("AMOY_PRIVATE_KEY:", process.env.AMOY_PRIVATE_KEY ? "✅ Present" : "❌ Missing");
console.log("WXLM_ADDR:", process.env.WXLM_ADDR || "❌ Missing");
console.log("STAKING_ADDR:", process.env.STAKING_ADDR || "❌ Missing");
console.log("--------------------------------------------------------\n");

// --------------------------------------------------------
// 🚀 3. Execute the Intent using your SDK
// --------------------------------------------------------
(async () => {
  try {
    console.log("🧩 Interpreting User Intent:");
    console.log(JSON.stringify(userIntent, null, 2));
    console.log("\n----------------------------------------------\n");
    console.log("🚀 Executing Cross-Chain Intent...\n");

    const result = await executeCrossChainIntent({
      intent: userIntent,

      stellar: { secret: process.env.STELLAR_SECRET },
      amount: userIntent.amount,

      polygon: {
        rpcUrl: process.env.AMOY_RPC_URL,
        privateKey: process.env.AMOY_PRIVATE_KEY, // ✅ uses correct env
        wxlmAddr: process.env.WXLM_ADDR,
        poolAddr: process.env.STAKING_ADDR, // ✅ unified liquidity/staking contract
      },

      options: { friendbotAutoFund: true },
    });

    console.log("\n✅ FINAL INTENT RESULT:");
    console.log(JSON.stringify(result, null, 2));

    console.log("----------------------------------------------");
    console.log("   Demo complete — powered by @stellar/intent-sdk");
    console.log("----------------------------------------------");
  } catch (e) {
    console.error("\n❌ Intent Execution Failed:");
    console.error(e);
    console.log("----------------------------------------------");
    console.log("   Demo complete — powered by @stellar/intent-sdk");
    console.log("----------------------------------------------");
  }
})();
