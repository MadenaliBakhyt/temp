import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  Listed,
  Unlisted,
  LiquidityAdded,
  LiquidityWithdrawn,
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
import { ethereum } from "@graphprotocol/graph-ts";

/**
 * Helpers to safely read event params by position (ABI order),
 * avoiding mismatches in param names.
 *
 * IMPORTANT: these index positions must match your Solidity event definitions.
 * Based on your ABI "Available events" list and common patterns, we assume:
 *
 * Listed(token, tokenPerEth, tokenAmountOrLiquidity)
 * Unlisted(token)
 * LiquidityAdded(token, ethAmount, tokenAmount)  OR (token, tokenAmount, ethAmount)
 * LiquidityWithdrawn(token, ethAmount, tokenAmount) OR (token, tokenAmount, ethAmount)
 * RateUpdated(token, tokenPerEth)
 * Bought(buyer, token, ethIn, tokensOut)
 * Sold(seller, token, tokensIn, ethOut)
 *
 * If your Solidity order differs, you only need to swap indices in these helpers.
 */

function pAddress(event: ethereum.Event, idx: i32): Address {
  return event.parameters[idx].value.toAddress();
}
function pBigInt(event: ethereum.Event, idx: i32): BigInt {
  return event.parameters[idx].value.toBigInt();
}

/**
 * Listed(token, tokenPerEth, tokenAmount)
 */
export function handleListed(event: Listed): void {
  // token address is first param
  let tokenAddress = event.parameters[0].value.toAddress();
  let token = Token.load(tokenAddress.toHexString().toLowerCase());
  if (token === null) return;

  // rate and initial token liquidity (ETH liquidity may be implicit / added separately)
  let tokenPerEth = event.parameters[1].value.toBigInt();
  let tokenAmount = event.parameters[2].value.toBigInt();

  token.isListed = true;
  token.tokenPerEth = tokenPerEth;

  // We don't have ETH amount in Listed (per your ABI errors), so we set to ZERO_BI for safety
  // and track ETH changes via LiquidityAdded/LiquidityWithdrawn/Bought/Sold.
  if (token.ethBalance === null) token.ethBalance = ZERO_BI;
  token.tokenBalance = tokenAmount;
  token.listedAt = event.block.timestamp;
  token.listedAtBlock = event.block.number;
  token.save();

  // Protocol stats
  let protocolStats = getOrCreateProtocolStats(event.block.timestamp, event.block.number);
  protocolStats.totalTokensListed = protocolStats.totalTokensListed + 1;
  updateProtocolActivity(protocolStats, event.block.timestamp, event.block.number);

  // Daily stats
  let dailyStats = getOrCreateDailyStats(event.block.timestamp);
  dailyStats.tokensListed = dailyStats.tokensListed + 1;
  dailyStats.transactions = dailyStats.transactions + 1;
  dailyStats.save();

  // Create LiquidityEvent for listing (treat as ADD of token liquidity)
  let eventId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  let liquidityEvent = new LiquidityEvent(eventId);
  liquidityEvent.token = token.id;
  liquidityEvent.provider = event.transaction.from.toHexString().toLowerCase();
  liquidityEvent.type = "ADD";
  liquidityEvent.ethAmount = ZERO_BI; // not present in Listed
  liquidityEvent.tokenAmount = tokenAmount;
  liquidityEvent.tokenPerEth = tokenPerEth;
  liquidityEvent.timestamp = event.block.timestamp;
  liquidityEvent.blockNumber = event.block.number;
  liquidityEvent.txHash = event.transaction.hash;
  liquidityEvent.save();

  // Provider stats
  let provider = getOrCreateUser(event.transaction.from, event.block.timestamp);
  // only token liquidity known here; keep ETH added stats for LiquidityAdded
  updateUserActivity(provider, event.block.timestamp);
}

/**
 * Unlisted(token)
 */
