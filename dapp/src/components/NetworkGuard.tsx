import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { CHAIN_ID } from '@/lib/contracts';
import { sepolia } from 'wagmi/chains';

export function NetworkGuard({ children }: { children: React.ReactNode }) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  if (!isConnected) {
    return <>{children}</>;
  }

  if (chainId !== CHAIN_ID) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="card max-w-md text-center">
          <div className="text-red-600 text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4">Wrong Network</h2>
          <p className="text-gray-600 mb-6">
            Please switch to {sepolia.name} (Chain ID: {CHAIN_ID})
          </p>
          <button
            onClick={() => switchChain({ chainId: CHAIN_ID })}
            className="btn btn-primary w-full"
          >
            Switch to {sepolia.name}
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
