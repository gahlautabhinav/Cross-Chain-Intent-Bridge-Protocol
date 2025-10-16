export function report(stellarProof, polygonResult) {
  return {
    timestamp: new Date().toISOString(),
    stellar: {
      txHash: stellarProof.txHash,
      horizonUrl: `https://horizon-testnet.stellar.org/transactions/${stellarProof.txHash}`,
    },
    polygon: {
      mintTx: polygonResult.mintTxHash,
      stakeTx: polygonResult.stakeTxHash
    },
    status: "completed"
  };
}
