// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockUSDC is ERC20, Ownable {
    
    constructor() ERC20("Mock USDC", "mUSDC") Ownable(msg.sender) {
        // Automatically mint 1,000,000 mUSDC to your deployer wallet 
        // to save you time. (1 million * 10^6 decimals)
        _mint(msg.sender, 1000000 * 10**6);
    }

    /**
     * @notice Overrides the standard 18 decimals to 6, exactly matching real USDC.
     * This is crucial for your coffee math to work properly!
     */
    function decimals() public view virtual override returns (uint8) {
        return 6;
    }

    /**
     * @notice A public faucet function so you can mint fake money to your 
     * Ganache testing wallets whenever you want.
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}