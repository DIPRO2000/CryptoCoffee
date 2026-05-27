// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CafeLoyalityToken is ERC20, Ownable {

    constructor(string memory tokenName,string memory tokenSymbol) ERC20(tokenName,tokenSymbol) Ownable(msg.sender)
    {}

    function mint(address to,uint256 amount) external onlyOwner
    {
        _mint(to,amount);
    }

    function claimToken(address from,uint256 amount) external onlyOwner 
    {
        _burn(from,amount);
    }
}