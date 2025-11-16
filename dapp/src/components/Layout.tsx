import { Link, useLocation } from 'react-router-dom';
import { ConnectButton } from './ConnectButton';
import { useAuth } from '@/hooks/useAuth';
import { useAccount } from 'wagmi';

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { isConnected } = useAccount();
  const { isAuthenticated, login, logout } = useAuth();

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/create', label: 'Create Token' },
    { to: '/swap', label: 'Swap' },
    { to: '/balances', label: 'Balances' },
    { to: '/admin', label: 'Admin' },
    { to: '/profile', label: 'Profile' },
    { to: '/analytics', label: 'Analytics' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="text-2xl font-bold text-gradient">
              TokenFactory
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === link.to
                      ? 'text-primary-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {isConnected && (
                <button
                  onClick={isAuthenticated ? logout : login}
                  className="btn btn-secondary text-sm"
                >
                  {isAuthenticated ? 'Sign Out' : 'Sign In'}
                </button>
              )}
              <ConnectButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-600">
          <p>
            Built with ❤️ using{' '}
            <a href="https://soliditylang.org" className="text-primary-600 hover:underline">
              Solidity
            </a>
            ,{' '}
            <a href="https://hardhat.org" className="text-primary-600 hover:underline">
              Hardhat
            </a>
            ,{' '}
            <a href="https://wagmi.sh" className="text-primary-600 hover:underline">
              wagmi
            </a>
            , and{' '}
            <a href="https://thegraph.com" className="text-primary-600 hover:underline">
              The Graph
            </a>
          </p>
          <p className="mt-2 text-xs">
            ⚠️ <strong>TESTNET ONLY</strong> - Sepolia Network
          </p>
        </div>
      </footer>
    </div>
  );
}
