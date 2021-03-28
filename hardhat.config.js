/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require('hardhat-contract-sizer')
require('@nomiclabs/hardhat-ethers')
require('hardhat-artifactor')

module.exports = {
  solidity: "0.8.3",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
  networks: {
    hardhat: {
      accounts: {
        mnemonic: "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat"
      },
      loggingEnabled: false,
      allowUnlimitedContractSize: false,
    }
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false,
  }
};
