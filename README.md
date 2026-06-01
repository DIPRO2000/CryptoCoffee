# ☕ Crypto Coffee 

A fully decentralized, serverless Web3 eCommerce storefront that allows users to purchase coffee using cryptocurrency. The project features a Next.js frontend, a hyper-fast Cloudflare Workers serverless backend, and custom Solidity smart contracts on the Ethereum Sepolia Testnet for handling payments and loyalty rewards.

---

## 🏗️ System Architecture

This repository is built as a monorepo containing three distinct layers:

### 1. Frontend (`/frontend`)
* **Framework:** Next.js
* **Hosting:** Vercel
* **Web3 Integration:** Ethers.js / Wagmi (Wallet connection and contract interaction)
* **Features:** Reads coffee menus from the backend and processes on-chain transactions via MetaMask.

### 2. Backend (`/cafe-coffee-backend`)
* **Framework:** Cloudflare Workers (Serverless)
* **Storage:** Cloudflare KV / Upstash Redis
* **CI/CD:** Automated GitLab dual-push pipeline for seamless deployments.
* **Features:** A backend-less API architecture that securely serves menu items and handles off-chain logic without managing traditional servers.

### 3. Smart Contracts (`/blockchain`)
* **Framework:** Hardhat (with Hardhat Ignition)
* **Network:** Ethereum Sepolia Testnet
* **Features:** Handles secure multi-currency checkouts (ETH, USDC) and an ERC20-based customer loyalty rewards system.

---

## 📜 Deployed Contracts (Sepolia Testnet)

Both smart contracts are fully verified and interactive on Etherscan:

* **Crypto Coffee Token (CCT) - Loyalty ERC20:** [`0x279a71b485FCFCEB5421c8A573B21CC9eb0523dE`](https://sepolia.etherscan.io/address/0x279a71b485FCFCEB5421c8A573B21CC9eb0523dE#code)
* **Cafe Coffee Payment Engine:** [`0x491b302C0BEEAd5Dfa9E32aA1386ca41D3E75209`](https://sepolia.etherscan.io/address/0x491b302C0BEEAd5Dfa9E32aA1386ca41D3E75209#code)

---

## 🚀 Getting Started (Local Development)

### Prerequisites
* Node.js (v18+)
* MetaMask browser extension (configured to Sepolia Testnet)
* Sepolia Testnet ETH for gas fees

### 1. Smart Contract Setup
Navigate to the blockchain directory, install dependencies, and set up your local environment:
```bash
cd blockchain
npm install
```

# Local Development (Ganache Setup)
1. Launch Ganache GUI or run Ganache CLI in a separate terminal:
   ```bash
   ganache-cli -p 7545
   ```
2. Compile and deploy your contracts locally to your Ganache instance using Hardhat Ignition:
   ```bash
   npx hardhat ignition deploy ./ignition/modules/Deployer.ts --network ganache
   ``` 
# Public Testnet Deployment & Verification (Sepolia)
Create a .env file in the /blockchain directory:

```bash
SEPOLIA_RPC_URL="your_alchemy_or_infura_url"
SEPOLIA_PRIVATE_KEY="your_wallet_private_key"
ETHERSCAN_API_KEY="your_etherscan_key"
```
1. Run the Hardhat Ignition script targeting Sepolia:
   ```bash
   npx hardhat ignition deploy ./ignition/modules/Deployer.ts --network sepolia
   ```
2. Verify your smart contracts on Etherscan using the modern verification syntax (providing constructor strings if applicable):
   ```bash
   # Verify Loyalty Token
   npx hardhat verify --network sepolia 0x279a71b485FCFCEB5421c8A573B21CC9eb0523dE "Crypto Coffee Token" "CCT"

   # Verify Payment Engine (Passing USDC, WETH, and CCT addresses as constructor args)
   npx hardhat verify --network sepolia 0x491b302C0BEEAd5Dfa9E32aA1386ca41D3E75209 "0x694AA1769357215DE4FAC081bf1f309aDC325306" "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238" "0x279a71b485FCFCEB5421c8A573B21CC9eb0523dE"
   ```

### 2. Backend API Setup
Navigate to the backend directory and run the Cloudflare Worker locally:

```bash
cd cafe-coffee-backend
npm install
npx wrangler dev
```
**Production backend deployments are handled automatically via GitLab CI/CD upon merging to the main branch.**

# Production Variables & Deployment
Configure non-sensitive public environment paths directly within your local wrangler.toml file under the [vars] block. Sensitive variables (like Upstash Redis passwords or Database Connection Strings) are added safely through the Cloudflare Dashboard > Workers & Pages > Settings > Variables and Secrets setting as encrypted Secrets.

Production pushes are systematically deployed on code updates via the GitLab CI/CD runner execution.

### 3. Frontend Setup
Navigate to the frontend directory, configure your environment variables, and start the Next.js development server:

```bash
cd frontend
npm install
```

Create a .env file in the /frontend directory:

```bash
NEXT_PUBLIC_CAFE_TOKEN_ADDRESS=0x5601f212Bf7c05427c73aC13585F7b3dD14DE2de     
NEXT_PUBLIC_CAFE_PAYMENT_ADDRESS=0xC2397c34628D921dd560000090f92938135Ee6D1
NEXT_PUBLIC_USDC_ADDRESS=0x6a07246d11564b44764E5ff765121fD931371c28
NEXT_PUBLIC_MockV3Aggregator_ADDRESS=0x069c6727837B29fC38e013aFE6a796FC6729202F
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8787
NEXT_PUBLIC_NODE_ENV=development
```
**Using all the contracts over here as local contracts deployed locally in Ganache**

Start your Next.js development server:

```bash
npm run dev
```
Open http://localhost:3000 with your browser to experience the localized sandbox flow!

### 🛠️ Build & Vercel Deployment Notes
When linking this repository layout inside Vercel:
1. Ensure the Root Directory setting is explicitly set to frontend
2. Configure your Framework Preset field to explicitly use Next.js to guarantee the builder targets the hidden .next production output directory rather than a static fallback.
3. Import your environment variables into the Production and Preview scopes via Vercel's .env configuration dashboard before starting your build pipeline execution.

### 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.
Developed with ❤️ by Diprajit Chakraborty

