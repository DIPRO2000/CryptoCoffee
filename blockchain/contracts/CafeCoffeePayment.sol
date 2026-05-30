// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

interface ICoffeeLoyaltyToken {
    function mint(address to, uint256 amount) external;
    function claimToken(address from,uint256 amount) external;
    function balanceOf(address account) external view returns (uint256);
}

contract CafeCoffeePayment is Ownable {
    
    AggregatorV3Interface internal priceFeed;
    IERC20 public usdcToken;
    ICoffeeLoyaltyToken public loyaltyToken;

    event CoffeePurchasedWithETH(address indexed buyer, uint256 amountETH, uint256 loyaltyEarned);
    event CoffeePurchasedWithUSDC(address indexed buyer, uint256 amountUSDC, uint256 loyaltyEarned);
    event CoffeePurchasedWithToken(address indexed buyer, uint256 tokenBurned);

    constructor(
        address _priceFeedAddress,   // Chainlink ETH/USD feed address
        address _usdcAddress,        // Native/Mock USDC Token contract address
        address _loyaltyTokenAddress // CafeLoyaltyToken contract address
    ) Ownable(msg.sender) {
        priceFeed = AggregatorV3Interface(_priceFeedAddress);
        usdcToken = IERC20(_usdcAddress);
        loyaltyToken = ICoffeeLoyaltyToken(_loyaltyTokenAddress);
    }

    // Fetches the latest live ETH price from the Chainlink Oracle (scaled to 8 decimals)
    function getLatestETHPrice() public view returns (int256) {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        return price;
    }


    // Dynamically calculates how much native Wei is required based on the target USD amount
    function getCoffeeCostInETH(uint coffeePriceInUSD) public view returns (uint256) {
        int256 ethPriceInUSD = getLatestETHPrice(); 
        require(ethPriceInUSD > 0, "Invalid oracle price");
        
        // Formulated to handle decimal alignment cleanly between USD (2) and Wei (18)
        uint256 ethNeeded = (coffeePriceInUSD * 10**24) / uint256(ethPriceInUSD);
        return ethNeeded;
    }


    // Allows customers to purchase using ETH
    function buyCoffeeWithETH(uint coffeePriceInUSD, uint tokenGifted) external payable {
        uint256 requiredETH = getCoffeeCostInETH(coffeePriceInUSD);
        require(msg.value >= requiredETH, "Insufficient ETH sent");

        // Refund any excess native gas currency sent by the wallet
        if (msg.value > requiredETH) {
            payable(msg.sender).transfer(msg.value - requiredETH);
        }

        // Mints 10 standard 18-decimal loyalty units to the buyer
        if(tokenGifted > 0 )
        {
            loyaltyToken.mint(msg.sender, tokenGifted * 10**18);
        }

        emit CoffeePurchasedWithETH(msg.sender, requiredETH, tokenGifted * 10**18);
    }


    // Allows customers to purchase using standard USDC stablecoin
    function buyCoffeeWithUSDC(uint coffeePriceInUSD, uint tokenGifted) external {
        // USDC uses 6 decimals. 400 * 10^4 handles $4.00 correctly
        uint256 usdcAmount = coffeePriceInUSD * 10**4; 

        bool success = usdcToken.transferFrom(msg.sender, address(this), usdcAmount);
        require(success, "USDC transfer failed");

        if(tokenGifted > 0)
        {
            loyaltyToken.mint(msg.sender, tokenGifted * 10**18);
        }

        emit CoffeePurchasedWithUSDC(msg.sender, usdcAmount, tokenGifted * 10**18);
    }


    // Allows admin to adjust the global USD price structure
    function buyCoffeeWithTokens(uint256 amount) external {
        uint256 requiredToken = amount * 10**18;
        uint256 customerToken = loyaltyToken.balanceOf(msg.sender);

        require(customerToken >= requiredToken, "Insufficient Tokens");

        loyaltyToken.claimToken(msg.sender,requiredToken);

        emit CoffeePurchasedWithToken(msg.sender, requiredToken);
    }


    // Emergency/Operational withdrawal function for collected retail revenue
    function withdrawFundsETH() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");

        (bool success, ) = owner().call{value: balance}("");
        require(success, "ETH Transfer Failed");
    }

    function withdrawFundsUSDC() external onlyOwner {
        uint256 usdcBalance = usdcToken.balanceOf(address(this));
        require(usdcBalance > 0, "No USDC to withdraw");

        bool success = usdcToken.transfer(owner(), usdcBalance);
        require(success, "USDC Transfer Failed");
    }
}