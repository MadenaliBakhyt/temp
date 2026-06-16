import { useReadContract } from 'wagmi';
import { Address, formatEther } from 'viem';
import { FACTORY_ADDRESS, SWAP_ADDRESS } from '@/lib/contracts';
import TokenFactoryAbi from '@/abi/TokenFactory.json';
import SimpleSwapAbi from '@/abi/SimpleSwap.json';
import { useTokenInfo } from '@/hooks/useSimpleSwap';
import { useToken } from '@/hooks/useToken';
import { formatAddress } from '@/lib/format';

function ListedTokenRow({ address }: { address: Address }) {
  const info = useTokenInfo(address);
  const token = useToken(address);

  if (!info.tokenInfo) return null;

  return (
    <tr className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
      <td className="py-3 px-4">
        <div className="font-medium text-slate-900 text-sm">{token.name || '—'}</div>
        <div className="text-xs text-slate-400 font-mono">{token.symbol || '—'}</div>
      </td>
      <td className="py-3 px-4">
        <span className="font-mono text-xs text-slate-500">{formatAddress(address)}</span>
      </td>
      <td className="py-3 px-4 text-sm text-slate-700 text-right">
        {formatEther(info.tokenInfo.tokenPerEth)} <span className="text-slate-400 text-xs">tokens/ETH</span>
      </td>
      <td className="py-3 px-4 text-sm text-slate-700 text-right">
        {parseFloat(formatEther(info.tokenInfo.ethBalance)).toFixed(4)} <span className="text-slate-400 text-xs">ETH</span>
      </td>
      <td className="py-3 px-4 text-right">
        <span className={`badge ${info.tokenInfo.isListed ? 'badge-green' : 'badge-red'}`}>
          {info.tokenInfo.isListed ? 'Active' : 'Delisted'}
        </span>
      </td>
    </tr>
  );
}

export function Analytics() {
  const { data: allTokensRaw } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: TokenFactoryAbi.abi,
    functionName: 'getAllTokens',
  });

  const { data: listedTokensRaw } = useReadContract({
    address: SWAP_ADDRESS,
    abi: SimpleSwapAbi.abi,
    functionName: 'getListedTokens',
  });

  const allTokens = (allTokensRaw as Address[]) || [];
  const listedTokens = (listedTokensRaw as Address[]) || [];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-header mb-0">Analytics</h1>
        <span className="badge badge-blue">Live — Sepolia</span>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="stat-card">
          <div className="stat-label">Tokens Created</div>
          <div className="stat-value">{allTokens.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Listed on DEX</div>
          <div className="stat-value">{listedTokens.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Network</div>
          <div className="text-xl font-bold text-slate-900 mt-1">Sepolia</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Chain ID</div>
          <div className="text-xl font-bold text-slate-900 mt-1 font-mono">11155111</div>
        </div>
      </div>

      {/* Listed Tokens Table */}
      <div className="card p-0 overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h2 className="section-header mb-0">DEX Markets</h2>
          <span className="text-xs text-slate-400">{listedTokens.length} active markets</span>
        </div>

        {listedTokens.length === 0 ? (
          <div className="px-4 py-10 text-center text-slate-400 text-sm">
            No tokens listed on the DEX yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50">
                  <th className="py-2.5 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Token</th>
                  <th className="py-2.5 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Address</th>
                  <th className="py-2.5 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Rate</th>
                  <th className="py-2.5 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">ETH Liquidity</th>
                  <th className="py-2.5 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {listedTokens.map((addr) => (
                  <ListedTokenRow key={addr} address={addr} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* All Tokens Created */}
      <div className="card p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h2 className="section-header mb-0">All Created Tokens</h2>
          <span className="text-xs text-slate-400">{allTokens.length} tokens</span>
        </div>

        {allTokens.length === 0 ? (
          <div className="px-4 py-10 text-center text-slate-400 text-sm">
            No tokens created yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {allTokens.map((addr, i) => (
              <div key={addr} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-5 text-right">{i + 1}</span>
                  <span className="font-mono text-sm text-slate-700">{formatAddress(addr)}</span>
                </div>
                <a
                  href={`https://sepolia.etherscan.io/address/${addr}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary-600 hover:text-primary-700 hover:underline"
                >
                  View on Etherscan
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
