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

Create a .env file in the /blockchain directory:

SEPOLIA_RPC_URL="your_alchemy_or_infura_url"
SEPOLIA_PRIVATE_KEY="your_wallet_private_key"
ETHERSCAN_API_KEY="your_etherscan_key"

