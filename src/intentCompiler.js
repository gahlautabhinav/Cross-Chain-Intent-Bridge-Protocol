export function compileIntent(raw) {
  return {
    fromChain: raw.fromChain || "Stellar",
    toChain: raw.toChain || "Polygon",
    asset: raw.asset || "XLM",
    amount: raw.amount || "50",
    intent: raw.intent || "stake",
    destinationContract: raw.destinationContract || process.env.STAKING_ADDR
  };
}
