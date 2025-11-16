import { BigInt } from "@graphprotocol/graph-ts";
import {
  Listed,
  Delisted,
  LiquidityAdded,
  LiquidityRemoved,
  RateUpdated,
  Bought,
  Sold,
} from "../generated/SimpleSwap/SimpleSwap";
import { Token, Swap, LiquidityEvent } from "../generated/schema";
import {
  getOrCreateUser,
  getOrCreateProtocolStats,
  getOrCreateDailyStats,
  updateUserActivity,
  updateProtocolActivity,
  ZERO_BI,
  estimateUSDValue,
} from "./utils";

/**
 * Handler for Listed event
 * Emitted when a token is listed on the DEX
 */
export function handleListed(event: Listed): void {
  let tokenAddress = event.params.token;
  let token = Token.load(tokenAddress.toHexString().toLowerCase());

  if (token === null) {
    // Token not found, skip (shouldn't happen in normal flow)
    return;
  }

  // Update token DEX info
  token.isListed = true;
  token.tokenPerEth = event.params.tokenPerEth;
  token.ethBalance = event.params.ethAmount;
  token.tokenBalance = event.params.tokenAmount;
  token.listedAt = event.block.timestamp;
  token.listedAtBlock = event.block.number;
  token.save();

  // Update protocol stats
  let protocolStats = getOrCreateProtocolStats(event.block.timestamp, event.block.number);
  protocolStats.totalTokensListed = protocolStats.totalTokensListed + 1;
  protocolStats.currentTotalLiquidityETH = protocolStats.currentTotalLiquidityETH.plus(event.params.ethAmount);
  updateProtocolActivity(protocolStats, event.block.timestamp, event.block.number);

  // Update daily stats
  let dailyStats = getOrCreateDailyStats(event.block.timestamp);
  dailyStats.tokensListed = dailyStats.tokensListed + 1;
  dailyStats.transactions = dailyStats.transactions + 1;
  dailyStats.save();

  // Create LiquidityEvent for the initial listing
  let eventId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  let liquidityEvent = new LiquidityEvent(eventId);
  liquidityEvent.token = token.id;
  liquidityEvent.provider = event.transaction.from.toHexString().toLowerCase();
  liquidityEvent.type = "ADD";
  liquidityEvent.ethAmount = event.params.ethAmount;
  liquidityEvent.tokenAmount = event.params.tokenAmount;
  liquidityEvent.tokenPerEth = event.params.tokenPerEth;
  liquidityEvent.timestamp = event.block.timestamp;
  liquidityEvent.blockNumber = event.block.number;
  liquidityEvent.txHash = event.transaction.hash;
  liquidityEvent.save();

  // Update provider (user) stats
  let provider = getOrCreateUser(event.transaction.from, event.block.timestamp);
  provider.totalLiquidityAdded = provider.totalLiquidityAdded.plus(event.params.ethAmount);
  updateUserActivity(provider, event.block.timestamp);

  // Check if this is a new liquidity provider
  if (provider.totalLiquidityAdded.equals(event.params.ethAmount)) {
    protocolStats.totalLiquidityProviders = protocolStats.totalLiquidityProviders + 1;
    protocolStats.save();
  }
}

/**
 * Handler for Delisted event
 * Emitted when a token is delisted from the DEX
 */
