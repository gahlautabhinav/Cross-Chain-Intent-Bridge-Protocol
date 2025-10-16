// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract WXLM is ERC20 {
    constructor() ERC20("Wrapped XLM", "WXLM") {}
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
