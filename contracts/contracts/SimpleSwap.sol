// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title SimpleSwap
 * @dev A simple DEX for swapping tokens with ETH at fixed rates
 * @notice Admin can list tokens with fixed exchange rates; users can buy/sell listed tokens
 */
contract SimpleSwap is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct TokenInfo {
        bool isListed;
        uint256 tokenPerEth;      // How many tokens per 1 ETH (with token decimals consideration)
        uint256 minEthLiquidity;  // Minimum ETH that must remain in the pool
        uint256 tokenBalance;     // Token liquidity in the pool
        uint256 ethBalance;       // ETH liquidity in the pool
    }

    // Mapping from token address to its info
    mapping(address => TokenInfo) public tokens;

    // Array of all listed tokens
    address[] public listedTokens;

    // Events
    event Listed(address indexed token, uint256 tokenPerEth, uint256 minEthLiquidity);
    event Unlisted(address indexed token);
    event RateUpdated(address indexed token, uint256 newTokenPerEth);
    event Bought(address indexed buyer, address indexed token, uint256 ethIn, uint256 tokensOut);
    event Sold(address indexed seller, address indexed token, uint256 tokensIn, uint256 ethOut);
    event LiquidityAdded(address indexed token, uint256 tokenAmount, uint256 ethAmount);
    event LiquidityWithdrawn(address indexed token, uint256 tokenAmount, uint256 ethAmount);

    constructor(address initialOwner) Ownable(initialOwner) {}

    /**
     * @dev Lists a new token for trading
     * @param token_ Token address to list
     * @param tokenPerEth_ Exchange rate (tokens per 1 ETH)
     * @param minEthLiquidity_ Minimum ETH liquidity to maintain
     */
    function listToken(
        address token_,
        uint256 tokenPerEth_,
        uint256 minEthLiquidity_
    ) external onlyOwner {
        require(token_ != address(0), "SimpleSwap: token cannot be zero address");
        require(!tokens[token_].isListed, "SimpleSwap: token already listed");
        require(tokenPerEth_ > 0, "SimpleSwap: rate must be > 0");

        tokens[token_] = TokenInfo({
            isListed: true,
            tokenPerEth: tokenPerEth_,
            minEthLiquidity: minEthLiquidity_,
            tokenBalance: 0,
            ethBalance: 0
        });

        listedTokens.push(token_);

        emit Listed(token_, tokenPerEth_, minEthLiquidity_);
    }

    /**
     * @dev Unlists a token from trading
     * @param token_ Token address to unlist
     */
    function unlistToken(address token_) external onlyOwner {
        require(tokens[token_].isListed, "SimpleSwap: token not listed");

        tokens[token_].isListed = false;

        // Remove from listedTokens array
        for (uint256 i = 0; i < listedTokens.length; i++) {
            if (listedTokens[i] == token_) {
                listedTokens[i] = listedTokens[listedTokens.length - 1];
                listedTokens.pop();
                break;
            }
        }

        emit Unlisted(token_);
    }

    /**
     * @dev Updates the exchange rate for a listed token
     * @param token_ Token address
     * @param newTokenPerEth_ New exchange rate
     */
    function setRate(address token_, uint256 newTokenPerEth_) external onlyOwner {
        require(tokens[token_].isListed, "SimpleSwap: token not listed");
        require(newTokenPerEth_ > 0, "SimpleSwap: rate must be > 0");

        tokens[token_].tokenPerEth = newTokenPerEth_;

        emit RateUpdated(token_, newTokenPerEth_);
    }

    /**
     * @dev Buy tokens with ETH
     * @param token_ Token address to buy
     */
    function buyToken(address token_) external payable nonReentrant {
        require(tokens[token_].isListed, "SimpleSwap: token not listed");
        require(msg.value > 0, "SimpleSwap: must send ETH");

        TokenInfo storage info = tokens[token_];

        // Calculate tokens to send: ethIn * tokenPerEth / 1e18
        uint256 tokensOut = (msg.value * info.tokenPerEth) / 1e18;
        require(tokensOut > 0, "SimpleSwap: insufficient ETH for any tokens");
        require(info.tokenBalance >= tokensOut, "SimpleSwap: insufficient token liquidity");

        // Update balances
        info.tokenBalance -= tokensOut;
        info.ethBalance += msg.value;

        // Transfer tokens to buyer
        IERC20(token_).safeTransfer(msg.sender, tokensOut);

        emit Bought(msg.sender, token_, msg.value, tokensOut);
    }

    /**
     * @dev Sell tokens for ETH
     * @param token_ Token address to sell
     * @param amount_ Amount of tokens to sell
     */
    function sellToken(address token_, uint256 amount_) external nonReentrant {
        require(tokens[token_].isListed, "SimpleSwap: token not listed");
        require(amount_ > 0, "SimpleSwap: amount must be > 0");

        TokenInfo storage info = tokens[token_];

        // Calculate ETH to send: tokensIn * 1e18 / tokenPerEth
        uint256 ethOut = (amount_ * 1e18) / info.tokenPerEth;
        require(ethOut > 0, "SimpleSwap: insufficient tokens for any ETH");
        require(info.ethBalance >= ethOut, "SimpleSwap: insufficient ETH liquidity");
        require(
            info.ethBalance - ethOut >= info.minEthLiquidity,
            "SimpleSwap: would violate min liquidity"
        );

        // Update balances
        info.tokenBalance += amount_;
        info.ethBalance -= ethOut;

        // Transfer tokens from seller
        IERC20(token_).safeTransferFrom(msg.sender, address(this), amount_);

        // Transfer ETH to seller
        (bool success, ) = msg.sender.call{value: ethOut}("");
        require(success, "SimpleSwap: ETH transfer failed");

        emit Sold(msg.sender, token_, amount_, ethOut);
    }

    /**
     * @dev Add liquidity to a token pool (admin only)
     * @param token_ Token address
     * @param tokenAmount_ Amount of tokens to add
     */
    function addLiquidity(address token_, uint256 tokenAmount_) external payable onlyOwner {
        require(tokens[token_].isListed, "SimpleSwap: token not listed");

        TokenInfo storage info = tokens[token_];

        if (tokenAmount_ > 0) {
            info.tokenBalance += tokenAmount_;
            IERC20(token_).safeTransferFrom(msg.sender, address(this), tokenAmount_);
        }

        if (msg.value > 0) {
            info.ethBalance += msg.value;
        }

        require(tokenAmount_ > 0 || msg.value > 0, "SimpleSwap: must add some liquidity");

        emit LiquidityAdded(token_, tokenAmount_, msg.value);
    }

    /**
     * @dev Withdraw liquidity from a token pool (admin only)
     * @param token_ Token address
     * @param tokenAmount_ Amount of tokens to withdraw
     * @param ethAmount_ Amount of ETH to withdraw
     */
    function withdraw(
        address token_,
        uint256 tokenAmount_,
        uint256 ethAmount_
    ) external onlyOwner nonReentrant {
        require(tokens[token_].isListed, "SimpleSwap: token not listed");

        TokenInfo storage info = tokens[token_];

        require(info.tokenBalance >= tokenAmount_, "SimpleSwap: insufficient token balance");
        require(info.ethBalance >= ethAmount_, "SimpleSwap: insufficient ETH balance");
        require(
            info.ethBalance - ethAmount_ >= info.minEthLiquidity,
            "SimpleSwap: would violate min liquidity"
        );

        info.tokenBalance -= tokenAmount_;
        info.ethBalance -= ethAmount_;

        if (tokenAmount_ > 0) {
            IERC20(token_).safeTransfer(msg.sender, tokenAmount_);
        }

        if (ethAmount_ > 0) {
            (bool success, ) = msg.sender.call{value: ethAmount_}("");
            require(success, "SimpleSwap: ETH transfer failed");
        }

        emit LiquidityWithdrawn(token_, tokenAmount_, ethAmount_);
    }

    /**
     * @dev Returns all listed token addresses
     */
    function getListedTokens() external view returns (address[] memory) {
        return listedTokens;
    }

    /**
     * @dev Returns detailed info for a token
     */
    function getTokenInfo(address token_) external view returns (
        bool isListed,
        uint256 tokenPerEth,
        uint256 minEthLiquidity,
        uint256 tokenBalance,
        uint256 ethBalance
    ) {
        TokenInfo memory info = tokens[token_];
        return (
            info.isListed,
            info.tokenPerEth,
            info.minEthLiquidity,
            info.tokenBalance,
            info.ethBalance
        );
    }

    /**
     * @dev Calculate how many tokens you'd get for a given ETH amount
     */
    function previewBuy(address token_, uint256 ethAmount_) external view returns (uint256) {
        require(tokens[token_].isListed, "SimpleSwap: token not listed");
        return (ethAmount_ * tokens[token_].tokenPerEth) / 1e18;
    }

    /**
     * @dev Calculate how much ETH you'd get for a given token amount
     */
    function previewSell(address token_, uint256 tokenAmount_) external view returns (uint256) {
        require(tokens[token_].isListed, "SimpleSwap: token not listed");
        return (tokenAmount_ * 1e18) / tokens[token_].tokenPerEth;
    }

    /**
     * @dev Allow contract to receive ETH
     */
    receive() external payable {}
}
