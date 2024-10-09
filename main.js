import { createAppKit } from '@reown/appkit';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { mainnet, arbitrum } from '@reown/appkit/networks';
import { ethers } from 'ethers';
import {mrTokenABI} from "./mrTokenABI.js";
import {marketplaceAbi} from "./ERC1155ABI.js";
import {payableMRTokenABI} from "./PayableMRTokenABI.js";
// 1. Get projectId from https://cloud.reown.com
const projectId = '25ac6e9677a0bdb5ae59248bbd5902aa';


const metadata = {
    name: 'AppKit',
    description: 'AppKit Example',
    url: 'https://reown.com/appkit', // origin must match your domain & subdomain
    icons: ['https://avatars.githubusercontent.com/u/179229932']
};

const polygonAmoyTestnet = {
    id: 'eip155:80002',  // Matching the format used for Polygon Mainnet
    chainId: 80002,
    name: 'Polygon Amoy Testnet',
    currency: 'MATIC',  // Mapping the 'nativeCurrency' to 'currency' like in the first object
    explorerUrl: 'https://www.oklink.com/amoy',  // Using the Oklink explorer URL
    rpcUrl: 'https://rpc-amoy.polygon.technology',  // Using the provided RPC URL
    chainNamespace: 'eip155',  // Keeping the same namespace as for Polygon
    testnet: true  // Keeping the testnet flag
};

// 3. Create a AppKit instance
const modal = createAppKit({
    adapters: [new EthersAdapter()],
    networks: [polygonAmoyTestnet],
    metadata,
    projectId,
    features: {
        analytics: true // Optional - defaults to your Cloud configuration
    },
    allowUnsupportedChain: true,
});
let provider, tokenContract;
// const mrTokenAddress = '0xdaBD71a708a26Eb7a50f27765d6d30A4038c5EA8';  // Replace with your contract address
// const mrTokenAddress = '0x14eaf364D2aB3cd043Ba1CAeD2ACb0Eb459f475E'; // payable with ethers
const mrTokenAddress = '0x9c6d990bB80d0c45DB714FB4Ba5Bf0BAdb531bAD';
// const abi = mrTokenABI;
const abi = payableMRTokenABI;

const ERC1155ABI = marketplaceAbi;
// const ERC1155Address = "0x694cEDFFaf41E8a6e3590e6C1c2D47e762f97ab3";
const ERC1155Address = "0x7DF5D6fbF15c71E3C96b8C40495bc3b6B99A4bce"

async function getBalance(account) {
    try {
        const balance = await tokenContract.balanceOf(account);
        console.log('User balance:', ethers.formatUnits(balance, 18));  // Assuming the token has 18 decimals
    } catch (error) {
        console.error('Error fetching balance:', error);
    }
}

async function requestTokens(account, numberOfTokens) {
    try {
        // Initialize contract instance
        const tokenContract = new ethers.Contract(mrTokenAddress, abi, provider);

        // Ensure signer is available from provider
        const signer = await provider.getSigner();
        console.log("Signer", signer);

        // Connect contract to the signer
        const tokenWithSigner = tokenContract.connect(signer);

        // Get the current price of the token (in Wei)
        const tokenPrice = await tokenWithSigner.getTokenPrice();
        console.log("Current token price (Wei):", tokenPrice.toString());

        // Convert numberOfTokens to BigNumber (with 18 decimals)
        const amountInTokens = ethers.toBigInt(ethers.parseUnits(numberOfTokens.toString(), 18));
        console.log("Amount in Tokens:", amountInTokens.toString());

        // Convert tokenPrice to BigInt and calculate the required payment in Wei
        const requiredPayment = tokenPrice * BigInt(numberOfTokens);
        console.log("Required payment (Wei):", requiredPayment.toString());

        // Mint the tokens by sending the required amount of Ether
        const tx = await tokenWithSigner.mint(account, amountInTokens, {
            value: requiredPayment.toString()  // Send the calculated Ether amount
        });
        console.log('Minting transaction sent:', tx.hash);

        // Wait for transaction confirmation
        await tx.wait();
        console.log('Transaction confirmed:', tx.hash);
    } catch (error) {
        console.error('Error during token request:', error);
    }
}



