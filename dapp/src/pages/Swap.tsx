import { useState } from 'react';
import { Address } from 'viem';
import { useAccount } from 'wagmi';
import { useListedTokens } from '@/hooks/useSimpleSwap';
import { TokenCard } from '@/components/TokenCard';
import { SwapForm } from '@/components/SwapForm';

export function Swap() {
  const { isConnected } = useAccount();
  const { tokens, isLoading } = useListedTokens();
  const [selectedToken, setSelectedToken] = useState<Address | null>(null);

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <div className="text-4xl mb-4">🔌</div>
          <h2 className="text-2xl font-bold mb-2">Wallet Not Connected</h2>
          <p className="text-gray-600">Please connect your wallet to swap tokens.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading listed tokens...</p>
        </div>
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <div className="text-4xl mb-4">📭</div>
          <h2 className="text-2xl font-bold mb-2">No Tokens Listed</h2>
          <p className="text-gray-600 mb-4">
            No tokens are currently listed for swapping.
          </p>
          <p className="text-sm text-gray-500">
            If you're the admin, go to the Admin panel to list tokens.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Swap Tokens</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Token Selection */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Select Token</h2>
          <div className="space-y-4">
            {tokens.map((tokenAddress) => (
              <TokenCard
                key={tokenAddress}
                address={tokenAddress}
                onSelect={setSelectedToken}
              />
            ))}
          </div>
        </div>

        {/* Swap Form */}
        <div>
          {selectedToken ? (
            <SwapForm tokenAddress={selectedToken} />
          ) : (
            <div className="card text-center">
              <div className="text-4xl mb-4">👈</div>
              <h3 className="font-semibold mb-2">Select a Token</h3>
              <p className="text-gray-600">Choose a token to start swapping</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
