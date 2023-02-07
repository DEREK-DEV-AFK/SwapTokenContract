// SPDX-License-Identifier: UNLICENSED
pragma solidity >0.8.0; 

interface IUniswapRouterV2 {
    function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)
        external
        returns (uint[] memory amounts);
}

interface IERC20 {
    function allowance(address owner, address spender) external view returns (uint256);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract tradeForEth {
    // 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D
    address private immutable UNISWAP_V2_ROUTER;
    // 0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6
    address private immutable WETH;
    mapping(address => uint) public userBalances;

    constructor(address _UNISWAP_V2_ROUTER, address _WETH) {
        UNISWAP_V2_ROUTER = _UNISWAP_V2_ROUTER;
        WETH = _WETH;
    }

    function swapTokenForEth(address _token, uint _amount) public returns(bool){
        require(_token != address(0),"Invalid address");
        require(_amount > 0,"Invalid amount");
        require(IERC20(_token).allowance(msg.sender,address(this)) >= _amount,"Insufficient approve amount");

        // Transfering token from user to this contract
        bool transferSuccess = IERC20(_token).transferFrom(msg.sender,address(this),_amount);
        require(transferSuccess,"IERC20:Transfer From User To Contract failed");

        // Approving uniswap router 
        bool approveSuccess = IERC20(_token).approve(UNISWAP_V2_ROUTER,_amount);
        require(approveSuccess,"IERC20:Approve from contract to Uniswap failed");

        // 
        address[] memory path = new address[](2);
        path[0] = _token;
        path[1] = WETH;
        // Calling unswap to perform transaction
        uint[] memory Amounts = IUniswapRouterV2(UNISWAP_V2_ROUTER).swapExactTokensForETH(_amount,100,path,address(this),block.timestamp + 100);
        uint balanceOfEthofUser = Amounts[Amounts.length - 1];
        // storing in mapping
        userBalances[msg.sender] += balanceOfEthofUser;

        return true;
    }

    function CheckBalanceOfUser(address _token) external view returns(uint){
        return IERC20(_token).balanceOf(msg.sender);
    }

    receive() external payable {
        
    }
}

