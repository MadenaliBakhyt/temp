import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { areContractsDeployed } from '@/lib/contracts';

const features = [
  {
    to: '/create',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M12 4v16m8-8H4" />
      </svg>
    ),
    title: 'Create Tokens',
    description: 'Deploy ERC-20 tokens with custom supply, decimals, and hard cap.',
  },
  {
    to: '/swap',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    ),
    title: 'Swap',
    description: 'Buy and sell listed tokens for ETH at fixed rates via the DEX.',
  },
  {
    to: '/balances',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    title: 'Balances',
    description: 'View your ETH and token holdings across all created tokens.',
  },
  {
    to: '/analytics',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Analytics',
    description: 'On-chain statistics: token count, liquidity, and market data.',
  },
  {
    to: '/admin',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Admin Panel',
    description: 'List tokens, set exchange rates, and manage DEX liquidity.',
  },
  {
    to: '/profile',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    title: 'Profile',
    description: 'Sign in with Ethereum and manage your on-chain identity.',
  },
];

export function Home() {
  const { isConnected } = useAccount();
  const contractsDeployed = areContractsDeployed();

  return (
    <div className="max-w-5xl mx-auto">
      {/* Alerts */}
      {!contractsDeployed && (
        <div className="mb-6 px-4 py-3 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-3">
          <svg className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-amber-800">
            Contracts not configured. Set <code className="font-mono bg-amber-100 px-1 rounded">VITE_FACTORY_ADDRESS</code> and <code className="font-mono bg-amber-100 px-1 rounded">VITE_SWAP_ADDRESS</code> in <code className="font-mono bg-amber-100 px-1 rounded">dapp/.env</code>.
          </p>
        </div>
      )}

      {/* Hero */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="badge badge-blue">Sepolia Testnet</span>
          <span className="badge badge-green">v1.0</span>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-4 leading-tight">
          Token Factory &<br />
          <span className="text-gradient">Decentralized Exchange</span>
        </h1>
        <p className="text-slate-500 text-lg max-w-xl leading-relaxed">
          Create ERC-20 tokens, add them to the DEX, and swap on Sepolia testnet.
          Full-stack Web3 application with on-chain analytics.
        </p>
        {!isConnected && (
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-md">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Connect your wallet to get started
          </div>
        )}
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {features.map((f) => (
          <Link
            key={f.to}
            to={f.to}
            className="card hover:border-primary-300 hover:shadow-md transition-all duration-150 group"
          >
            <div className="w-9 h-9 rounded-md bg-primary-50 text-primary-600 flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
              {f.icon}
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">{f.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
          </Link>
        ))}
      </div>

      {/* Stack */}
      <div className="border-t border-slate-200 pt-8">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-4">Built with</p>
        <div className="flex flex-wrap gap-2">
          {['Solidity 0.8.24', 'Hardhat', 'OpenZeppelin 5', 'React 18', 'wagmi v2', 'viem', 'Tailwind CSS', 'Sepolia'].map((tech) => (
            <span key={tech} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded font-medium">
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
