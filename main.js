import { createAppKit } from '@reown/appkit';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import {mainnet, arbitrum, sepolia} from '@reown/appkit/networks';
import { ethers } from 'ethers';
// import {mrTokenABI} from "./mrTokenABI.js";
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
    networks: [ polygonAmoyTestnet],
    metadata,
    projectId,
    allowUnsupportedChain: true,
    features: {
        email: false, // default to true
        socials: [],
        emailShowWallets: true, // default to true
    },
});

document.getElementById("check").addEventListener("click", async()=>{
    const walletProvider = await modal.getWalletProvider();
    console.log(walletProvider);
    provider = new ethers.BrowserProvider(walletProvider);  // ethers v6.x
    const signer = await provider.getSigner();
    console.log(signer);
    console.log(modal.getChainId())
    console.log(modal.getAddress())

})

const event = modal.getEvent()
console.log(event)

let provider, tokenContract;
// const mrTokenAddress = '0xdaBD71a708a26Eb7a50f27765d6d30A4038c5EA8';  // Replace with your contract address
// const mrTokenAddress = '0x14eaf364D2aB3cd043Ba1CAeD2ACb0Eb459f475E'; // payable with ethers

// const mrTokenAddress = '0x9c6d990bB80d0c45DB714FB4Ba5Bf0BAdb531bAD';
const mrTokenAddress = "0x237A87B2c6e55cC0FAB2ec411016f23F1B50D7d3";


// const abi = mrTokenABI;
const abi = payableMRTokenABI;

const ERC1155ABI = marketplaceAbi;
// const ERC1155Address = "0x694cEDFFaf41E8a6e3590e6C1c2D47e762f97ab3";

// const ERC1155Address = "0x7DF5D6fbF15c71E3C96b8C40495bc3b6B99A4bce"
const ERC1155Address = "0xe684659184584a1E46b054BdF7C6bAB543f558Bf"



const showAccountButton = document.getElementById("show-Account")
showAccountButton.addEventListener('click',
    // checkAccount
    checker
);

const getTokenButton = document.getElementById("get-MR-Tokens");
getTokenButton.addEventListener('click', getTokens);

const getMyNFTs = document.getElementById("get-my-nfts");
getMyNFTs.addEventListener("click", getYourNFTs);
const getAllNFTs =document.getElementById("get-NFTs")
getAllNFTs.addEventListener('click', getAvailableNFTs);

const w3mButtonInstance = document.getElementById("w3mbutton");
const checkbutton = document.getElementById("checkbutton");

checkbutton.addEventListener("click", async function (){
    await modal.open();
})




// Function to handle user connection and capture address
async function connectUser() {
    try {
        // await modal.switchNetwork(sepolia)
        console.log("Running connect")
        const walletProvider = await modal.getWalletProvider();
        provider = new ethers.BrowserProvider(walletProvider);  // ethers v6.x
        const signer = await provider.getSigner();
        console.log("Connected", signer);
        // Open the wallet connection modal
        // await modal.open();

    } catch (error) {
        console.error('Failed to connect user:', error);
    }
}

async function checkAccount() {
    try {
        console.log('Showing account...');
        await modal.open({ view: 'Account' });

        const address = modal.getAddress();
        console.log("got ADRESS ", address)
        const walletProvider = await modal.getWalletProvider();
        provider = new ethers.BrowserProvider(walletProvider);  // ethers v6.x
        console.log("Accounts", provider.getAccounts());
        const signer = await provider.getSigner();

        // Initialize contract
        tokenContract = await new ethers.Contract(mrTokenAddress, abi, provider);

        await getBalance(address);
        console.log('User address:', address);

    } catch (error) {
        console.error('Error showing account:', error);
    }
}


async function getBalance(account) {
    try {
        const balance = await tokenContract.balanceOf(account);
        console.log("User balance", balance.toString());
        console.log('User balance:', ethers.formatUnits(balance, 18));  // Assuming the token has 18 decimals
    } catch (error) {
        console.error('Error fetching balance:', error);
    }
}


async function checker(){
    const walletProvider = await modal.getWalletProvider();
    provider = new ethers.BrowserProvider(walletProvider);  // ethers v6.x
    const signer = await provider.getSigner();
    console.log(modal.getAddress(), modal.getChainId())
    console.log("Signer", signer);
    const address= modal.getAddress();
    const chainId = modal.getChainId();
    const {open, selectedNetworkId } = modal.getState()
    console.log(open, selectedNetworkId);
    return {provider, address, chainId, signer}
}