export function handleDelisted(event: Delisted): void {
  let tokenAddress = event.params.token;
  let token = Token.load(tokenAddress.toHexString().toLowerCase());

  if (token === null) {
    return;
  }

  // Create LiquidityEvent for the delist
  let eventId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  let liquidityEvent = new LiquidityEvent(eventId);
  liquidityEvent.token = token.id;
  liquidityEvent.provider = event.transaction.from.toHexString().toLowerCase();
  liquidityEvent.type = "DELIST";
  liquidityEvent.ethAmount = event.params.ethAmount;
  liquidityEvent.tokenAmount = event.params.tokenAmount;
  liquidityEvent.tokenPerEth = token.tokenPerEth!; // Use current rate
  liquidityEvent.timestamp = event.block.timestamp;
  liquidityEvent.blockNumber = event.block.number;
  liquidityEvent.txHash = event.transaction.hash;
  liquidityEvent.save();

  // Update token status
  token.isListed = false;
  token.ethBalance = ZERO_BI;
  token.tokenBalance = ZERO_BI;
  token.save();

  // Update protocol stats
  let protocolStats = getOrCreateProtocolStats(event.block.timestamp, event.block.number);
  protocolStats.totalTokensListed = protocolStats.totalTokensListed - 1;
  protocolStats.currentTotalLiquidityETH = protocolStats.currentTotalLiquidityETH.minus(event.params.ethAmount);
  protocolStats.totalLiquidityRemovedETH = protocolStats.totalLiquidityRemovedETH.plus(event.params.ethAmount);
  updateProtocolActivity(protocolStats, event.block.timestamp, event.block.number);

  // Update provider stats
  let provider = getOrCreateUser(event.transaction.from, event.block.timestamp);
  provider.totalLiquidityRemoved = provider.totalLiquidityRemoved.plus(event.params.ethAmount);
  updateUserActivity(provider, event.block.timestamp);

  // Update daily stats
  let dailyStats = getOrCreateDailyStats(event.block.timestamp);
  dailyStats.liquidityRemovedETH = dailyStats.liquidityRemovedETH.plus(event.params.ethAmount);
  dailyStats.transactions = dailyStats.transactions + 1;
  dailyStats.save();
}

/**
 * Handler for LiquidityAdded event
 * Emitted when liquidity is added to a listed token
 */
export function handleLiquidityAdded(event: LiquidityAdded): void {
  let tokenAddress = event.params.token;
  let token = Token.load(tokenAddress.toHexString().toLowerCase());

  if (token === null) {
    return;
  }

  // Update token balances
  token.ethBalance = token.ethBalance!.plus(event.params.ethAmount);
  token.tokenBalance = token.tokenBalance!.plus(event.params.tokenAmount);
  token.totalLiquidityAdded = token.totalLiquidityAdded.plus(event.params.ethAmount);
  token.save();

  // Create LiquidityEvent
  let eventId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  let liquidityEvent = new LiquidityEvent(eventId);
  liquidityEvent.token = token.id;
  liquidityEvent.provider = event.params.provider.toHexString().toLowerCase();
  liquidityEvent.type = "ADD";
  liquidityEvent.ethAmount = event.params.ethAmount;
  liquidityEvent.tokenAmount = event.params.tokenAmount;
  liquidityEvent.tokenPerEth = token.tokenPerEth!;
  liquidityEvent.timestamp = event.block.timestamp;
  liquidityEvent.blockNumber = event.block.number;
  liquidityEvent.txHash = event.transaction.hash;
  liquidityEvent.save();

  // Update provider stats
  let provider = getOrCreateUser(event.params.provider, event.block.timestamp);
  let isNewProvider = provider.totalLiquidityAdded.equals(ZERO_BI);
  provider.totalLiquidityAdded = provider.totalLiquidityAdded.plus(event.params.ethAmount);
  updateUserActivity(provider, event.block.timestamp);

  // Update protocol stats
  let protocolStats = getOrCreateProtocolStats(event.block.timestamp, event.block.number);
  protocolStats.currentTotalLiquidityETH = protocolStats.currentTotalLiquidityETH.plus(event.params.ethAmount);
  protocolStats.totalLiquidityAddedETH = protocolStats.totalLiquidityAddedETH.plus(event.params.ethAmount);

  if (isNewProvider) {
    protocolStats.totalLiquidityProviders = protocolStats.totalLiquidityProviders + 1;
  }

  updateProtocolActivity(protocolStats, event.block.timestamp, event.block.number);

  // Update daily stats
  let dailyStats = getOrCreateDailyStats(event.block.timestamp);
  dailyStats.liquidityAddedETH = dailyStats.liquidityAddedETH.plus(event.params.ethAmount);
  dailyStats.transactions = dailyStats.transactions + 1;
  dailyStats.save();
}

/**
 * Handler for LiquidityRemoved event
 * Emitted when liquidity is removed from a listed token
 */
