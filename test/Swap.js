const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

const uniswapRouterAbi = require('../abi/uniswapRouter.json')
const erc20Abi = require('../abi/erc20.json')


describe("Swap Contract", function () {

    // fixture for code reusbality by getting the same state of blockchain
    async function deployContractAndImpersonateAccount() {
        const [addr1, addr2, addr3] = await ethers.getSigners()

        let address = "0xC9DDd4a9640DE6a774A231F5862c922AC6cb394D"

        const USDCimpersonatedSigner = await ethers.getImpersonatedSigner("0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503");

        let UniswapRouterContract = await ethers.getContractAt(uniswapRouterAbi, '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D');

        let UsdcContract = await ethers.getContractAt(erc20Abi, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48');

        let contract = await ethers.getContractFactory('tradeForEth')
        let SwapContract = contract.deploy('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2')
            ; (await SwapContract).deployed

        return { UniswapRouterContract, UsdcContract, SwapContract, addr1, addr2, addr3, address, USDCimpersonatedSigner }
    }

    describe("Contract functionality", function(){
        describe("Validation", function(){
            it("contract should accept direct eth",async function(){
                const { USDCimpersonatedSigner, SwapContract, address } = await loadFixture(deployContractAndImpersonateAccount);
                let balanceOfContractBefore = await ethers.provider.getBalance((await SwapContract).address);
                console.log("Balance of contract before sending ETH into contract ",balanceOfContractBefore);
                expect(balanceOfContractBefore).to.be.equal(0);
                await USDCimpersonatedSigner.sendTransaction({to: (await SwapContract).address, value: ethers.utils.parseEther('0.1')})

                let balanceOfContractAfter = await ethers.provider.getBalance((await SwapContract).address);
                console.log("Balance of contract after sending ETH ", balanceOfContractAfter)

                expect(balanceOfContractAfter).to.be.greaterThan(balanceOfContractBefore)
            })
        })
    })
    describe("Impersonate account", function () {
        describe("Validation", function(){
            it("Should send eth from impersonate account to other", async function () {
                const { USDCimpersonatedSigner, address } = await loadFixture(deployContractAndImpersonateAccount);
    
                let balanceOfSigner = await ethers.provider.getBalance(USDCimpersonatedSigner.address);
                const balance = ethers.utils.formatEther(balanceOfSigner);
                console.log("Balance of before impersonate account : ", balance);
    
                let balanceOfSigner2 = await ethers.provider.getBalance(address);
                const balance2 = ethers.utils.formatEther(balanceOfSigner2);
                console.log("Balance of address to send before : ", balance2);
    
                let sendHash = await USDCimpersonatedSigner.sendTransaction({ to: address, value: "1000000000000000000" })
                console.log("Hash ", sendHash.hash);
    
                let balanceOfSigner3 = await ethers.provider.getBalance(USDCimpersonatedSigner.address);
                const balance3 = ethers.utils.formatEther(balanceOfSigner3);
                console.log("Balance of after impersonate account : ", balance3);
    
                let balanceOfSigner4 = await ethers.provider.getBalance(address);
                const balance4 = ethers.utils.formatEther(balanceOfSigner4);
                console.log("Balance of after address to send : ", balance4);
            })
        })
        describe("Event",function (){

        })
        
    })
    describe("Pefrom swap", function () {
        describe("Validation",function(){
            it("should through error when user pass any invlaid address", async function(){
                const { USDCimpersonatedSigner, UsdcContract, SwapContract } = await loadFixture(deployContractAndImpersonateAccount);

                await expect((await SwapContract).swapTokenForEth(ethers.constants.AddressZero,1000000)).to.be.revertedWith('Invalid address');

            })
            it("should throw error when user gives invalid amount input", async function (){
                const { USDCimpersonatedSigner, UsdcContract, SwapContract } = await loadFixture(deployContractAndImpersonateAccount);

                await expect((await SwapContract).swapTokenForEth(UsdcContract.address, 0)).to.be.revertedWith('Invalid amount');
            })
            it("should throw error when user does not approve the requirement amount of token to this contract", async function(){
                const { USDCimpersonatedSigner, UsdcContract, SwapContract } = await loadFixture(deployContractAndImpersonateAccount);

                await expect((await SwapContract).swapTokenForEth(UsdcContract.address, 10000)).to.be.revertedWith('Insufficient approve amount')
            })
            it("should approve the contract in order to perform swap", async function () {
                const { USDCimpersonatedSigner, UsdcContract, SwapContract } = await loadFixture(deployContractAndImpersonateAccount);
    
                // approving to swap contract from address
                let approveHash = await UsdcContract.connect(USDCimpersonatedSigner).approve((await SwapContract).address, 1000000);
                console.log("approve hash", approveHash.hash);
    
                // checking with allownace 
                let allownaceValue = await UsdcContract.allowance(USDCimpersonatedSigner.address, (await SwapContract).address);
                console.log("Allowance amount ", allownaceValue.toString())
    
                expect(allownaceValue).to.be.equal(1000000);
            })
            it("Should perform swap", async function () {
                const { USDCimpersonatedSigner, UsdcContract, SwapContract } = await loadFixture(deployContractAndImpersonateAccount);
    
                let amountOfUserInContract = await (await SwapContract).userBalances(USDCimpersonatedSigner.address);
                let valueInNumber = ethers.utils.formatUnits(amountOfUserInContract);
                console.log("Balance of ETH of user in contract before swap ", valueInNumber);
    
                // approving
                let approveHash = await UsdcContract.connect(USDCimpersonatedSigner).approve((await SwapContract).address, 100000000);
                console.log("approve hash", approveHash.hash);
    
                // swaping 
                let swapHash = await (await SwapContract).connect(USDCimpersonatedSigner).swapTokenForEth(UsdcContract.address, 100000000)
                console.log("swap hash ", swapHash.hash);
    
    
                let amountOfUserInContract2 = await (await SwapContract).userBalances(USDCimpersonatedSigner.address);
                let valueInNumber2 = ethers.utils.formatUnits(amountOfUserInContract2)
                // expect(valueInNumber2).to.be.greaterThan(0)
                console.log("Balance of ETH of user in contract after swap ", valueInNumber2);
    
            })
        })
        describe("Event",function(){
            // it("should emit event when it perfromed the swap succesfully",async function(){
            //     const { USDCimpersonatedSigner, UsdcContract, SwapContract } = await loadFixture(deployContractAndImpersonateAccount);
                
            //     // approving
            //     let approveHash = await UsdcContract.connect(USDCimpersonatedSigner).approve((await SwapContract).address, 100000000);
            //     console.log("approve hash", approveHash.hash);

            //     // swaping 
            //     // await expect(await (await SwapContract).connect(USDCimpersonatedSigner).swapTokenForEth(UsdcContract.address, 100000000)).to.emit(SwapContract,"swap").withArgs(UsdcContract.address,USDCimpersonatedSigner.address,100000000)
            //     // let swapHash = await (await SwapContract).connect(USDCimpersonatedSigner).swapTokenForEth(UsdcContract.address, 100000000)
            //     await expect(await SwapContract.connect(USDCimpersonatedSigner).swapTokenForEth(UsdcContract.address, 100000000)).to.emit(SwapContract,"swap").withArgs(UsdcContract.address,USDCimpersonatedSigner.address,100000000)
            //     // console.log("swap hash ", swapHash.hash);
            // })
        })
        
    })
    describe("Withdraw eth", function () {
        describe("Validation", function(){
            it("should throw error when there is zero balace of user in contract", async function(){
                const { USDCimpersonatedSigner, UsdcContract, SwapContract } = await loadFixture(deployContractAndImpersonateAccount);

                await expect((await SwapContract).withdrawEth()).to.be.revertedWith('Insufficient balance to transfer')
            })
            it("should withdraw eth after performing swap", async function () {
                const { USDCimpersonatedSigner, UsdcContract, SwapContract } = await loadFixture(deployContractAndImpersonateAccount);
    
                // approving
                let approveHash = await UsdcContract.connect(USDCimpersonatedSigner).approve((await SwapContract).address, 100000000);
                console.log("approve hash", approveHash.hash);
    
                // swaping 
                let swapHash = await (await SwapContract).connect(USDCimpersonatedSigner).swapTokenForEth(UsdcContract.address, 100000000)
                console.log("swap hash ", swapHash.hash);
    
                let amountOfUserInContract2 = await (await SwapContract).userBalances(USDCimpersonatedSigner.address);
                let valueInNumber2 = ethers.utils.formatEther(amountOfUserInContract2)
                console.log("Balance of ETH of user in contract after swap ", valueInNumber2);
    
                let balanceOfSigner = await ethers.provider.getBalance(USDCimpersonatedSigner.address);
                const balance = ethers.utils.formatEther(balanceOfSigner);
                console.log("Balance of impersonate account before withdraw: ", balance);
    
                let withdraw = await (await SwapContract).connect(USDCimpersonatedSigner).withdrawEth();
    
                let balanceOfSigner2 = await ethers.provider.getBalance(USDCimpersonatedSigner.address);
                const balance2 = ethers.utils.formatEther(balanceOfSigner2);
                console.log("Balance of impersonate account after withdraw: ", balance2);
                expect(balance2).to.be.changeEtherBalance(USDCimpersonatedSigner.address)
            })
        })
        describe("Event",function(){

        })
    })
})