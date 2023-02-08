require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config()

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  mocha: {
    timeout: 100000000
  },
  networks: {
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${process.env.ALCHEMYKEYGOERLI}`,
      accounts: [process.env.GOERLI_PRIVATE_KEY],
    },
    // hardhat: {
    //   forking: {
    //     url: "https://eth-mainnet.g.alchemy.com/v2/7srgzJk3kbhlr7vmHIFDPqv95CbnD9qT",
    //   }
    // }
  }
};
