import { BigInt, BigDecimal, Address } from "@graphprotocol/graph-ts";
import { User, ProtocolStats, DailyStats } from "../generated/schema";

// Constants
export const ZERO_BI = BigInt.fromI32(0);
export const ONE_BI = BigInt.fromI32(1);
export const ZERO_BD = BigDecimal.fromString("0");
export const ONE_BD = BigDecimal.fromString("1");

/**
 * Get or create a User entity
 */
export function getOrCreateUser(address: Address, timestamp: BigInt): User {
  let id = address.toHexString().toLowerCase();
  let user = User.load(id);

  if (user === null) {
    user = new User(id);
    user.totalTokensCreated = 0;
    user.totalBuys = 0;
    user.totalSells = 0;
    user.totalBuyVolume = ZERO_BI;
    user.totalSellVolume = ZERO_BI;
    user.totalLiquidityAdded = ZERO_BI;
    user.totalLiquidityRemoved = ZERO_BI;
    user.firstSeenAt = timestamp;
    user.lastSeenAt = timestamp;
    user.totalTransactions = 0;
    user.save();
  }

  return user;
}

/**
 * Get or create ProtocolStats singleton entity
 */
export function getOrCreateProtocolStats(timestamp: BigInt, blockNumber: BigInt): ProtocolStats {
  let stats = ProtocolStats.load("1");

  if (stats === null) {
    stats = new ProtocolStats("1");
    stats.totalTokensCreated = 0;
    stats.totalTokensListed = 0;
    stats.totalSwaps = 0;
    stats.totalBuys = 0;
    stats.totalSells = 0;
    stats.totalVolumeETH = ZERO_BI;
    stats.totalVolumeUSD = ZERO_BD;
    stats.totalLiquidityAddedETH = ZERO_BI;
    stats.totalLiquidityRemovedETH = ZERO_BI;
    stats.currentTotalLiquidityETH = ZERO_BI;
    stats.totalUsers = 0;
    stats.totalCreators = 0;
    stats.totalTraders = 0;
    stats.totalLiquidityProviders = 0;
    stats.firstActivityAt = timestamp;
    stats.lastActivityAt = timestamp;
    stats.lastUpdatedBlock = blockNumber;
    stats.save();
  }

  return stats;
}

/**
 * Get or create DailyStats for a given day
 */
export function getOrCreateDailyStats(timestamp: BigInt): DailyStats {
  let dayID = timestamp.toI32() / 86400; // Get day ID
  let dayStartTimestamp = dayID * 86400;
  let id = BigInt.fromI32(dayID).toString();

  let stats = DailyStats.load(id);

  if (stats === null) {
    stats = new DailyStats(id);
    stats.date = dayStartTimestamp;
    stats.tokensCreated = 0;
    stats.tokensListed = 0;
    stats.swaps = 0;
    stats.buys = 0;
    stats.sells = 0;
    stats.volumeETH = ZERO_BI;
    stats.volumeUSD = ZERO_BD;
    stats.uniqueTraders = 0;
    stats.liquidityAddedETH = ZERO_BI;
    stats.liquidityRemovedETH = ZERO_BI;
    stats.activeUsers = 0;
    stats.transactions = 0;
    stats.save();
  }

  return stats;
}

/**
 * Update user activity timestamp
 */
export function updateUserActivity(user: User, timestamp: BigInt): void {
  user.lastSeenAt = timestamp;
  user.totalTransactions = user.totalTransactions + 1;
  user.save();
}

/**
 * Update protocol stats activity
 */
export function updateProtocolActivity(stats: ProtocolStats, timestamp: BigInt, blockNumber: BigInt): void {
  stats.lastActivityAt = timestamp;
  stats.lastUpdatedBlock = blockNumber;
  stats.save();
}

/**
 * Convert BigInt to BigDecimal (for USD calculations)
 * Assumes 18 decimals
 */
export function convertBigIntToBigDecimal(value: BigInt, decimals: i32 = 18): BigDecimal {
  let divisor = BigInt.fromI32(10).pow(decimals as u8);
  return value.toBigDecimal().div(divisor.toBigDecimal());
}

/**
 * Estimate USD value from ETH amount
 * Note: In production, you'd integrate with a price oracle
 * For now, this is a placeholder that returns 0
 */
export function estimateUSDValue(ethAmount: BigInt): BigDecimal {
  // TODO: Integrate with Chainlink or similar oracle for real ETH/USD price
  // For now, return 0 to avoid incorrect data
  return ZERO_BD;
}
