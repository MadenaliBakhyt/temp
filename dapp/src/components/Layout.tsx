import { Link, useLocation } from 'react-router-dom';
import { ConnectButton } from './ConnectButton';
import { useAuth } from '@/hooks/useAuth';
import { useAccount } from 'wagmi';

const navLinks = [
  { to: '/create', label: 'Create Token' },
  { to: '/swap', label: 'Swap' },
  { to: '/balances', label: 'Balances' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/admin', label: 'Admin' },
  { to: '/profile', label: 'Profile' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { isConnected } = useAccount();
  const { isAuthenticated, login, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-primary-600 flex items-center justify-center">
                <svg viewBox="0 0 20 20" fill="white" className="w-4 h-4">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-white font-semibold text-sm tracking-tight">TokenFactory</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    location.pathname === link.to
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {isConnected && (
                <button
                  onClick={isAuthenticated ? logout : login}
                  className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white
                             border border-slate-700 hover:border-slate-500 rounded
                             transition-colors"
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
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-auto">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>TokenFactory — Sepolia Testnet</span>
            <a
              href="https://sepolia.etherscan.io"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-600 transition-colors"
            >
              Etherscan
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
