import {network} from "hardhat";

const { ethers, networkName } = await network.create();

// For Local/Mock Contract
const Mockv3AggregatorAddress= "0x069c6727837B29fC38e013aFE6a796FC6729202F";
const USDCAddress= "0x6a07246d11564b44764E5ff765121fD931371c28";

// For Production Contract
// const Mockv3AggregatorAddress= "0x694AA1769357215DE4FAC081bf1f309aDC325306";
// const USDCAddress= "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";

console.log(`Starting deployment on network: ${networkName}`);
console.log("==========================================");

console.log("\n--- Deploying Contracts ---\n");

// STEP 1: Deploy Token
console.log("Deploying CafeLoyaltyToken Contract...");
const token = await ethers.deployContract("CafeLoyaltyToken",["Crypto Coffee Token","CCT"]);
await token.waitForDeployment();
const tokenAddress = await token.getAddress();
console.log(`Coffee Loyalty Token Contract address is:${tokenAddress}`);

// STEP 2: Deploy Staking
console.log("\nDeploying CafeCoffeePayment Contract...");
const contract = await ethers.deployContract("CafeCoffeePayment",[Mockv3AggregatorAddress,USDCAddress,tokenAddress]);
await contract.waitForDeployment();
const paymentAddress = await contract.getAddress();
console.log(`Coffee Payment Contract address is:${paymentAddress}`);

// STEP 3:HANDING OVER THE OWNERSHIP TO Payment contract
console.log("\n--- Linking Systems ---\n");
console.log("Transferring token ownership to Payment Contract...");
const transferTx = await token.transferOwnership(paymentAddress);
await transferTx.wait();

console.log("\n✅ Setup Complete! The Payment contract now controls the Token.");