export function handleLiquidityRemoved(event: LiquidityRemoved): void {
  let tokenAddress = event.params.token;
  let token = Token.load(tokenAddress.toHexString().toLowerCase());

  if (token === null) {
    return;
  }

  // Update token balances
  token.ethBalance = token.ethBalance!.minus(event.params.ethAmount);
  token.tokenBalance = token.tokenBalance!.minus(event.params.tokenAmount);
  token.totalLiquidityRemoved = token.totalLiquidityRemoved.plus(event.params.ethAmount);
  token.save();

  // Create LiquidityEvent
  let eventId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  let liquidityEvent = new LiquidityEvent(eventId);
  liquidityEvent.token = token.id;
  liquidityEvent.provider = event.params.provider.toHexString().toLowerCase();
  liquidityEvent.type = "REMOVE";
  liquidityEvent.ethAmount = event.params.ethAmount;
  liquidityEvent.tokenAmount = event.params.tokenAmount;
  liquidityEvent.tokenPerEth = token.tokenPerEth!;
  liquidityEvent.timestamp = event.block.timestamp;
  liquidityEvent.blockNumber = event.block.number;
  liquidityEvent.txHash = event.transaction.hash;
  liquidityEvent.save();

  // Update provider stats
  let provider = getOrCreateUser(event.params.provider, event.block.timestamp);
  provider.totalLiquidityRemoved = provider.totalLiquidityRemoved.plus(event.params.ethAmount);
  updateUserActivity(provider, event.block.timestamp);

  // Update protocol stats
  let protocolStats = getOrCreateProtocolStats(event.block.timestamp, event.block.number);
  protocolStats.currentTotalLiquidityETH = protocolStats.currentTotalLiquidityETH.minus(event.params.ethAmount);
  protocolStats.totalLiquidityRemovedETH = protocolStats.totalLiquidityRemovedETH.plus(event.params.ethAmount);
  updateProtocolActivity(protocolStats, event.block.timestamp, event.block.number);

  // Update daily stats
  let dailyStats = getOrCreateDailyStats(event.block.timestamp);
  dailyStats.liquidityRemovedETH = dailyStats.liquidityRemovedETH.plus(event.params.ethAmount);
  dailyStats.transactions = dailyStats.transactions + 1;
  dailyStats.save();
}

/**
 * Handler for RateUpdated event
 * Emitted when the exchange rate is updated for a token
 */
export function handleRateUpdated(event: RateUpdated): void {
  let tokenAddress = event.params.token;
  let token = Token.load(tokenAddress.toHexString().toLowerCase());

  if (token === null) {
    return;
  }

  // Update token rate
  token.tokenPerEth = event.params.newTokenPerEth;
  token.save();

  // Note: We don't create any entities or update stats for rate updates
  // as they are administrative actions
}

/**
 * Handler for Bought event
 * Emitted when a user buys tokens with ETH
 */
