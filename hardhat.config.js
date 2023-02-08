require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  mocha: {
    timeout: 100000000
  },
  networks: {
    hardhat: {
      forking: {
        url: "https://eth-mainnet.g.alchemy.com/v2/7srgzJk3kbhlr7vmHIFDPqv95CbnD9qT",
      }
    }
  }
};
