// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0.0;
import { ERC1155 } from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard } from "@openzeppelin/contracts/security/ReentrancyGuard.sol"; // Import ReentrancyGuard


contract BuyNFT is ERC1155, Ownable, ReentrancyGuard  {
    IERC20 public mrToken; // MR Token contract address

    constructor(address _mrToken) ERC1155("ipfs://QmQuqKLFCwgrbDTgfaXHoWFhTS3NqGdkvjHYDKZvYixjm2/{id}.json") Ownable(msg.sender) {
        mrToken = IERC20(_mrToken); // Set the MR Token contract address
    }

    event BatchMint(address indexed to, uint256[] ids, uint256[] amounts);
    event NFTsBought(address indexed buyer, uint256 id, uint256 amount, uint256 cost);

    // Owner-only mint function
    function mintNFT(address recipient, uint256 id, uint256 amount) external onlyOwner {
        _mint(recipient , id, amount, "");
    }

    // Buy NFTs function (Payable in MR Tokens)
    function buyNFTs(address buyer, uint256 id, uint256 amount, uint256 costInMR) external nonReentrant {
        // Check if the buyer has enough MR tokens and sufficient allowance
        uint256 allowance = mrToken.allowance(buyer, address(this));
        uint256 holdings = mrToken.balanceOf(buyer);

        require(holdings >= costInMR, "Insufficient MR tokens");
        require(allowance >= costInMR, "Allowance too low");

        // Transfer MR tokens from the buyer to the contract
        bool sent = mrToken.transferFrom(buyer, address(this), costInMR);
        require(sent, "MR token transfer failed");

        // Mint the NFTs after tokens are successfully transferred
        _mint(buyer, id, amount, "");

        // Emit the event after all operations are completed
        emit NFTsBought(buyer, id, amount, costInMR);
    }


    // Function to withdraw MR tokens from the contract (onlyOwner)
    function withdrawMR() external onlyOwner {
        uint256 holdings = mrToken.balanceOf(address(this));
        require(holdings > 0, "No MR tokens to withdraw");
        mrToken.transfer(owner(), holdings);
    }

    // Get the token URI
    function getTokenURI(uint256 tokenId) public pure returns (string memory) {
        return uri(tokenId);
    }

    // Override the URI function to properly replace {id} with tokenId
    function uri(uint256 tokenId) public pure override returns (string memory) {
        return string(abi.encodePacked(
            "ipfs://QmQuqKLFCwgrbDTgfaXHoWFhTS3NqGdkvjHYDKZvYixjm2/",
            Strings.toString(tokenId),
            ".json"
        ));
    }
}
