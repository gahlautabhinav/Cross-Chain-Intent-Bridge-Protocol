// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import "./WXLM.sol";

contract StakingSimple {
    WXLM public token;
    mapping(address => uint256) public stakes;
    constructor(address _token) { token = WXLM(_token); }

    function stake(uint256 amount) external {
        require(token.transferFrom(msg.sender, address(this), amount), "transfer failed");
        stakes[msg.sender] += amount;
    }
}
