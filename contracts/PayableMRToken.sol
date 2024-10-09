// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MRToken is ERC20, Ownable {
    uint256 public tokenPrice;  // Token price in Wei

    uint constant _initial_supply = 100 * (10**18); // Initial supply in full tokens with 18 decimals

    constructor() ERC20("MRToken", "MR") Ownable(msg.sender) {
        _mint(msg.sender, _initial_supply);  // Mint initial supply to the owner
        tokenPrice = 1 ether;  // Initial price is set to 1 Ether (or 1 MATIC on Polygon)
    }

    // Setter function to change the token price, restricted to the owner
    function setTokenPrice(uint256 newPrice) external onlyOwner {
        require(newPrice > 0, "Price must be greater than 0");
        tokenPrice = newPrice;
    }

    // Getter function to check the current token price
    function getTokenPrice() external view returns (uint256) {
        return tokenPrice;
    }

    // Mint function to mint new tokens, charging the user according to the tokenPrice
    function mint(address to, uint256 amount) external payable {
        uint256 requiredPayment = (amount / 1e18) * tokenPrice;  // Normalize token amount
        require(msg.value >= requiredPayment, "Not enough Ether sent");

        _mint(to, amount);  // Use amount directly, no need for * 1e18 as amount should already be scaled

        // Refund excess Ether if necessary
        if (msg.value > requiredPayment) {
            payable(msg.sender).transfer(msg.value - requiredPayment);
        }
    }

}
