import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { formatAddress } from '@/lib/format';

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <button
        onClick={() => disconnect()}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700
                   text-slate-200 text-xs font-medium rounded border border-slate-700
                   hover:border-slate-600 transition-colors"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        {formatAddress(address)}
      </button>
    );
  }

  return (
    <div className="flex gap-2">
      {connectors.slice(0, 1).map((connector) => (
        <button
          key={connector.id}
          onClick={() => connect({ connector })}
          className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white
                     text-xs font-medium rounded transition-colors"
        >
          Connect Wallet
        </button>
      ))}
    </div>
  );
}