export function handleUnlisted(event: Unlisted): void {
  let tokenAddress = event.parameters[0].value.toAddress();
  let token = Token.load(tokenAddress.toHexString().toLowerCase());
  if (token === null) return;

  // Create LiquidityEvent for delist
  let eventId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  let liquidityEvent = new LiquidityEvent(eventId);
  liquidityEvent.token = token.id;
  liquidityEvent.provider = event.transaction.from.toHexString().toLowerCase();
  liquidityEvent.type = "DELIST";
  liquidityEvent.ethAmount = token.ethBalance === null ? ZERO_BI : token.ethBalance!;
  liquidityEvent.tokenAmount = token.tokenBalance === null ? ZERO_BI : token.tokenBalance!;
  liquidityEvent.tokenPerEth = token.tokenPerEth === null ? ZERO_BI : token.tokenPerEth!;
  liquidityEvent.timestamp = event.block.timestamp;
  liquidityEvent.blockNumber = event.block.number;
  liquidityEvent.txHash = event.transaction.hash;
  liquidityEvent.save();

  // Update token status
  token.isListed = false;
  token.tokenPerEth = null;
  token.ethBalance = ZERO_BI;
  token.tokenBalance = ZERO_BI;
  token.save();

  // Protocol stats
  let protocolStats = getOrCreateProtocolStats(event.block.timestamp, event.block.number);
  protocolStats.totalTokensListed = protocolStats.totalTokensListed - 1;
  updateProtocolActivity(protocolStats, event.block.timestamp, event.block.number);

  // Provider stats
  let provider = getOrCreateUser(event.transaction.from, event.block.timestamp);
  updateUserActivity(provider, event.block.timestamp);

  // Daily stats
  let dailyStats = getOrCreateDailyStats(event.block.timestamp);
  dailyStats.transactions = dailyStats.transactions + 1;
  dailyStats.save();
}

/**
 * LiquidityAdded(token, ethAmount, tokenAmount)  (assumed)
 * If your order is (token, tokenAmount, ethAmount) — swap indices 1 and 2 below.
 */
export function handleLiquidityAdded(event: LiquidityAdded): void {
  let tokenAddress = event.parameters[0].value.toAddress();
  let token = Token.load(tokenAddress.toHexString().toLowerCase());
  if (token === null) return;

  let ethAmount = event.parameters[1].value.toBigInt();
  let tokenAmount = event.parameters[2].value.toBigInt();

  if (token.ethBalance === null) token.ethBalance = ZERO_BI;
  if (token.tokenBalance === null) token.tokenBalance = ZERO_BI;

  token.ethBalance = token.ethBalance!.plus(ethAmount);
  token.tokenBalance = token.tokenBalance!.plus(tokenAmount);
  token.totalLiquidityAdded = token.totalLiquidityAdded.plus(ethAmount);
  token.save();

  // provider is not in ABI -> take tx.from
  let providerAddr = event.transaction.from;
  let provider = getOrCreateUser(providerAddr, event.block.timestamp);
  let isNewProvider = provider.totalLiquidityAdded.equals(ZERO_BI);
  provider.totalLiquidityAdded = provider.totalLiquidityAdded.plus(ethAmount);
  updateUserActivity(provider, event.block.timestamp);

  // LiquidityEvent
  let eventId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  let liquidityEvent = new LiquidityEvent(eventId);
  liquidityEvent.token = token.id;
  liquidityEvent.provider = provider.id;
  liquidityEvent.type = "ADD";
  liquidityEvent.ethAmount = ethAmount;
  liquidityEvent.tokenAmount = tokenAmount;
  liquidityEvent.tokenPerEth = token.tokenPerEth === null ? ZERO_BI : token.tokenPerEth!;
  liquidityEvent.timestamp = event.block.timestamp;
  liquidityEvent.blockNumber = event.block.number;
  liquidityEvent.txHash = event.transaction.hash;
  liquidityEvent.save();

  // Protocol stats
  let protocolStats = getOrCreateProtocolStats(event.block.timestamp, event.block.number);
  protocolStats.currentTotalLiquidityETH = protocolStats.currentTotalLiquidityETH.plus(ethAmount);
  protocolStats.totalLiquidityAddedETH = protocolStats.totalLiquidityAddedETH.plus(ethAmount);
  if (isNewProvider) protocolStats.totalLiquidityProviders = protocolStats.totalLiquidityProviders + 1;
  updateProtocolActivity(protocolStats, event.block.timestamp, event.block.number);

  // Daily stats
  let dailyStats = getOrCreateDailyStats(event.block.timestamp);
  dailyStats.liquidityAddedETH = dailyStats.liquidityAddedETH.plus(ethAmount);
  dailyStats.transactions = dailyStats.transactions + 1;
  dailyStats.save();
}

/**
 * LiquidityWithdrawn(token, ethAmount, tokenAmount) (assumed)
 * If your order is (token, tokenAmount, ethAmount) — swap indices 1 and 2 below.
 */
