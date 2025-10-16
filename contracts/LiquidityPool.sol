// contracts/LiquidityPool.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract LiquidityPool {
    IERC20 public token;
    mapping(address => uint256) public liquidity;
    constructor(address _token) { token = IERC20(_token); }
    function addLiquidity(uint256 amount) external {
        require(token.transferFrom(msg.sender, address(this), amount), "transfer failed");
        liquidity[msg.sender] += amount;
    }
    function poolBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }
}
