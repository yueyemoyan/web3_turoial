require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()
require("./task")
require('hardhat-deploy')
require("@nomicfoundation/hardhat-ethers")
require("hardhat-deploy")
require("hardhat-deploy-ethers")

const SEPOLIA_URL = process.env.SEPOLIA_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const PRIVATE_KEY_1 = process.env.PRIVATE_KEY_1
const ETHERSCAN_APIKEY = process.env.ETHERSCAN_APIKEY


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.27",
  networks: {
    sepolia: {
      url: SEPOLIA_URL,
      accounts: [PRIVATE_KEY, PRIVATE_KEY_1],
      chainId: 11155111
    }
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: {
      sepolia: ETHERSCAN_APIKEY
    }
  },
  namedAccounts: {
    firstAccount: {
      default: 0
    },
    secondAccount: {
      default: 1
    }
  },
  gasReporter: {
    enabled: false  // open then gas view after running test
  }
};
