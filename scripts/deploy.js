// scripts/deploy.js  (ESM version)
import hre from "hardhat";

async function main() {
  const WXLM = await hre.ethers.getContractFactory("WXLM");
  const wxlm = await WXLM.deploy();
  await wxlm.waitForDeployment();
  const wxlmAddr = await wxlm.getAddress();

  const Staking = await hre.ethers.getContractFactory("StakingSimple");
  const staking = await Staking.deploy(wxlmAddr);
  await staking.waitForDeployment();
  const stakingAddr = await staking.getAddress();

  console.log("✅ WXLM deployed to:", wxlmAddr);
  console.log("✅ StakingSimple deployed to:", stakingAddr);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
