// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title YourToken
 * @dev ERC-20 token with capped supply, owner-controlled minting, and public burning
 * @notice This token enforces a maximum supply cap and allows the owner to mint new tokens
 */
contract YourToken is ERC20, Ownable {
    uint8 private immutable _decimals;
    uint256 public immutable cap;

    /**
     * @dev Constructor to initialize the token
     * @param name_ Token name
     * @param symbol_ Token symbol
     * @param decimals_ Number of decimals (typically 18)
     * @param initialSupply_ Initial supply to mint to owner
     * @param cap_ Maximum total supply allowed
     * @param owner_ Address that will own the token contract
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 initialSupply_,
        uint256 cap_,
        address owner_
    ) ERC20(name_, symbol_) Ownable(owner_) {
        require(cap_ >= initialSupply_, "YourToken: cap must be >= initialSupply");
        require(owner_ != address(0), "YourToken: owner cannot be zero address");

        _decimals = decimals_;
        cap = cap_;

        if (initialSupply_ > 0) {
            _mint(owner_, initialSupply_);
        }
    }

    /**
     * @dev Returns the number of decimals used for token amounts
     */
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    /**
     * @dev Mints new tokens to the specified address (owner only)
     * @param to Address to receive the minted tokens
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= cap, "YourToken: cap exceeded");
        _mint(to, amount);
    }

    /**
     * @dev Burns tokens from the caller's balance
     * @param amount Amount of tokens to burn
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    /**
     * @dev Burns tokens from a specified address (requires approval)
     * @param from Address to burn tokens from
     * @param amount Amount of tokens to burn
     */
    function burnFrom(address from, uint256 amount) external {
        _spendAllowance(from, msg.sender, amount);
        _burn(from, amount);
    }
}
