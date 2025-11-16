import { BigInt } from "@graphprotocol/graph-ts";
import { TokenCreated } from "../generated/TokenFactory/TokenFactory";
import { YourToken } from "../generated/TokenFactory/YourToken";
import { Token } from "../generated/schema";
import {
  getOrCreateUser,
  getOrCreateProtocolStats,
  getOrCreateDailyStats,
  updateUserActivity,
  updateProtocolActivity,
  ZERO_BI,
} from "./utils";

/**
 * Handler for TokenCreated event
 * Emitted when a new token is created via the factory
 */
export function handleTokenCreated(event: TokenCreated): void {
  let tokenAddress = event.params.token;
  let creator = event.params.creator;

  // Load token contract to get additional info
  let tokenContract = YourToken.bind(tokenAddress);

  // Create Token entity
  let token = new Token(tokenAddress.toHexString().toLowerCase());
  token.name = event.params.name;
  token.symbol = event.params.symbol;
  token.initialSupply = event.params.initialSupply;
  token.createdAt = event.block.timestamp;
  token.createdAtBlock = event.block.number;
  token.txHash = event.transaction.hash;

  // Get decimals and cap from contract
  let decimalsResult = tokenContract.try_decimals();
  let capResult = tokenContract.try_cap();

  token.decimals = decimalsResult.reverted ? 18 : decimalsResult.value;
  token.cap = capResult.reverted ? ZERO_BI : capResult.value;

  // DEX fields (initially not listed)
  token.isListed = false;
  token.tokenPerEth = null;
  token.ethBalance = null;
  token.tokenBalance = null;
  token.listedAt = null;
  token.listedAtBlock = null;

  // Initialize aggregated stats
  token.totalBuyVolume = ZERO_BI;
  token.totalSellVolume = ZERO_BI;
  token.totalBuyCount = 0;
  token.totalSellCount = 0;
  token.totalLiquidityAdded = ZERO_BI;
  token.totalLiquidityRemoved = ZERO_BI;

  // Get or create User entity for creator
  let user = getOrCreateUser(creator, event.block.timestamp);

  // Update user stats
  user.totalTokensCreated = user.totalTokensCreated + 1;
  if (user.firstCreatedAt === null) {
    user.firstCreatedAt = event.block.timestamp;
  }
  user.lastCreatedAt = event.block.timestamp;
  updateUserActivity(user, event.block.timestamp);

  // Link token to creator
  token.creator = user.id;
  token.save();

  // Update protocol stats
  let protocolStats = getOrCreateProtocolStats(event.block.timestamp, event.block.number);
  protocolStats.totalTokensCreated = protocolStats.totalTokensCreated + 1;

  // Check if this is a new creator
  if (user.totalTokensCreated == 1) {
    protocolStats.totalCreators = protocolStats.totalCreators + 1;
  }

  // Check if this is a new user
  if (user.totalTransactions == 1) {
    protocolStats.totalUsers = protocolStats.totalUsers + 1;
  }

  updateProtocolActivity(protocolStats, event.block.timestamp, event.block.number);

  // Update daily stats
  let dailyStats = getOrCreateDailyStats(event.block.timestamp);
  dailyStats.tokensCreated = dailyStats.tokensCreated + 1;
  dailyStats.transactions = dailyStats.transactions + 1;
  dailyStats.save();
}
