import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from './lib/wagmi';
import { NetworkGuard } from './components/NetworkGuard';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { CreateToken } from './pages/CreateToken';
import { Swap } from './pages/Swap';
import { Balances } from './pages/Balances';
import { Admin } from './pages/Admin';
import { Profile } from './pages/Profile';
import { Analytics } from './pages/Analytics';

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <NetworkGuard>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/create" element={<CreateToken />} />
                <Route path="/swap" element={<Swap />} />
                <Route path="/balances" element={<Balances />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/analytics" element={<Analytics />} />
              </Routes>
            </Layout>
          </NetworkGuard>
        </BrowserRouter>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
