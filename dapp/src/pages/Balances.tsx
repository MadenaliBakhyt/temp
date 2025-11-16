import { useAccount, useBalance } from 'wagmi';
import { useAllTokens } from '@/hooks/useTokenFactory';
import { useToken, useTokenBalance } from '@/hooks/useToken';
import { formatTokenAmount } from '@/lib/format';
import { Address } from 'viem';

function TokenBalance({ address: tokenAddress, userAddress }: { address: Address; userAddress: Address }) {
  const { name, symbol, decimals } = useToken(tokenAddress);
  const { balance } = useTokenBalance(tokenAddress, userAddress);

  if (balance === 0n) return null;

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div>
        <div className="font-semibold">{name}</div>
        <div className="text-sm text-gray-600">{symbol}</div>
      </div>
      <div className="text-right">
        <div className="font-semibold">{formatTokenAmount(balance, decimals)}</div>
        <div className="text-sm text-gray-600">{symbol}</div>
      </div>
    </div>
  );
}

export function Balances() {
  const { address, isConnected } = useAccount();
  const { data: ethBalance } = useBalance({ address });
  const { tokens } = useAllTokens();

  if (!isConnected || !address) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <div className="text-4xl mb-4">🔌</div>
          <h2 className="text-2xl font-bold mb-2">Wallet Not Connected</h2>
          <p className="text-gray-600">Please connect your wallet to view balances.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Your Balances</h1>

      {/* ETH Balance */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-4">ETH Balance</h2>
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg">
          <div>
            <div className="font-semibold">Ethereum</div>
            <div className="text-sm text-gray-600">ETH</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {ethBalance ? Number(ethBalance.formatted).toFixed(4) : '0.0000'}
            </div>
            <div className="text-sm text-gray-600">ETH</div>
          </div>
        </div>
      </div>

      {/* Token Balances */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Token Balances</h2>
        {tokens.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📭</div>
            <p>No tokens created yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tokens.map((tokenAddress) => (
              <TokenBalance
                key={tokenAddress}
                address={tokenAddress}
                userAddress={address}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
