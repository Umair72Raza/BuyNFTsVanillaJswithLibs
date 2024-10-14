
# MR Token and NFT Marketplace

This project is a decentralized application (dApp) built with Vanilla JavaScript, interacting with two smart contracts:
- **ERC-20** for the MR Token, which can be bought with Ether.
- **ERC-1155** for an NFT collection, where each NFT can be bought using MR Tokens.

## Project Setup

1. **Clone the Repository**:  
   Use the following link to clone or download the project from GitHub:
   ```bash
   git clone https://github.com/Umair72Raza/BuyNFTsVanillaJswithLibs.git
   ```

2. **Install Dependencies**:  
   Navigate to the project directory and install the necessary dependencies:
   ```bash
   npm install
   ```

## Usage Instructions

### MR Token (ERC-20)
- The contract allows users to mint MR Tokens by paying 1 Ether for each token.
- After minting, the MR Tokens can be used to purchase NFTs from the ERC-1155 contract.

### NFT Marketplace (ERC-1155)
- The marketplace offers 7 unique NFTs.
- You can purchase one NFT at a time using 1 MR Token per NFT.

### Key Smart Contract Functions:
1. **Minting MR Tokens (ERC-20)**:  
   Users can mint MR Tokens by calling the mint function and sending 1 Ether per token.

2. **Buying NFTs (ERC-1155)**:  
   The `buyNFTs` function allows you to purchase 1 NFT at a time, consuming 1 MR Token for each NFT.

## Contract Addresses and ABIs

- The ABI files for interacting with the contracts can be found in:
  - **ERC1155ABI.js**: ABI for the ERC-1155 NFT contract.
  - **PayableMRTokenABI.js**: ABI for the ERC-20 MR Token contract.

## Tech Stack

This project utilizes the following libraries and dependencies:

```json
"dependencies": {
  "@reown/appkit": "^1.0.7",
  "@reown/appkit-adapter-ethers": "^1.0.7",
  "ethers": "^6.13.3",
  "viem": "^2.21.19",
  "web3": "^4.13.0"
}
```

## How to Interact

1. Make sure to have a web3 wallet (like MetaMask) installed.
2. Connect your wallet to the application.
3. Mint MR Tokens by sending Ether through the interface.
4. Use your MR Tokens to purchase NFTs from the collection.

## License

The contracts are deployed on Polygon Amoy Testnet and are protected under MIT license. This code of this repo cannot be used for sale and other terms like that. 
The code is free to use in order for updating/error resolving and other features like that. 
