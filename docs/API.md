# Smart Contract API Reference

## YourToken

### Constructor

```solidity
constructor(
    string memory name_,        // Token name
    string memory symbol_,      // Token symbol
    uint8 decimals_,           // Number of decimals
    uint256 initialSupply_,    // Initial supply to mint
    uint256 cap_,              // Maximum total supply
    address owner_             // Token owner address
)
```

**Requirements:**
- `cap_` must be >= `initialSupply_`
- `owner_` cannot be zero address

### Functions

#### decimals
```solidity
function decimals() public view returns (uint8)
```
Returns the number of decimals for the token.

#### mint
```solidity
function mint(address to, uint256 amount) external onlyOwner
```
Mints new tokens to specified address.

**Requirements:**
- Caller must be owner
- Total supply + amount must not exceed cap

#### burn
```solidity
function burn(uint256 amount) external
```
Burns tokens from caller's balance.

#### burnFrom
```solidity
function burnFrom(address from, uint256 amount) external
```
Burns tokens from a specified address (requires approval).

---

## TokenFactory

### Functions

#### createToken
```solidity
function createToken(
    string memory name_,
    string memory symbol_,
    uint8 decimals_,
    uint256 initialSupply_,
    uint256 cap_
) external returns (address token)
```
Creates a new YourToken contract with `msg.sender` as owner.

**Parameters:**
- `name_`: Token name (must not be empty)
- `symbol_`: Token symbol (must not be empty)
- `decimals_`: Number of decimals
- `initialSupply_`: Initial supply to mint to owner
- `cap_`: Maximum total supply

**Returns:**
- `token`: Address of the newly created token

**Events:**
- Emits `TokenCreated(owner, token, name, symbol, initialSupply)`

#### getAllTokens
```solidity
function getAllTokens() external view returns (address[] memory)
```
Returns array of all created token addresses.

#### getMyTokens
```solidity
function getMyTokens(address owner_) external view returns (address[] memory)
```
Returns array of tokens created by a specific owner.

#### totalTokens
```solidity
function totalTokens() external view returns (uint256)
```
Returns total number of created tokens.

### Events

#### TokenCreated
```solidity
event TokenCreated(
    address indexed owner,
    address indexed token,
    string name,
    string symbol,
    uint256 initialSupply
)
```

---

## SimpleSwap

### Structs

#### TokenInfo
```solidity
struct TokenInfo {
    bool isListed;           // Whether token is listed
    uint256 tokenPerEth;     // Tokens per 1 ETH (with decimals)
    uint256 minEthLiquidity; // Minimum ETH to maintain
    uint256 tokenBalance;    // Token liquidity in pool
    uint256 ethBalance;      // ETH liquidity in pool
}
```

### Admin Functions (Owner Only)

#### listToken
```solidity
function listToken(
    address token_,
    uint256 tokenPerEth_,
    uint256 minEthLiquidity_
) external onlyOwner
```
Lists a new token for trading.

**Parameters:**
- `token_`: Token address (cannot be zero)
- `tokenPerEth_`: Exchange rate (must be > 0)
- `minEthLiquidity_`: Minimum ETH to maintain in pool

**Events:**
- Emits `Listed(token, tokenPerEth, minEthLiquidity)`

#### unlistToken
```solidity
function unlistToken(address token_) external onlyOwner
```
Unlists a token from trading.

**Events:**
- Emits `Unlisted(token)`

#### setRate
```solidity
function setRate(address token_, uint256 newTokenPerEth_) external onlyOwner
```
Updates exchange rate for a listed token.

**Parameters:**
- `newTokenPerEth_`: New rate (must be > 0)

**Events:**
- Emits `RateUpdated(token, newTokenPerEth)`

#### addLiquidity
```solidity
function addLiquidity(address token_, uint256 tokenAmount_) external payable onlyOwner
```
Adds token and/or ETH liquidity to a pool.

**Parameters:**
- `tokenAmount_`: Amount of tokens to add (requires prior approval)
- `msg.value`: Amount of ETH to add

**Requirements:**
- Must add either tokens or ETH (or both)

**Events:**
- Emits `LiquidityAdded(token, tokenAmount, ethAmount)`

#### withdraw
```solidity
function withdraw(
    address token_,
    uint256 tokenAmount_,
    uint256 ethAmount_
) external onlyOwner nonReentrant
```
Withdraws liquidity from a pool.

**Requirements:**
- Pool must have sufficient balance
- Cannot violate minimum ETH liquidity

**Events:**
- Emits `LiquidityWithdrawn(token, tokenAmount, ethAmount)`

### User Functions

#### buyToken
```solidity
function buyToken(address token_) external payable nonReentrant
```
Buys tokens with ETH.

**Parameters:**
- `msg.value`: Amount of ETH to spend

**Calculation:**
```
tokensOut = (ethIn × tokenPerEth) / 1e18
```

**Requirements:**
- Token must be listed
- Must send ETH
- Pool must have sufficient token liquidity

**Events:**
- Emits `Bought(buyer, token, ethIn, tokensOut)`

#### sellToken
```solidity
function sellToken(address token_, uint256 amount_) external nonReentrant
```
Sells tokens for ETH.

**Parameters:**
- `amount_`: Amount of tokens to sell (requires prior approval)

**Calculation:**
```
ethOut = (tokensIn × 1e18) / tokenPerEth
```

**Requirements:**
- Token must be listed
- Amount must be > 0
- Pool must have sufficient ETH
- Cannot violate minimum ETH liquidity

**Events:**
- Emits `Sold(seller, token, tokensIn, ethOut)`

