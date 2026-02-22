import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { areContractsDeployed } from '@/lib/contracts';

export function Home() {
  const { isConnected } = useAccount();
  const contractsDeployed = areContractsDeployed();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-6">
          Welcome to <span className="text-gradient">TokenFactory</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Create your own ERC-20 tokens and swap them on Sepolia testnet.
          Build, test, and learn Web3 development.
        </p>
        {!isConnected && (
          <div className="inline-block px-6 py-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              👋 Connect your wallet to get started
            </p>
          </div>
        )}
        {!contractsDeployed && (
          <div className="mt-4 inline-block px-6 py-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">
              ⚠️ Contracts not deployed. Update .env with deployed addresses.
            </p>
          </div>
        )}
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        <Link to="/create" className="card hover:shadow-lg transition-shadow">
          <div className="text-4xl mb-4"></div>
          <h3 className="text-xl font-bold mb-2">Create Tokens</h3>
          <p className="text-gray-600">
            Deploy your own ERC-20 tokens with custom supply, decimals, and cap.
          </p>
        </Link>

        <Link to="/swap" className="card hover:shadow-lg transition-shadow">
          <div className="text-4xl mb-4"></div>
          <h3 className="text-xl font-bold mb-2">Swap Tokens</h3>
          <p className="text-gray-600">
            Trade tokens for ETH at fixed rates on our simple DEX.
          </p>
        </Link>

        <Link to="/balances" className="card hover:shadow-lg transition-shadow">
          <div className="text-4xl mb-4"></div>
          <h3 className="text-xl font-bold mb-2">View Balances</h3>
          <p className="text-gray-600">
            Check your ETH and token balances, manage approvals.
          </p>
        </Link>

        <Link to="/admin" className="card hover:shadow-lg transition-shadow">
          <div className="text-4xl mb-4"></div>
          <h3 className="text-xl font-bold mb-2">Admin Panel</h3>
          <p className="text-gray-600">
            List tokens, set rates, and manage liquidity (owner only).
          </p>
        </Link>

        <Link to="/profile" className="card hover:shadow-lg transition-shadow">
          <div className="text-4xl mb-4"></div>
          <h3 className="text-xl font-bold mb-2">User Profile</h3>
          <p className="text-gray-600">
            Sign in with Ethereum and manage your profile.
          </p>
        </Link>

        <Link to="/analytics" className="card hover:shadow-lg transition-shadow">
          <div className="text-4xl mb-4"></div>
          <h3 className="text-xl font-bold mb-2">Analytics</h3>
          <p className="text-gray-600">
            View on-chain activity and market statistics.
          </p>
        </Link>
      </div>

      {/* Tech Stack */}

    </div>
  );
}
