// src/sdk-extension.js
import { Horizon, Keypair, TransactionBuilder, Networks, Operation, Asset, BASE_FEE } from "@stellar/stellar-sdk";
import { ethers } from "ethers";

// ========== MAIN FUNCTION ==========
export async function executeCrossChainIntent({
  fromChain,
  toChain,
  asset,
  amount,
  intent,
  privateKey,
  polygon
}) {
  console.log(`🚀 Executing cross-chain intent: ${fromChain} → ${toChain} (${intent})`);

  // ---------- Step 1: Stellar Lock ----------
  const server = new Horizon.Server("https://horizon-testnet.stellar.org");
  const source = Keypair.fromSecret(privateKey);

  // Auto-fund if needed
  try {
    await server.loadAccount(source.publicKey());
  } catch (err) {
    if (err.response?.status === 404) {
      console.log("🚰 Account not found — funding via Friendbot...");
      await fetch(`https://friendbot.stellar.org?addr=${source.publicKey()}`);
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  const account = await server.loadAccount(source.publicKey());
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET
  })
    .addOperation(
      Operation.payment({
        destination: source.publicKey(),
        asset: Asset.native(),
        amount: amount.toString(),
      })
    )
    .setTimeout(180)
    .build();

  tx.sign(source);
  const res = await server.submitTransaction(tx);
  console.log(`✅ Locked on Stellar: ${res.hash}`);

  const stellarProof = { txHash: res.hash, ledger: res.ledger };

  // ---------- Step 2: Polygon Intent Execution ----------
  const provider = new ethers.JsonRpcProvider(polygon.rpcUrl);
  const wallet = new ethers.Wallet(polygon.privateKey, provider);

  const wxlm = new ethers.Contract(
    polygon.wxlmAddr,
    [
      "function mint(address to, uint256 amount)",
      "function approve(address spender,uint256 amount)",
    ],
    wallet
  );

  const staking = new ethers.Contract(
    polygon.stakingAddr,
    ["function stake(uint256 amount) external"],
    wallet
  );

  const amountWei = ethers.parseEther(amount.toString());
  let nonce = await provider.getTransactionCount(wallet.address, "latest");

  const mintTx = await wxlm.mint(wallet.address, amountWei, { nonce });
  await mintTx.wait();

  const approveTx = await wxlm.approve(polygon.stakingAddr, amountWei, { nonce: nonce + 1 });
  await approveTx.wait();

  const stakeTx = await staking.stake(amountWei, { nonce: nonce + 2 });
  await stakeTx.wait();

  console.log(`✅ Intent ${intent} executed successfully!`);

  return {
    intent,
    stellar: {
      txHash: res.hash,
      horizonUrl: `https://horizon-testnet.stellar.org/transactions/${res.hash}`
    },
    polygon: {
      mintTx: mintTx.hash,
      stakeTx: stakeTx.hash
    },
    status: "completed",
    timestamp: new Date().toISOString()
  };
}
