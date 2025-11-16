import { SUBGRAPH_URL } from './contracts';
import { GraphToken, GraphMarketStat, GraphTrade, GraphUserActivity } from '@/types';

/**
 * Execute a GraphQL query against The Graph subgraph
 */
async function executeQuery<T>(query: string, variables?: Record<string, any>): Promise<T> {
  if (!SUBGRAPH_URL) {
    throw new Error('Subgraph URL not configured');
  }

  const response = await fetch(SUBGRAPH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data;
}

/**
 * Get all tokens ordered by creation count
 */
export async function getTopTokens(limit: number = 10): Promise<GraphToken[]> {
  const query = `
    query GetTopTokens($limit: Int!) {
      tokens(first: $limit, orderBy: totalCreated, orderDirection: desc) {
        id
        name
        symbol
        creator
        totalCreated
      }
    }
  `;

  const data = await executeQuery<{ tokens: GraphToken[] }>(query, { limit });
  return data.tokens;
}

/**
 * Get market stats for top tokens by volume
 */
export async function getTopMarkets(limit: number = 10): Promise<GraphMarketStat[]> {
  const query = `
    query GetTopMarkets($limit: Int!) {
      marketStats(first: $limit, orderBy: volumeEth, orderDirection: desc) {
        id
        token {
          id
          name
          symbol
        }
        totalBought
        totalSold
        volumeEth
        volumeToken
      }
    }
  `;

  const data = await executeQuery<{ marketStats: GraphMarketStat[] }>(query, { limit });
  return data.marketStats;
}

/**
 * Get recent trades
 */
export async function getRecentTrades(limit: number = 20, skip: number = 0): Promise<GraphTrade[]> {
  const query = `
    query GetRecentTrades($limit: Int!, $skip: Int!) {
      trades(first: $limit, skip: $skip, orderBy: timestamp, orderDirection: desc) {
        id
        token {
          id
          name
          symbol
        }
        buyer
        seller
        ethAmount
        tokenAmount
        timestamp
      }
    }
  `;

  const data = await executeQuery<{ trades: GraphTrade[] }>(query, { limit, skip });
  return data.trades;
}

/**
 * Get user activity summary
 */
export async function getUserActivity(address: string): Promise<GraphUserActivity | null> {
  const query = `
    query GetUserActivity($address: String!) {
      userActivity(id: $address) {
        id
        buys
        sells
        createdCount
      }
    }
  `;

  const data = await executeQuery<{ userActivity: GraphUserActivity | null }>(query, {
    address: address.toLowerCase()
  });
  return data.userActivity;
}

/**
 * Get total statistics
 */
export async function getTotalStats(): Promise<{
  totalTokens: number;
  totalTrades: number;
  totalVolume: string;
}> {
  const query = `
    query GetTotalStats {
      tokens(first: 1000) {
        id
      }
      trades(first: 1000) {
        id
        ethAmount
      }
    }
  `;

  const data = await executeQuery<{
    tokens: { id: string }[];
    trades: { id: string; ethAmount: string }[];
  }>(query);

  const totalVolume = data.trades.reduce((sum, trade) => {
    return sum + BigInt(trade.ethAmount);
  }, 0n);

  return {
    totalTokens: data.tokens.length,
    totalTrades: data.trades.length,
    totalVolume: totalVolume.toString(),
  };
}
