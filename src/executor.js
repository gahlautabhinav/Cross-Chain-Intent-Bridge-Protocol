// src/executor.js — ESM compatible (ethers v6) with manual nonce management
import dotenv from "dotenv";
dotenv.config();
import { ethers } from "ethers";

export async function mintAndExecuteOnPolygon(intent, stellarProof) {
  const provider = new ethers.JsonRpcProvider(process.env.AMOY_RPC_URL || "https://rpc-amoy.polygon.technology");
  const wallet = new ethers.Wallet(process.env.AMOY_PRIVATE_KEY, provider);

  const wxlmAddr = process.env.WXLM_ADDR;
  const stakingAddr = process.env.STAKING_ADDR;

  const wxlmAbi = [
    "function mint(address to, uint256 amount)",
    "function approve(address spender, uint256 amount) public returns (bool)"
  ];
  const stakingAbi = ["function stake(uint256 amount) external"];

  const wxlm = new ethers.Contract(wxlmAddr, wxlmAbi, wallet);
  const staking = new ethers.Contract(stakingAddr, stakingAbi, wallet);

  const amountWei = ethers.parseEther(intent.amount.toString());

  // 🔹 1️⃣ get current nonce to ensure sequential txs
  let currentNonce = await provider.getTransactionCount(wallet.address, "latest");

  console.log(`🔹 Using base nonce: ${currentNonce}`);

  // 🔹 2️⃣ Mint wrapped token (simulate bridge mint)
  console.log("👉 Minting WXLM on Polygon...");
  const mintTx = await wxlm.mint(wallet.address, amountWei, { nonce: currentNonce });
  const mintReceipt = await mintTx.wait();
  console.log(`✅ Minted — TX: ${mintReceipt.hash}`);

  // 🔹 3️⃣ Approve staking contract
  console.log("👉 Approving staking contract...");
  const approveTx = await wxlm.approve(stakingAddr, amountWei, { nonce: currentNonce + 1 });
  const approveReceipt = await approveTx.wait();
  console.log(`✅ Approved — TX: ${approveReceipt.hash}`);

  // 🔹 4️⃣ Stake WXLM
  console.log("👉 Staking WXLM...");
  const stakeTx = await staking.stake(amountWei, { nonce: currentNonce + 2 });
  const stakeReceipt = await stakeTx.wait();
  console.log(`✅ Staked — TX: ${stakeReceipt.hash}`);

  // 🔹 5️⃣ Return combined proof object
  return {
    stellarTxHash: stellarProof.txHash,
    mintTxHash: mintReceipt.hash,
    approveTxHash: approveReceipt.hash,
    stakeTxHash: stakeReceipt.hash,
    ledger: stellarProof.ledger,
  };
}