// Function to handle user connection and capture address
async function connectUser() {
    try {
        // Open the wallet connection modal
        await modal.open();
    } catch (error) {
        console.error('Failed to connect user:', error);
    }
}




// Call the connectUser function on button click or other event
document.querySelector('w3m-button').addEventListener('click', connectUser);

// const getNFTsButton = document.getElementById("get-NFTs");

// const showAccountButton = document.getElementById("show-Account")
// showAccountButton.addEventListener('click', showAccount);

const getTokenButton = document.getElementById("get-MR-Tokens");
getTokenButton.addEventListener('click', getTokens);

const getMyNFTs = document.getElementById("get-my-nfts");
getMyNFTs.addEventListener("click", getYourNFTs);

const getAllNFTs =document.getElementById("get-NFTs")
getAllNFTs.addEventListener('click', getAvailableNFTs);


async function showAccount() {
    try {
        console.log('Showing account...');
        await modal.open({ view: 'Account' });

        const address = modal.getAddress();
        const walletProvider = await modal.getWalletProvider();
        provider = new ethers.BrowserProvider(walletProvider);  // ethers v6.x

        // Initialize contract
        tokenContract = new ethers.Contract(mrTokenAddress, abi, provider);

        await getBalance(address);
        console.log('User address:', address);

        const chainId = await modal.getChainId();
        console.log("Chain ID:", chainId);
    } catch (error) {
        console.error('Error showing account:', error);
    }
}



async function getYourNFTs() {
    const walletProvider = await modal.getWalletProvider();
    provider = new ethers.BrowserProvider(walletProvider);  // ethers v6.x
    const signer = await provider.getSigner();
    console.log("Signer", signer);
    await getNFTImages(signer)
}


async function getTokens() {
    try {
        const address = await modal.getAddress();
        if (address) {
            console.log('Requesting 1 MR Tokens for address:', address);

            // Ensure the walletProvider is available
            const walletProvider = await modal.getWalletProvider();
            provider = new ethers.BrowserProvider(walletProvider);  // ethers v6.x
            const signer = await provider.getSigner();
            console.log("Signer", signer);

            // Interact with the contract using the provider and mint tokens
            await requestTokens(address, 2);
        } else {
            console.error('No wallet address found. Please connect your wallet.');
        }
    } catch (error) {
        console.error('Error getting tokens:', error);
    }
}

async function getNFTImages(signer) {
    const ERC1155Contract = new ethers.Contract(ERC1155Address, ERC1155ABI, signer);
    const walletAddress = await signer.getAddress();
    const tokenIds = [1, 2, 3, 4, 5, 6, 7]; // List of token IDs to check

    // Loop through each token ID
    for (const tokenId of tokenIds) {
        const balance = await ERC1155Contract.balanceOf(walletAddress, tokenId);

        if (balance > 0) {
            const metadataURI = await ERC1155Contract.uri(tokenId); // Fetch metadata URI
            console.log(`Token ID ${tokenId} Metadata URI: ${metadataURI}`);
            const metadataUrl = convertIPFSToHTTP(metadataURI);

            // Fetch metadata (e.g., from IPFS)
            const metadataResponse = await fetch(metadataUrl);
            const metadata = await metadataResponse.json();

            const imageURL = convertIPFSToHTTP(metadata.image);
            const imageElement = document.getElementById("ipfs-image");

            // Create a new image element for each NFT
            const nftImageElement = document.createElement("img");
            nftImageElement.src = imageURL;
            nftImageElement.alt = `NFT Image for Token ID ${tokenId}`;
            nftImageElement.style.width = "100px"; // Adjust size as needed
            nftImageElement.style.height = "100px"; // Adjust size as needed

            // Create a count display
            const countElement = document.createElement("div");
            countElement.textContent = `Token ID ${tokenId} Count: ${balance.toString()}`;

            // Append the count and image to a container
            const container = document.getElementById("nft-container");
            container.appendChild(countElement);
            container.appendChild(nftImageElement);
        }
    }
}



