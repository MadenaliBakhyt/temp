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
        className="btn btn-secondary"
      >
        {formatAddress(address)}
      </button>
    );
  }

  return (
    <div className="flex gap-2">
      {connectors.map((connector) => (
        <button
          key={connector.id}
          onClick={() => connect({ connector })}
          className="btn btn-primary"
        >
          Connect {connector.name}
        </button>
      ))}
    </div>
  );
}