async function getYourNFTs() {
        const {address, chainId, signer} = await checker()
        if(address !== undefined && chainId === 80002) {
            const network = await signer.provider.getNetwork();
            console.log("network", network.chainId)
            if (network.chainId != 80002) {
                let confirmation = confirm(`Please disconnect and make sure to use Polygon Amoy Testnet while logging in. 
\nIf you haven't added the Polygon Testnet in your wallet app, click 'OK' to visit the setup guide.`);
                if (confirmation) {
                    window.open('https://support.polygon.technology/support/solutions/articles/82000907114-how-to-add-amoy-network-in-your-wallet-', '_blank');
                }
                return
            }
            await getNFTImages(signer)
        } else if(chainId !== 80002) {
            alert("Please add the Polygon amoy Testnet");
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


async function getTokens() {
    try {
        const {address, signer} = await checker()
        const network = await signer.provider.getNetwork();
        console.log("network", network.chainId)
        if (network.chainId != 80002) {
            let confirmation = confirm(`Please disconnect and make sure to use Polygon Amoy Testnet while logging in. 
\nIf you haven't added the Polygon Testnet in your wallet app, click 'OK' to visit the setup guide.`);
            if (confirmation) {
                window.open('https://support.polygon.technology/support/solutions/articles/82000907114-how-to-add-amoy-network-in-your-wallet-', '_blank');
            }
            return;
        }
        await requestTokens(address, 1, signer);
    } catch (error) {
        console.error('Error getting tokens:', error);
    }
}


async function requestTokens(account, numberOfTokens, signer) {
    try {
        // Initialize contract instance
        const tokenContract = new ethers.Contract(mrTokenAddress, abi, provider);

        // Ensure signer is available from provider
        // const signer = await provider.getSigner();
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
        alert('Transaction confirmed!')
    } catch (error) {
        if (error.code === 4001) {
            // Error code 4001 indicates user rejected the transaction in their wallet (e.g., MetaMask)
            console.error('Transaction rejected by user:', error);
            alert('Transaction was rejected by the user.');
        } else if (error.message.includes('user disconnected')) {
            // Handle user disconnection case (frontend-specific event listener should handle this)
            console.error('User got disconnected from the dApp:', error);
            alert('You were disconnected from the dApp before the transaction could complete.');
        } else if (error.message.includes('insufficient funds')) {
            console.error('Insufficient funds', error);
            alert('You do not have enough funds to buy')
        }
        else {
            // Handle generic errors
            console.error('Error during token request:', error);
            alert('An error occurred during the transaction. Please try again.');
        }

    }
}


async function getAvailableNFTs() {
    const {signer } = await checker()
    const ERC1155Contract = new ethers.Contract(ERC1155Address, ERC1155ABI, signer);
    const network = await signer.provider.getNetwork();
    console.log("network", network.chainId)
    if (network.chainId != 80002)
    {
        let confirmation = confirm(`Please disconnect and make sure to use Polygon Amoy Testnet while logging in. 
\nIf you haven't added the Polygon Testnet in your wallet app, click 'OK' to visit the setup guide.`);
        if (confirmation) {
            window.open('https://support.polygon.technology/support/solutions/articles/82000907114-how-to-add-amoy-network-in-your-wallet-', '_blank');
        }
        
        return;
    }
    const tokenIds = [1, 2, 3, 4, 5, 6, 7]; // List of token IDs to display
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
        console.log("buyerAddress", buyerAddress)

        // Approve the contract to spend MR tokens if necessary
        const mrTokenContract = new ethers.Contract(mrTokenAddress, abi, signer);
        const mrTokenwithSigner = mrTokenContract.connect(signer);
        const allowance = await mrTokenwithSigner.allowance(buyerAddress, ERC1155Address);

        console.log("Allowance:", allowance.toString());
        console.log("Cost in MR:", costInMR.toString());

        if (allowance < costInMR) {
            console.log("Allowance low, approving more MR tokens...");

            try {
                // Estimate gas for the approval transaction
                const approveTx = await mrTokenwithSigner.approve(ERC1155Address, costInMR);
                // const estimatedGas = await approveTx.estimateGas();
                // const approveTxFinal = await mrTokenwithSigner.approve(ERC1155Address, costInMR, {
                //     gasLimit: estimatedGas
                // });
                // await approveTxFinal.wait();  // Wait for the approval transaction to be confirmed
                await approveTx.wait();
                console.log('Approval successful!');
            } catch (error) {
                if (error.code === 'INSUFFICIENT_FUNDS') {
                    console.error('Insufficient MR tokens to approve:', error);
                    alert('You do not have enough MR tokens to proceed.');
                    return;
                } else if (error.code === 4001) {
                    // User rejected the approval transaction
                    console.error('Approval transaction rejected by user:', error);
                    alert('You rejected the approval transaction.');
                    return;
                } else if (error.message.includes('user rejected')) {
                    console.log("User rejected approval from the app", error);
                    alert("User rejected approval from the app")
                } else  {
                    console.error('Error approving MR tokens:', error);
                    alert('An error occurred while approving MR tokens. Please try again!');
                    return;
                }
            }
        }

        console.log(`Proceeding to buy NFT with Token ID ${tokenId}, Amount ${amount}, Cost in MR ${costInMR.toString()}`);

        // Buy the NFT after approval
        try {
            const buyTx = await NFTwithSigner.buyNFTs(buyerAddress, tokenId, amount, costInMR);
            await buyTx.wait();  // Wait for the transaction to be mined
            console.log(`NFT bought successfully! Transaction Hash: ${buyTx.hash}`);
            alert('NFT purchase successful!');
        } catch (error) {
            if (error.code === 'INSUFFICIENT_FUNDS') {
                console.error('Insufficient MR tokens for the purchase:', error);
                alert('You do not have enough MR tokens to purchase the NFT.');
            } else if (error.code === 4001) {
                // User rejected the buy transaction
                console.error('Transaction rejected by user:', error);
                alert('You rejected the NFT purchase.');
            } else if (error.message.includes('gas')) {
                // Handle gas estimation issues
                console.error('Error with gas estimation:', error);
                alert('There was an issue estimating gas for the transaction.');
            } else {
                console.error('Error buying NFT:', error);
                alert('An error occurred while purchasing the NFT. Please try again.');
            }
        }

    } catch (error) {
        // Handle unexpected errors
        console.error(`Unexpected error buying NFT with Token ID ${tokenId}:`, error);
        alert('An unexpected error occurred. Please try again.');
    }
}

// Frontend disconnection handling (Example for MetaMask)
if (window.ethereum) {
    window.ethereum.on('disconnect', () => {
        alert('You have been disconnected from the dApp.');
    });

    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
            alert('No accounts found. Please connect to the dApp.');
        } else {
            console.log('Account changed:', accounts[0]);
        }
    });
}



function convertIPFSToHTTP(ipfsUrl) {
    return ipfsUrl.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
}
