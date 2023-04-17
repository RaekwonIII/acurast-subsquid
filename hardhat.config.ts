import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
const fs = require('fs');

const account = fs.readFileSync(".account").toString().trim() || "";
const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337,
      mining: {
        auto: false,
        interval: [4800, 5200]
      }
    },
    shibuya: {
      url:"https://evm.shibuya.astar.network",
      chainId:81,
      accounts: [account],
    }
  },
  solidity: "0.8.18",
};

export default config;
