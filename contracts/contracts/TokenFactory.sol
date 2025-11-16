// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./YourToken.sol";

/**
 * @title TokenFactory
 * @dev Factory contract for creating YourToken instances
 * @notice Users can deploy their own ERC-20 tokens through this factory
 */
contract TokenFactory {
    // Array of all created tokens
    address[] public allTokens;

    // Mapping from owner address to their created tokens
    mapping(address => address[]) public tokensByOwner;

    /**
     * @dev Emitted when a new token is created
     * @param owner Address of the token owner
     * @param token Address of the created token contract
     * @param name Token name
     * @param symbol Token symbol
     * @param initialSupply Initial supply minted
     */
    event TokenCreated(
        address indexed owner,
        address indexed token,
        string name,
        string symbol,
        uint256 initialSupply
    );

    /**
     * @dev Creates a new YourToken contract
     * @param name_ Token name
     * @param symbol_ Token symbol
     * @param decimals_ Number of decimals
     * @param initialSupply_ Initial supply to mint
     * @param cap_ Maximum total supply
     * @return token Address of the newly created token
     */
    function createToken(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 initialSupply_,
        uint256 cap_
    ) external returns (address token) {
        require(bytes(name_).length > 0, "TokenFactory: name cannot be empty");
        require(bytes(symbol_).length > 0, "TokenFactory: symbol cannot be empty");

        // Deploy new token with msg.sender as owner
        YourToken newToken = new YourToken(
            name_,
            symbol_,
            decimals_,
            initialSupply_,
            cap_,
            msg.sender
        );

        token = address(newToken);

        // Track the token
        allTokens.push(token);
        tokensByOwner[msg.sender].push(token);

        emit TokenCreated(msg.sender, token, name_, symbol_, initialSupply_);
    }

    /**
     * @dev Returns all created tokens
     * @return Array of all token addresses
     */
    function getAllTokens() external view returns (address[] memory) {
        return allTokens;
    }

    /**
     * @dev Returns all tokens created by a specific owner
     * @param owner_ Address of the token owner
     * @return Array of token addresses owned by the specified address
     */
    function getMyTokens(address owner_) external view returns (address[] memory) {
        return tokensByOwner[owner_];
    }

    /**
     * @dev Returns the total number of tokens created
     * @return Total count of created tokens
     */
    function totalTokens() external view returns (uint256) {
        return allTokens.length;
    }
}
