import { Address } from 'viem';
import { useToken } from '@/hooks/useToken';
import { formatTokenAmount, formatAddress } from '@/lib/format';

interface TokenCardProps {
  address: Address;
  onSelect?: (address: Address) => void;
}

export function TokenCard({ address, onSelect }: TokenCardProps) {
  const { name, symbol, decimals, totalSupply, cap, owner } = useToken(address);

  return (
    <div
      className={`card hover:shadow-md transition-shadow ${
        onSelect ? 'cursor-pointer' : ''
      }`}
      onClick={() => onSelect?.(address)}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold">{name || 'Loading...'}</h3>
          <p className="text-sm text-gray-600">{symbol}</p>
        </div>
        <div className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
          {decimals} decimals
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Total Supply:</span>
          <span className="font-medium">
            {formatTokenAmount(totalSupply, decimals)} {symbol}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Cap:</span>
          <span className="font-medium">
            {formatTokenAmount(cap, decimals)} {symbol}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Owner:</span>
          <span className="font-mono text-xs">{formatAddress(owner)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Address:</span>
          <a
            href={`https://sepolia.etherscan.io/token/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-primary-600 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {formatAddress(address)}
          </a>
        </div>
      </div>
    </div>
  );
}