### View Functions

#### getListedTokens
```solidity
function getListedTokens() external view returns (address[] memory)
```
Returns array of all listed token addresses.

#### getTokenInfo
```solidity
function getTokenInfo(address token_) external view returns (
    bool isListed,
    uint256 tokenPerEth,
    uint256 minEthLiquidity,
    uint256 tokenBalance,
    uint256 ethBalance
)
```
Returns detailed info for a token.

#### previewBuy
```solidity
function previewBuy(address token_, uint256 ethAmount_) external view returns (uint256)
```
Calculates how many tokens you'd get for a given ETH amount.

**Formula:**
```
tokens = (ethAmount × tokenPerEth) / 1e18
```

#### previewSell
```solidity
function previewSell(address token_, uint256 tokenAmount_) external view returns (uint256)
```
Calculates how much ETH you'd get for a given token amount.

**Formula:**
```
eth = (tokenAmount × 1e18) / tokenPerEth
```

### Events

#### Listed
```solidity
event Listed(address indexed token, uint256 tokenPerEth, uint256 minEthLiquidity)
```

#### Unlisted
```solidity
event Unlisted(address indexed token)
```

#### RateUpdated
```solidity
event RateUpdated(address indexed token, uint256 newTokenPerEth)
```

#### Bought
```solidity
event Bought(address indexed buyer, address indexed token, uint256 ethIn, uint256 tokensOut)
```

#### Sold
```solidity
event Sold(address indexed seller, address indexed token, uint256 tokensIn, uint256 ethOut)
```

#### LiquidityAdded
```solidity
event LiquidityAdded(address indexed token, uint256 tokenAmount, uint256 ethAmount)
```

#### LiquidityWithdrawn
```solidity
event LiquidityWithdrawn(address indexed token, uint256 tokenAmount, uint256 ethAmount)
```

---

## Usage Examples

### Creating a Token

```javascript
// Using ethers.js v6
const factory = await ethers.getContractAt("TokenFactory", factoryAddress);

const tx = await factory.createToken(
  "My Token",              // name
  "MTK",                   // symbol
  18,                      // decimals
  ethers.parseEther("1000"),  // initialSupply (1000 tokens)
  ethers.parseEther("10000")  // cap (10000 tokens)
);

const receipt = await tx.wait();
// Get token address from event
const event = receipt.logs.find(log => log.eventName === "TokenCreated");
const tokenAddress = event.args.token;
```

### Listing a Token on SimpleSwap

```javascript
const swap = await ethers.getContractAt("SimpleSwap", swapAddress);

await swap.listToken(
  tokenAddress,                  // token
  ethers.parseEther("100"),     // 100 tokens per 1 ETH
  ethers.parseEther("1")        // minimum 1 ETH liquidity
);
```

### Adding Liquidity

```javascript
// Approve tokens first
const token = await ethers.getContractAt("YourToken", tokenAddress);
await token.approve(swapAddress, ethers.parseEther("5000"));

// Add liquidity
await swap.addLiquidity(
  tokenAddress,
  ethers.parseEther("5000"),  // 5000 tokens
  { value: ethers.parseEther("10") }  // 10 ETH
);
```

### Buying Tokens

```javascript
const swap = await ethers.getContractAt("SimpleSwap", swapAddress);

// Preview first
const tokensOut = await swap.previewBuy(tokenAddress, ethers.parseEther("1"));
console.log(`You will get ${ethers.formatEther(tokensOut)} tokens`);

// Buy
await swap.buyToken(tokenAddress, {
  value: ethers.parseEther("1")  // Send 1 ETH
});
```

### Selling Tokens

```javascript
// Approve tokens first
const token = await ethers.getContractAt("YourToken", tokenAddress);
await token.approve(swapAddress, ethers.parseEther("100"));

// Preview first
const ethOut = await swap.previewSell(tokenAddress, ethers.parseEther("100"));
console.log(`You will get ${ethers.formatEther(ethOut)} ETH`);

// Sell
await swap.sellToken(tokenAddress, ethers.parseEther("100"));
```

---

## Error Messages

### YourToken Errors
- `YourToken: cap must be >= initialSupply` - Cap is less than initial supply
- `YourToken: owner cannot be zero address` - Owner address is zero
- `YourToken: cap exceeded` - Minting would exceed cap
- `OwnableUnauthorizedAccount` - Caller is not owner

### TokenFactory Errors
- `TokenFactory: name cannot be empty` - Token name is empty
- `TokenFactory: symbol cannot be empty` - Token symbol is empty

### SimpleSwap Errors
- `SimpleSwap: token cannot be zero address` - Token address is zero
- `SimpleSwap: token already listed` - Token is already listed
- `SimpleSwap: rate must be > 0` - Rate is zero
- `SimpleSwap: token not listed` - Token is not listed
- `SimpleSwap: must send ETH` - No ETH sent with buyToken
- `SimpleSwap: insufficient token liquidity` - Pool doesn't have enough tokens
- `SimpleSwap: amount must be > 0` - Sell amount is zero
- `SimpleSwap: insufficient ETH liquidity` - Pool doesn't have enough ETH
- `SimpleSwap: would violate min liquidity` - Operation would violate minimum liquidity
- `SimpleSwap: ETH transfer failed` - ETH transfer failed
- `SimpleSwap: must add some liquidity` - No liquidity added
- `SimpleSwap: insufficient token balance` - Pool doesn't have enough tokens to withdraw
- `SimpleSwap: insufficient ETH balance` - Pool doesn't have enough ETH to withdraw
- `OwnableUnauthorizedAccount` - Caller is not owner