export function handleLiquidityWithdrawn(event: LiquidityWithdrawn): void {
  let tokenAddress = event.parameters[0].value.toAddress();
  let token = Token.load(tokenAddress.toHexString().toLowerCase());
  if (token === null) return;

  let ethAmount = event.parameters[1].value.toBigInt();
  let tokenAmount = event.parameters[2].value.toBigInt();

  if (token.ethBalance === null) token.ethBalance = ZERO_BI;
  if (token.tokenBalance === null) token.tokenBalance = ZERO_BI;

  token.ethBalance = token.ethBalance!.minus(ethAmount);
  token.tokenBalance = token.tokenBalance!.minus(tokenAmount);
  token.totalLiquidityRemoved = token.totalLiquidityRemoved.plus(ethAmount);
  token.save();

  let providerAddr = event.transaction.from;
  let provider = getOrCreateUser(providerAddr, event.block.timestamp);
  provider.totalLiquidityRemoved = provider.totalLiquidityRemoved.plus(ethAmount);
  updateUserActivity(provider, event.block.timestamp);

  // LiquidityEvent
  let eventId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  let liquidityEvent = new LiquidityEvent(eventId);
  liquidityEvent.token = token.id;
  liquidityEvent.provider = provider.id;
  liquidityEvent.type = "REMOVE";
  liquidityEvent.ethAmount = ethAmount;
  liquidityEvent.tokenAmount = tokenAmount;
  liquidityEvent.tokenPerEth = token.tokenPerEth === null ? ZERO_BI : token.tokenPerEth!;
  liquidityEvent.timestamp = event.block.timestamp;
  liquidityEvent.blockNumber = event.block.number;
  liquidityEvent.txHash = event.transaction.hash;
  liquidityEvent.save();

  // Protocol stats
  let protocolStats = getOrCreateProtocolStats(event.block.timestamp, event.block.number);
  protocolStats.currentTotalLiquidityETH = protocolStats.currentTotalLiquidityETH.minus(ethAmount);
  protocolStats.totalLiquidityRemovedETH = protocolStats.totalLiquidityRemovedETH.plus(ethAmount);
  updateProtocolActivity(protocolStats, event.block.timestamp, event.block.number);

  // Daily stats
  let dailyStats = getOrCreateDailyStats(event.block.timestamp);
  dailyStats.liquidityRemovedETH = dailyStats.liquidityRemovedETH.plus(ethAmount);
  dailyStats.transactions = dailyStats.transactions + 1;
  dailyStats.save();
}

/**
 * RateUpdated(token, tokenPerEth)
 */
export function handleRateUpdated(event: RateUpdated): void {
  let tokenAddress = event.parameters[0].value.toAddress();
  let token = Token.load(tokenAddress.toHexString().toLowerCase());
  if (token === null) return;

  let tokenPerEth = event.parameters[1].value.toBigInt();
  token.tokenPerEth = tokenPerEth;
  token.save();
}

/**
 * Bought(buyer, token, ethIn, tokensOut)
 */