export function handleBought(event: Bought): void {
  let tokenAddress = event.params.token;
  let token = Token.load(tokenAddress.toHexString().toLowerCase());

  if (token === null) {
    return;
  }

  // Update token stats
  token.totalBuyVolume = token.totalBuyVolume.plus(event.params.ethAmount);
  token.totalBuyCount = token.totalBuyCount + 1;
  token.ethBalance = token.ethBalance!.plus(event.params.ethAmount);
  token.tokenBalance = token.tokenBalance!.minus(event.params.tokenAmount);
  token.save();

  // Create Swap entity
  let swapId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  let swap = new Swap(swapId);
  swap.token = token.id;
  swap.user = event.params.buyer.toHexString().toLowerCase();
  swap.type = "BUY";
  swap.ethAmount = event.params.ethAmount;
  swap.tokenAmount = event.params.tokenAmount;
  swap.timestamp = event.block.timestamp;
  swap.blockNumber = event.block.number;
  swap.txHash = event.transaction.hash;
  swap.save();

  // Update user stats
  let user = getOrCreateUser(event.params.buyer, event.block.timestamp);
  let isNewTrader = user.totalBuys == 0 && user.totalSells == 0;
  user.totalBuys = user.totalBuys + 1;
  user.totalBuyVolume = user.totalBuyVolume.plus(event.params.ethAmount);
  updateUserActivity(user, event.block.timestamp);

  // Update protocol stats
  let protocolStats = getOrCreateProtocolStats(event.block.timestamp, event.block.number);
  protocolStats.totalSwaps = protocolStats.totalSwaps + 1;
  protocolStats.totalBuys = protocolStats.totalBuys + 1;
  protocolStats.totalVolumeETH = protocolStats.totalVolumeETH.plus(event.params.ethAmount);
  protocolStats.totalVolumeUSD = protocolStats.totalVolumeUSD.plus(estimateUSDValue(event.params.ethAmount));

  if (isNewTrader) {
    protocolStats.totalTraders = protocolStats.totalTraders + 1;
  }

  updateProtocolActivity(protocolStats, event.block.timestamp, event.block.number);

  // Update daily stats
  let dailyStats = getOrCreateDailyStats(event.block.timestamp);
  dailyStats.swaps = dailyStats.swaps + 1;
  dailyStats.buys = dailyStats.buys + 1;
  dailyStats.volumeETH = dailyStats.volumeETH.plus(event.params.ethAmount);
  dailyStats.volumeUSD = dailyStats.volumeUSD.plus(estimateUSDValue(event.params.ethAmount));
  dailyStats.transactions = dailyStats.transactions + 1;
  dailyStats.save();
}

/**
 * Handler for Sold event
 * Emitted when a user sells tokens for ETH
 */
export function handleSold(event: Sold): void {
  let tokenAddress = event.params.token;
  let token = Token.load(tokenAddress.toHexString().toLowerCase());

  if (token === null) {
    return;
  }

  // Update token stats
  token.totalSellVolume = token.totalSellVolume.plus(event.params.ethAmount);
  token.totalSellCount = token.totalSellCount + 1;
  token.ethBalance = token.ethBalance!.minus(event.params.ethAmount);
  token.tokenBalance = token.tokenBalance!.plus(event.params.tokenAmount);
  token.save();

  // Create Swap entity
  let swapId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  let swap = new Swap(swapId);
  swap.token = token.id;
  swap.user = event.params.seller.toHexString().toLowerCase();
  swap.type = "SELL";
  swap.ethAmount = event.params.ethAmount;
  swap.tokenAmount = event.params.tokenAmount;
  swap.timestamp = event.block.timestamp;
  swap.blockNumber = event.block.number;
  swap.txHash = event.transaction.hash;
  swap.save();

  // Update user stats
  let user = getOrCreateUser(event.params.seller, event.block.timestamp);
  let isNewTrader = user.totalBuys == 0 && user.totalSells == 0;
  user.totalSells = user.totalSells + 1;
  user.totalSellVolume = user.totalSellVolume.plus(event.params.ethAmount);
  updateUserActivity(user, event.block.timestamp);

  // Update protocol stats
  let protocolStats = getOrCreateProtocolStats(event.block.timestamp, event.block.number);
  protocolStats.totalSwaps = protocolStats.totalSwaps + 1;
  protocolStats.totalSells = protocolStats.totalSells + 1;
  protocolStats.totalVolumeETH = protocolStats.totalVolumeETH.plus(event.params.ethAmount);
  protocolStats.totalVolumeUSD = protocolStats.totalVolumeUSD.plus(estimateUSDValue(event.params.ethAmount));

  if (isNewTrader) {
    protocolStats.totalTraders = protocolStats.totalTraders + 1;
  }

  updateProtocolActivity(protocolStats, event.block.timestamp, event.block.number);

  // Update daily stats
  let dailyStats = getOrCreateDailyStats(event.block.timestamp);
  dailyStats.swaps = dailyStats.swaps + 1;
  dailyStats.sells = dailyStats.sells + 1;
  dailyStats.volumeETH = dailyStats.volumeETH.plus(event.params.ethAmount);
  dailyStats.volumeUSD = dailyStats.volumeUSD.plus(estimateUSDValue(event.params.ethAmount));
  dailyStats.transactions = dailyStats.transactions + 1;
  dailyStats.save();
}
