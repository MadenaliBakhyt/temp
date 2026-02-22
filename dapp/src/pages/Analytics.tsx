import { useState, useEffect } from 'react';
import { SUBGRAPH_URL } from '@/lib/contracts';
import { formatCompactNumber } from '@/lib/format';

export function Analytics() {
  const [error, setError] = useState<string | null>(null);

  if (!SUBGRAPH_URL) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card text-center">
          <div className="text-4xl mb-4">📊</div>
          <h2 className="text-2xl font-bold mb-2">Subgraph Not Configured</h2>
          <p className="text-gray-600 mb-4">
            The Graph subgraph URL is not set in environment variables.
          </p>
          <p className="text-sm text-gray-500">
            Update VITE_SUBGRAPH_URL in .env file after deploying your subgraph.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Analytics</h1>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card text-center">
          <div className="text-4xl mb-2">🏭</div>
          <div className="text-3xl font-bold mb-1">-</div>
          <div className="text-gray-600">Total Tokens</div>
        </div>
        <div className="card text-center">
          <div className="text-4xl mb-2">🔄</div>
          <div className="text-3xl font-bold mb-1">-</div>
          <div className="text-gray-600">Total Trades</div>
        </div>
        <div className="card text-center">
          <div className="text-4xl mb-2">💰</div>
          <div className="text-3xl font-bold mb-1">-</div>
          <div className="text-gray-600">Total Volume (ETH)</div>
        </div>
      </div>

      {/* Placeholder */}

    </div>
  );
}
