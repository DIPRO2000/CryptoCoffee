export const CAFE_TOKEN_ADDRESS = "INSERT_YOUR_CAFE_TOKEN_ADDRESS";
export const CAFE_PAYMENT_ADDRESS = "INSERT_YOUR_PAYMENT_CONTRACT_ADDRESS";
export const USDC_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";

export const SEPOLIA_CHAIN_ID = "0xaa36a7"; // 11155111

export const CAFE_PAYMENT_ABI = [
  "function buyWithETH(uint256 quantity) payable",
  "function buyWithUSDC(uint256 quantity)",
  "function redeem(uint256 tokenAmount)",
  "function withdrawETH()",
  "function withdrawUSDC()",
  "function owner() view returns (address)",
  "function coffeePrice() view returns (uint256)",
  "function coffeePriceUSDC() view returns (uint256)",
  "function tokensPerCoffee() view returns (uint256)"
];

export const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];