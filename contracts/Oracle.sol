// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract MoonwellInfoOracle {
    bytes reserves;
    uint256 underlying_price;
    uint last_update;
    address processor;

    constructor() {
    // constructor(address _processor) {
        // processor = _processor;
    }

    /**
     * Receive Moonwell reserves data from an Acurast job.
     */
    function set_reserves(bytes memory _reserves) public {
        // Ensures that only the processor can call this function
        // require(msg.sender == processor, "NOT_ALLOWED");
        // Update entropy
        reserves = _reserves;
        last_update = block.timestamp;
    }

    /**
     * Receive mGLMR price data from an Acurast job.
     */
    function set_underlying_price(uint256 _underlying_price) public {
        // Ensures that only the processor can call this function
        // require(msg.sender == processor, "NOT_ALLOWED");
        // Update underlying_price
        underlying_price = _underlying_price;
        last_update = block.timestamp;
    }

    /**
     * A view that exposes price data to other contracts.
     */
    function get_reserves(uint maxAge) public view returns (bytes memory) {
        // Consumers can specify the maximum entropy age they are willing to accept
        require(block.timestamp - last_update <= maxAge, "RESERVES_DATA_TOO_OLD");

        return reserves;
    }

    /**
     * A view that exposes data to other contracts.
     */
    function get_price(uint maxAge) public view returns (uint256) {
        // Consumers can specify the maximum entropy age they are willing to accept
        require(block.timestamp - last_update <= maxAge, "PRICE_DATA_TOO_OLD");

        return underlying_price;
    }
}
