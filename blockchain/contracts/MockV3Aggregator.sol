// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MockV3Aggregator
 * @notice A fake Chainlink oracle for local Ganache testing
 */
contract MockV3Aggregator {
    
    // Chainlink ETH/USD feeds use 8 decimals
    uint8 public decimals;
    int256 public currentAnswer;

    constructor(uint8 _decimals, int256 _initialAnswer) {
        decimals = _decimals;
        currentAnswer = _initialAnswer;
    }

    /**
     * @notice This is the exact function signature your payment contract calls.
     * We just hardcode the extra variables to 0 because your contract ignores them anyway.
     */
    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return (
            uint80(1),       // Fake roundId
            currentAnswer,   // The fake price you set!
            block.timestamp, // Fake startedAt
            block.timestamp, // Fake updatedAt
            uint80(1)        // Fake answeredInRound
        );
    }

    /**
     * @notice Use this function during testing to simulate crypto market volatility!
     */
    function updateAnswer(int256 _newAnswer) public {
        currentAnswer = _newAnswer;
    }
}