async function getAvailableNFTs() {
    const walletProvider = await modal.getWalletProvider();
    provider = new ethers.BrowserProvider(walletProvider);  // ethers v6.x
    const signer = await provider.getSigner();
    console.log("Signer", signer);
    const ERC1155Contract = new ethers.Contract(ERC1155Address, ERC1155ABI, signer);
    const tokenIds = [1, 2, 3, 4, 5, 6, 7]; // List of token IDs to display

    // Loop through each token ID
    for (const tokenId of tokenIds) {
        try {
            // Fetch metadata URI using the contract's uri function
            const metadataURI = await ERC1155Contract.uri(tokenId);
            console.log(`Token ID ${tokenId} Metadata URI: ${metadataURI}`);
            const metadataUrl = convertIPFSToHTTP(metadataURI);

            // Fetch metadata (e.g., from IPFS)
            const metadataResponse = await fetch(metadataUrl);
            const metadata = await metadataResponse.json();

            const imageURL = convertIPFSToHTTP(metadata.image);

            // Create a new image element for each NFT
            const nftImageElement = document.createElement("img");
            nftImageElement.src = imageURL;
            nftImageElement.alt = `NFT Image for Token ID ${tokenId}`;
            nftImageElement.style.width = "100px"; // Adjust size as needed
            nftImageElement.style.height = "100px"; // Adjust size as needed

            // Create a title element for the NFT
            const titleElement = document.createElement("div");
            titleElement.textContent = `Token ID ${tokenId} - ${metadata.name || 'Unknown Name'}`;

            // Create a description element for the NFT
            const descriptionElement = document.createElement("div");
            descriptionElement.textContent = metadata.description || 'No description available';

            // Create a buy button for each NFT
            const buyButton = document.createElement("button");
            buyButton.textContent = `Buy Token ID ${tokenId}`;
            buyButton.onclick = async () => {
                const amount = 1; // Number of NFTs to buy (adjust as needed)
                const costInMR = ethers.parseUnits('1', 18); // Adjust cost in MR tokens
                await buyNFT(signer, tokenId, amount, costInMR);
            };

            // Append the title, image, description, and buy button to a container
            const container = document.getElementById("nft-container");
            container.appendChild(titleElement);
            container.appendChild(nftImageElement);
            container.appendChild(descriptionElement);
            container.appendChild(buyButton);

        } catch (error) {
            console.error(`Error fetching data for Token ID ${tokenId}:`, error);
        }
    }
}

async function buyNFT(signer, tokenId, amount, costInMR) {
    const ERC1155Contract = new ethers.Contract(ERC1155Address, ERC1155ABI, signer);
    const NFTwithSigner = ERC1155Contract.connect(signer);
    try {
        // Get the buyer's address
        const buyerAddress = await signer.getAddress();

        // Approve the contract to spend MR tokens if necessary
        const mrTokenContract = new ethers.Contract(mrTokenAddress, abi, signer);
        const mrTokenwithSigner = mrTokenContract.connect(signer);
        const allowance = await mrTokenwithSigner.allowance(buyerAddress, ERC1155Address);


        console.log("allowance", typeof allowance)
        console.log("Cost", typeof costInMR);

        if (allowance <= costInMR) {
            console.log("Allowance low, approving...")
            const txData = await mrTokenwithSigner.approve(ERC1155Address, costInMR).populateTransaction;

            // Estimate gas using the populated transaction
            const estimatedGas = await signer.provider.estimateGas({
                ...txData,
                from: buyerAddress, // Specify the sender explicitly
            });


            const approveTx = await mrTokenwithSigner.approve(ERC1155Address, costInMR, {gasLimit: estimatedGas});
            await approveTx.wait();  // Wait for the transaction to be mined
        }
            console.log(buyerAddress, tokenId, amount, costInMR.toString())
            // Populate the transaction
            const txData = await NFTwithSigner.BuyNFTs(buyerAddress, tokenId, amount, costInMR);
            await txData.wait();

            console.log(`NFT bought! Transaction Hash: ${txData.hash}`);
    } catch (error) {
        console.error(`Error buying NFT Token ID ${tokenId}:`, error);
    }
}

function convertIPFSToHTTP(ipfsUrl) {
    return ipfsUrl.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
}
