const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
//   const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const erc20Abi = require('../abi/erc20.json')

describe('Swap', function (){
    it("should impersonate account",async function () {
        const impersonatedSigner = await ethers.getImpersonatedSigner("0x1234567890123456789012345678901234567890");
        console.log("Balance of impersonate ",await (await ethers.provider.getBalance(impersonatedSigner.address)).toString())
        let amountInEth = '1'
        let addressToSend = '0xC9DDd4a9640DE6a774A231F5862c922AC6cb394D'

        const tx = {
            to: addressToSend,
            value: ethers.utils.parseEther(amountInEth) 
        }

        let txHash = await impersonatedSigner.sendTransaction(tx);
        console.log("hash", txHash.hash)
        console.log("Balance of impersonate ", await (await ethers.provider.getBalance(impersonatedSigner.address)).toString())
        console.log("Balance of user ", await (await ethers.provider.getBalance(addressToSend)).toString())
    })
    it("should call the function of contract",async function () {
        const [signer] = await ethers.getSigners();
        console.log("Address ",signer.address)

        let contract = await (await ethers.getContractFactory('ERC20')).attach('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48')
        // console.log("balance ",contract.name())
        let name = await contract.totalSupply()
        console.log("name ",name)

    })
})
  