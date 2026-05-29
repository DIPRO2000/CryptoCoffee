import cafePaymentArtifact from "@/components/web3/artifacts/contracts/CafeCoffeePayment.sol/CafeCoffeePayment.json";
export const CAFE_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_CAFE_TOKEN_ADDRESS as string;
export const CAFE_PAYMENT_ADDRESS = process.env.NEXT_PUBLIC_CAFE_PAYMENT_ADDRESS as string;
export const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS as string;

export const SEPOLIA_CHAIN_ID = "0xaa36a7"; // 11155111

export const CAFE_PAYMENT_ABI = cafePaymentArtifact.abi;

export const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];