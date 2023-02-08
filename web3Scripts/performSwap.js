const Web3 = require("web3");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const { BigNumber } = require("@ethersproject/bignumber");
require('dotenv').config();


const swapContractABI = require("./abi/swapContractAbi.json");
const usdcABI = require("./abi/usdcAbi.json");
const wethABI = require("./abi/wethAbi.json");
const erc20ABI = require("./abi/erc20.json");
const uniswapRouterABI = require('./abi/uniswapRouter02.json')

// const provider = new Web3.providers.HttpProvider(`https://eth-goerli.alchemyapi.io/v2/${process.env.ALCHEMYKEYGOERLI}`);

const localKeyProvider = new HDWalletProvider({
    privateKeys: [process.env.GOERLI_PRIVATE_KEY],
    providerOrUrl: `https://eth-goerli.alchemyapi.io/v2/${process.env.ALCHEMYKEYGOERLI}`,
  });

const web3 = new Web3(localKeyProvider);

const myAccount = web3.eth.accounts.privateKeyToAccount(process.env.GOERLI_PRIVATE_KEY);
console.log("My account ",myAccount.address)

const WETH_ADDRESS = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6'
const UNISWAP_ROUTER_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
const USDC_ADDRESS = '0x07865c6E87B9F70255377e024ace6630C1Eaa37F'
const GLD_TOKEN_ADDRESS = '0xd8E3f15A14164CCcc70efc24570b0Cd0b256cDe7'
const SWAPETH_ADDRESS = '0x6915339C327985786120A6e34BEa012Cc0fC67D1'

////////////////
const SwapContract = new web3.eth.Contract(swapContractABI,SWAPETH_ADDRESS)
const GLDtokenContract = new web3.eth.Contract(erc20ABI,GLD_TOKEN_ADDRESS)
const UniswapRouter = new web3.eth.Contract(uniswapRouterABI, UNISWAP_ROUTER_ADDRESS)


// async function approveContract(){
    
//     let address = await SwapContract.methods.WETH().call()

//     console.log("address", address)

//     let totalSupply = await GLDtokenContract.methods.totalSupply().call()
//     console.log("Total supply of token is ",totalSupply )

//     let uniswap = await UniswapRouter.methods.WETH().call();
//     console.log("Address of weth ",uniswap)
// }

/**
 * 
 * @param {Bignumber} amountToApprove 
 * @param {string} addressOfContract 
 * @returns Boolean is approve transaction succeded or not
 */
async function approveRouter(amountToApprove,addressOfContract){
    try {
        let approveTx = await GLDtokenContract.methods.approve(addressOfContract,amountToApprove).send({from: myAccount.address});
        console.log("hash of approve transaction ",approveTx.transactionHash)
        return true
    } catch(error){
        console.log("approve try ",error)
        return false
    }
   
}

/**
 *
 * @param {number} ethAmount 
 * @param {string} tokenAddress 
 * @param {number} desiredTokenAmount 
 * @param {number} minimumTokenAmount 
 * @param {string} to 
 * @param {number} deadline 
 */
async function addLiquidityETHOrCreateNewPool(ethAmount,tokenAddress,desiredTokenAmount,minimumTokenAmount,minimumETHAmount,to){
    let DesireAmount = BigNumber.from(desiredTokenAmount).mul(BigNumber.from(10).pow(18))
    let MinimumAmount = BigNumber.from(minimumTokenAmount).mul(BigNumber.from(10).pow(15))
    let MinimumAmountETH = BigNumber.from(minimumETHAmount).mul(BigNumber.from(10).pow(16))
    let ethToSend = BigNumber.from(ethAmount).mul(BigNumber.from(10).pow(18))
    let blockNumber = await web3.eth.getBlockNumber()
    console.log("Block number ", blockNumber)
    let { timestamp } = await web3.eth.getBlock(blockNumber)
    console.log("Time stamp ", timestamp)

    let success = await approveRouter(DesireAmount,UNISWAP_ROUTER_ADDRESS);
    console.log("result of approve ",success)
    if(success){
        try{
            let addLiquidtyTx = await UniswapRouter.methods.addLiquidityETH(tokenAddress,DesireAmount,MinimumAmount,MinimumAmountETH,to,timestamp + 100).send({from: myAccount.address, value: ethToSend});
            console.log("hash of add liquidity ",addLiquidtyTx.transactionHash);
            return true
        } catch(error){
            console.log("try ",error)
            return false
        }
    }
}

/**
 * 
 * @param {number} amountIn 
 * @param {number} decimal 
 * @param {array} path 
 * @returns 
 */
async function getAmountOut(amountIn,decimal,path){
    let amountInConverted = BigNumber.from(amountIn).mul(BigNumber.from(10).pow(decimal));

    try{
        let getAmountOutTx = await UniswapRouter.methods.getAmountsOut(amountInConverted,path).call();
        console.log("result ", getAmountOutTx)
        let numberOut = Number(getAmountOutTx[1]) 
        console.log(numberOut)
        console.log("amount out ", numberOut/1000000000000000000)
        return true
    } catch(error){
        return false
    }
}

/**
 * 
 * @param {string} tokenAddress 
 * @param {number} amount 
 * @param {number} decimals 
 * @returns boolean if transaction succeded or not
 */
async function performSwap(tokenAddress, amount, decimals){
    let amountToSend = BigNumber.from(amount).mul(BigNumber.from(10).pow(decimals));
    try {

        let hasApproved = approveRouter(amountToSend,SWAPETH_ADDRESS);
        if(hasApproved){
            let balanceOfUser = await web3.eth.getBalance(myAccount.address)
            console.log("Before balance of ETH in ",myAccount.address," is ",balanceOfUser)
    
            let BalanceOfToken = await GLDtokenContract.methods.balanceOf(myAccount.address).call();
            console.log("Before balance of token of ",myAccount.address," is ",BalanceOfToken)
    
            let swapTx = await SwapContract.methods.swapTokenForEth(tokenAddress,amountToSend).send({from: myAccount.address})
            console.log("swap tx hash ",swapTx.transactionHash);
    
            let balanceOfUser2 = await web3.eth.getBalance(myAccount.address)
            console.log("After balance of ETH in ",myAccount.address," is ",balanceOfUser2)
    
            let BalanceOfToken2 = await GLDtokenContract.methods.balanceOf(myAccount.address).call();
            console.log("After balance of token of ",myAccount.address," is ",BalanceOfToken2)

            let balanceOfUserInContractEth = await SwapContract.methods.userBalances(myAccount.address).call()
            console.log("ETH Amount in contract of ",myAccount.address," is ",balanceOfUserInContractEth)
            return true
        }

        return false
    } catch(error){
        console.log("Swap contrcat error ",error)
        return false
    }
}


//////////////////////////-function calling -/////////////////////////////////////

// getAmountOut(1,18,[GLD_TOKEN_ADDRESS,WETH_ADDRESS])
// performSwap(GLD_TOKEN_ADDRESS,1,18)

// addLiquidityETHOrCreateNewPool(1,GLD_TOKEN_ADDRESS,100,1,1,myAccount.address)
