const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

const uniswapRouterAbi = require('../abi/uniswapRouter.json')
const erc20Abi = require('../abi/erc20.json')


describe("Swapping toke for eth",function (){
    // fixture
    async function deployContractAndImpersonateAccount(){
        const [addr1, addr2, addr3] = await ethers.getSigners()

        const USDCimpersonatedSigner = await ethers.getImpersonatedSigner("0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503");

        let UniswapRouterContract = await ethers.getContractAt(uniswapRouterAbi,'0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D');
        let UsdcContract = await ethers.getContractAt(erc20Abi,'0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48');
        let contract = await ethers.getContractFactory('tradeForEth')
        let SwapContract = contract.deploy('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D','0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2')

        return {UniswapRouterContract, UsdcContract, SwapContract, addr1, addr2, addr3, USDCimpersonatedSigner}
    }
    // it("should im")
    // it("should",async function(){
    //     // let contract = await ethers.getContractAt(uniswapRouterAbi,'0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D');
    //     const {UniswapRouter, SwapContract, Usdc, USDCimpersonatedSigner} = await loadFixture(deployContractAndImpersonateAccount);

    //     const name = await UniswapRouter.WETH()
    //     const balance = await (await SwapContract).connect(USDCimpersonatedSigner).CheckBalanceOfUser(Usdc.address)
    //     console.log("Balance of ",USDCimpersonatedSigner.address," is ",balance.toString())
    //     console.log("name",name)
    // })
    it("should swap token for eth",async function (){
        const { UsdcContract, UniswapRouterContract, SwapContract, USDCimpersonatedSigner, addr1} = await loadFixture(deployContractAndImpersonateAccount);
        let amount = 1000000
        // approving the swap contract
        let approve = await UsdcContract.connect(USDCimpersonatedSigner).approve((await SwapContract).address,amount);
        // console.log("approve ",approve.hash)
        // calling the contract
        await (await SwapContract).connect(USDCimpersonatedSigner).swapTokenForEth(UsdcContract.address,amount);
        // await result.wait();

        // checking the users balance
        let balance  = await (await SwapContract).userBalances(USDCimpersonatedSigner.address);
        console.log("Balance of user in contract ", balance.toString())
    })
})