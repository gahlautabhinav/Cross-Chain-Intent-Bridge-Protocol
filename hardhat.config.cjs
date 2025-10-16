require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    compilers: [
      { version: "0.8.19" },
      { version: "0.8.20" }
    ]
  },
  networks: {
    localhost: { url: "http://127.0.0.1:8545" },
    // hardhat.config.cjs (add inside module.exports networks)
  amoy: {
    url: process.env.AMOY_RPC_URL || "https://rpc-amoy.polygon.technology",
    accounts: process.env.AMOY_PRIVATE_KEY ? [process.env.AMOY_PRIVATE_KEY] : []
  }

  }
};
