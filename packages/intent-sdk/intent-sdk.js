// packages/intent-sdk/intent-sdk.js
import { lockOnStellar } from "../../src/bridgeManager.mjs";
import { ethers } from "ethers";

export async function executeCrossChainIntent(params) {
  console.log("🚀 Starting Cross-Chain Intent Execution via SDK...\n");

  const { intent, stellar, polygon, amount } = params;

  // -----------------------------------------------
  // 🔹 STEP 1 — Execute Stellar Lock
  // -----------------------------------------------
  console.log("🔹 Step 1 — Locking assets on Stellar...");
  const stellarProof = await lockOnStellar(amount.toString());
  console.log(`👉 Stellar tx: ${stellarProof.txHash}\n`);

  // -----------------------------------------------
  // 🔹 STEP 2 — Execute Polygon Logic (Mint + Action)
  // -----------------------------------------------
  console.log(`🔹 Executing Intent: ${intent?.action || "bridge"}`);

  if (intent?.action === "liquidity") {
    console.log("🌊 Providing liquidity on Polygon pool...");
  } else if (intent?.action === "stake") {
    console.log("💎 Staking WXLM on Polygon...");
  } else {
    console.log("⚙️  Default: mint-only bridge flow...");
  }

  // -----------------------------------------------
  // Validate Polygon Config
  // -----------------------------------------------
  const rpc = polygon.rpcUrl || process.env.AMOY_RPC_URL;
  const pk =
    polygon.privateKey ||
    process.env.AMOY_PRIVATE_KEY ||
    process.env.PRIVATE_KEY ||
    "";

  if (!rpc) throw new Error("Missing Polygon RPC URL.");
  if (!pk || !pk.startsWith("0x") || pk.length !== 66)
    throw new Error("Invalid or missing Polygon private key.");

  const provider = new ethers.JsonRpcProvider(rpc);
  const wallet = new ethers.Wallet(pk, provider);

  const wxlmAddr = polygon.wxlmAddr || process.env.WXLM_ADDR;
  const poolAddr =
    polygon.poolAddr || process.env.STAKING_ADDR || polygon.liquidityAddr;

  if (!wxlmAddr)
    throw new Error("Missing WXLM contract address in env or params.");
  if (!poolAddr)
    throw new Error("Missing Polygon pool/staking contract address in env or params.");

  console.log(`🔗 Using WXLM at: ${wxlmAddr}`);
  console.log(`🔗 Using Pool at: ${poolAddr}`);

  // -----------------------------------------------
  // Contract Setup
  // -----------------------------------------------
  const wxlmAbi = [
    "function mint(address to, uint256 amount)",
    "function approve(address spender,uint256 amount)",
  ];
  const wxlm = new ethers.Contract(wxlmAddr, wxlmAbi, wallet);

  let abi, contract;
  if (intent?.action === "liquidity") {
    abi = ["function addLiquidity(uint256 amount)"];
    contract = new ethers.Contract(poolAddr, abi, wallet);
  } else if (intent?.action === "stake") {
    abi = ["function stake(uint256 amount)"];
    contract = new ethers.Contract(poolAddr, abi, wallet);
  } else {
    abi = ["function noop()"];
    contract = new ethers.Contract(poolAddr, abi, wallet);
  }

  const amountWei = ethers.parseEther(amount.toString());
  const nonce = await provider.getTransactionCount(wallet.address, "latest");

  // -----------------------------------------------
  // Mint WXLM (simulate bridge mint)
  // -----------------------------------------------
  console.log("👉 Minting WXLM on Polygon...");
  const mintTx = await wxlm.mint(wallet.address, amountWei, { nonce });
  const mintReceipt = await mintTx.wait();
  console.log(`✅ Minted — TX: ${mintReceipt.hash}`);

  // -----------------------------------------------
  // Approve WXLM for Pool
  // -----------------------------------------------
  const approveTx = await wxlm.approve(poolAddr, amountWei, { nonce: nonce + 1 });
  const approveReceipt = await approveTx.wait();
  console.log(`✅ Approved — TX: ${approveReceipt.hash}`);

  // -----------------------------------------------
  // Execute Liquidity / Stake
  // -----------------------------------------------
  let actionTx, actionReceipt;
  if (intent?.action === "liquidity") {
    actionTx = await contract.addLiquidity(amountWei, { nonce: nonce + 2 });
    actionReceipt = await actionTx.wait();
    console.log(`✅ Liquidity Added — TX: ${actionReceipt.hash}`);
  } else if (intent?.action === "stake") {
    actionTx = await contract.stake(amountWei, { nonce: nonce + 2 });
    actionReceipt = await actionTx.wait();
    console.log(`✅ Staked — TX: ${actionReceipt.hash}`);
  }

  // -----------------------------------------------
  // 🔹 STEP 3 — Unified Result
  // -----------------------------------------------
  const polygonProof = {
    mintTx: mintReceipt.hash,
    approveTx: approveReceipt.hash,
    actionTx: actionReceipt?.hash || null,
  };

  const unifiedProof = {
    timestamp: new Date().toISOString(),
    intent,
    status: "completed",
    stellar: stellarProof,
    polygon: polygonProof,
  };

  console.log("\n✅ Unified Cross-Chain Intent Result:");
  console.log(JSON.stringify(unifiedProof, null, 2));
  return unifiedProof;
}
