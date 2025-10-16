require("dotenv").config();
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  if (!deployer) throw new Error("❌ No signer found. Check AMOY_PRIVATE_KEY in .env");

  console.log("🚀 Deploying contracts with:", deployer.address);
  console.log("🔗 Network:", hre.network.name);

  const WXLM = await hre.ethers.getContractFactory("WXLM", deployer);
  const wxlm = await WXLM.deploy();
  await wxlm.waitForDeployment();
  console.log("✅ WXLM deployed at:", await wxlm.getAddress());

  const Pool = await hre.ethers.getContractFactory("LiquidityPool", deployer);
  const pool = await Pool.deploy(await wxlm.getAddress());
  await pool.waitForDeployment();
  console.log("✅ LiquidityPool deployed at:", await pool.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