export function handleBought(event: Bought): void {
  let buyer = event.parameters[0].value.toAddress();
  let tokenAddress = event.parameters[1].value.toAddress();
  let ethIn = event.parameters[2].value.toBigInt();
  let tokensOut = event.parameters[3].value.toBigInt();

  let token = Token.load(tokenAddress.toHexString().toLowerCase());
  if (token === null) return;

  if (token.ethBalance === null) token.ethBalance = ZERO_BI;
  if (token.tokenBalance === null) token.tokenBalance = ZERO_BI;

  token.totalBuyVolume = token.totalBuyVolume.plus(ethIn);
  token.totalBuyCount = token.totalBuyCount + 1;
  token.ethBalance = token.ethBalance!.plus(ethIn);
  token.tokenBalance = token.tokenBalance!.minus(tokensOut);
  token.save();

  // Swap entity
  let swapId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  let swap = new Swap(swapId);
  swap.token = token.id;
  swap.user = buyer.toHexString().toLowerCase();
  swap.type = "BUY";
  swap.ethAmount = ethIn;
  swap.tokenAmount = tokensOut;
  swap.timestamp = event.block.timestamp;
  swap.blockNumber = event.block.number;
  swap.txHash = event.transaction.hash;
  swap.save();

  // User stats
  let user = getOrCreateUser(buyer, event.block.timestamp);
  let isNewTrader = user.totalBuys == 0 && user.totalSells == 0;
  user.totalBuys = user.totalBuys + 1;
  user.totalBuyVolume = user.totalBuyVolume.plus(ethIn);
  updateUserActivity(user, event.block.timestamp);

  // Protocol stats
  let protocolStats = getOrCreateProtocolStats(event.block.timestamp, event.block.number);
  protocolStats.totalSwaps = protocolStats.totalSwaps + 1;
  protocolStats.totalBuys = protocolStats.totalBuys + 1;
  protocolStats.totalVolumeETH = protocolStats.totalVolumeETH.plus(ethIn);
  protocolStats.totalVolumeUSD = protocolStats.totalVolumeUSD.plus(estimateUSDValue(ethIn));
  if (isNewTrader) protocolStats.totalTraders = protocolStats.totalTraders + 1;
  updateProtocolActivity(protocolStats, event.block.timestamp, event.block.number);

  // Daily stats
  let dailyStats = getOrCreateDailyStats(event.block.timestamp);
  dailyStats.swaps = dailyStats.swaps + 1;
  dailyStats.buys = dailyStats.buys + 1;
  dailyStats.volumeETH = dailyStats.volumeETH.plus(ethIn);
  dailyStats.volumeUSD = dailyStats.volumeUSD.plus(estimateUSDValue(ethIn));
  dailyStats.transactions = dailyStats.transactions + 1;
  dailyStats.save();
}

/**
 * Sold(seller, token, tokensIn, ethOut)
 */
export function handleSold(event: Sold): void {
  let seller = event.parameters[0].value.toAddress();
  let tokenAddress = event.parameters[1].value.toAddress();
  let tokensIn = event.parameters[2].value.toBigInt();
  let ethOut = event.parameters[3].value.toBigInt();

  let token = Token.load(tokenAddress.toHexString().toLowerCase());
  if (token === null) return;

  if (token.ethBalance === null) token.ethBalance = ZERO_BI;
  if (token.tokenBalance === null) token.tokenBalance = ZERO_BI;

  token.totalSellVolume = token.totalSellVolume.plus(ethOut);
  token.totalSellCount = token.totalSellCount + 1;
  token.ethBalance = token.ethBalance!.minus(ethOut);
  token.tokenBalance = token.tokenBalance!.plus(tokensIn);
  token.save();

  // Swap entity
  let swapId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  let swap = new Swap(swapId);
  swap.token = token.id;
  swap.user = seller.toHexString().toLowerCase();
  swap.type = "SELL";
  swap.ethAmount = ethOut;
  swap.tokenAmount = tokensIn;
  swap.timestamp = event.block.timestamp;
  swap.blockNumber = event.block.number;
  swap.txHash = event.transaction.hash;
  swap.save();

  // User stats
  let user = getOrCreateUser(seller, event.block.timestamp);
  let isNewTrader = user.totalBuys == 0 && user.totalSells == 0;
  user.totalSells = user.totalSells + 1;
  user.totalSellVolume = user.totalSellVolume.plus(ethOut);
  updateUserActivity(user, event.block.timestamp);

  // Protocol stats
  let protocolStats = getOrCreateProtocolStats(event.block.timestamp, event.block.number);
  protocolStats.totalSwaps = protocolStats.totalSwaps + 1;
  protocolStats.totalSells = protocolStats.totalSells + 1;
  protocolStats.totalVolumeETH = protocolStats.totalVolumeETH.plus(ethOut);
  protocolStats.totalVolumeUSD = protocolStats.totalVolumeUSD.plus(estimateUSDValue(ethOut));
  if (isNewTrader) protocolStats.totalTraders = protocolStats.totalTraders + 1;
  updateProtocolActivity(protocolStats, event.block.timestamp, event.block.number);

  // Daily stats
  let dailyStats = getOrCreateDailyStats(event.block.timestamp);
  dailyStats.swaps = dailyStats.swaps + 1;
  dailyStats.sells = dailyStats.sells + 1;
  dailyStats.volumeETH = dailyStats.volumeETH.plus(ethOut);
  dailyStats.volumeUSD = dailyStats.volumeUSD.plus(estimateUSDValue(ethOut));
  dailyStats.transactions = dailyStats.transactions + 1;
  dailyStats.save();
}
