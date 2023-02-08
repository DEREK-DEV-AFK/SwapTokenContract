# Swap Token Contract
- This contract uses uniswap router function in order to perform swap
- It also has been test with hardhat by mainnet forking

## About the contract
The contract functionality includes :
- Swaping any erc20 token for eth
- withdrawing eth from contract

Functions :
- `swapTokenForEth(address _token, uint _amount)` is the main function by which user can swap token for eth
- `withdrawEth()` is to withdraw it from contract

Events :
- `ethWithdraw(address indexed to, uint amount)` is emitted when user withdraw eth from contract
- `swap(address indexed token, address indexed user, uint amount)` is emitted when succesful swap occurs 

Modifier :
- `reentrancyGuard()` is to avoid reentrancy attack to the contract

## requirement in order to deploy contract
NOTE: Addresses may be diffrent depending upon network
- `Uniswap Router02` address
- `WETH` address

## Running of test cases
- Step 1: Install all the dependencies
    ```
    npm install
    ```
- Step 2: Adding api credentials in hardhat config file
    ```
    networks: {
        hardhat: {
            forking: {
                url: [-NEED-TO-CHANGE-], 👈
            }
        }
    }
    ```
- Step 3: Now you are good to go!
    - To start hardhat node
    ```
    npx hardhat node
    ```
    - To run test cases
    ```
    npx hardhat test
    ```