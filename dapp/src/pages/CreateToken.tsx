import { useState } from 'react';
import { useAccount } from 'wagmi';
import { parseUnits } from 'viem';
import { useTokenFactory } from '@/hooks/useTokenFactory';
import { TxToast } from '@/components/TxToast';

export function CreateToken() {
  const { address, isConnected } = useAccount();
  const { createToken, hash, isPending, isConfirming, isSuccess, error } = useTokenFactory();

  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    decimals: '18',
    initialSupply: '',
    cap: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const decimals = parseInt(formData.decimals);
    const initialSupply = parseUnits(formData.initialSupply, decimals);
    const cap = parseUnits(formData.cap, decimals);

    createToken(formData.name, formData.symbol, decimals, initialSupply, cap);
  };

  const isFormValid =
    formData.name &&
    formData.symbol &&
    formData.decimals &&
    formData.initialSupply &&
    formData.cap &&
    parseFloat(formData.cap) >= parseFloat(formData.initialSupply);

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <div className="text-4xl mb-4">🔌</div>
          <h2 className="text-2xl font-bold mb-2">Wallet Not Connected</h2>
          <p className="text-gray-600">
            Please connect your wallet to create a token.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h1 className="text-3xl font-bold mb-6">Create Your Token</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Token Name */}
          <div>
            <label className="label">Token Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="My Token"
              className="input"
              required
            />
            <p className="mt-1 text-sm text-gray-600">
              The full name of your token (e.g., "My Token")
            </p>
          </div>

          {/* Token Symbol */}
          <div>
            <label className="label">Token Symbol</label>
            <input
              type="text"
              value={formData.symbol}
              onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
              placeholder="MTK"
              className="input"
              required
            />
            <p className="mt-1 text-sm text-gray-600">
              Short identifier for your token (e.g., "MTK")
            </p>
          </div>

          {/* Decimals */}
          <div>
            <label className="label">Decimals</label>
            <select
              value={formData.decimals}
              onChange={(e) => setFormData({ ...formData, decimals: e.target.value })}
              className="input"
            >
              <option value="6">6 (like USDC)</option>
              <option value="18">18 (standard)</option>
            </select>
            <p className="mt-1 text-sm text-gray-600">
              Number of decimal places (18 is standard for most tokens)
            </p>
          </div>

          {/* Initial Supply */}
          <div>
            <label className="label">Initial Supply</label>
            <input
              type="text"
              value={formData.initialSupply}
              onChange={(e) => setFormData({ ...formData, initialSupply: e.target.value })}
              placeholder="1000"
              className="input"
              required
            />
            <p className="mt-1 text-sm text-gray-600">
              Amount of tokens to mint initially (will be sent to your address)
            </p>
          </div>

          {/* Cap */}
          <div>
            <label className="label">Maximum Supply (Cap)</label>
            <input
              type="text"
              value={formData.cap}
              onChange={(e) => setFormData({ ...formData, cap: e.target.value })}
              placeholder="10000"
              className="input"
              required
            />
            <p className="mt-1 text-sm text-gray-600">
              Maximum total supply (must be ≥ initial supply)
            </p>
            {formData.cap &&
              formData.initialSupply &&
              parseFloat(formData.cap) < parseFloat(formData.initialSupply) && (
                <p className="mt-1 text-sm text-red-600">
                  ⚠️ Cap must be greater than or equal to initial supply
                </p>
              )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormValid || isPending || isConfirming}
            className="btn btn-primary w-full"
          >
            {isPending || isConfirming ? 'Creating Token...' : 'Create Token'}
          </button>
        </form>

        {/* Success Message */}
        {isSuccess && hash && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="font-semibold text-green-800 mb-2">✅ Token Created Successfully!</p>
            <p className="text-sm text-gray-600">
              Your token has been deployed. Check the transaction on{' '}
              <a
                href={`https://sepolia.etherscan.io/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:underline"
              >
                Etherscan
              </a>
              .
            </p>
          </div>
        )}

        <TxToast
          hash={hash}
          isPending={isPending}
          isConfirming={isConfirming}
          isSuccess={isSuccess}
          error={error}
        />
      </div>

      {/* Info Card */}

    </div>
  );
}
