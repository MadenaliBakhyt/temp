import { useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { Address, parseEther, parseUnits } from 'viem';
import { SWAP_ADDRESS } from '@/lib/contracts';
import SimpleSwapAbi from '@/abi/SimpleSwap.json';
import { useSwapAdmin } from '@/hooks/useSimpleSwap';
import { useAllTokens } from '@/hooks/useTokenFactory';
import { useToken, useTokenApprove, useTokenAllowance } from '@/hooks/useToken';
import { TxToast } from '@/components/TxToast';

export function Admin() {
  const { address, isConnected } = useAccount();
  const { tokens } = useAllTokens();

  const { data: swapOwner } = useReadContract({
    address: SWAP_ADDRESS,
    abi: SimpleSwapAbi.abi,
    functionName: 'owner',
  });

  const { listToken, setRate, addLiquidity, hash, isPending, isConfirming, isSuccess, error } =
    useSwapAdmin();

  const {
    approve,
    hash: approveHash,
    isPending: isApprovePending,
    isConfirming: isApproveConfirming,
    isSuccess: isApproveSuccess,
    error: approveError,
  } = useTokenApprove();

  const [formData, setFormData] = useState({
    token: '',
    tokenPerEth: '',
    minEthLiquidity: '',
    newRate: '',
    liquidityToken: '',
    liquidityEth: '',
  });

  const liquidityTokenAmount =
    formData.liquidityToken ? parseUnits(formData.liquidityToken, 18) : 0n;

  const { allowance, refetch: refetchAllowance } = useTokenAllowance(
    formData.token as Address || undefined,
    address,
    SWAP_ADDRESS,
  );

  const needsApproval = liquidityTokenAmount > 0n && allowance < liquidityTokenAmount;

  const isOwner = address && swapOwner && address.toLowerCase() === (swapOwner as string).toLowerCase();

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <div className="text-4xl mb-4">🔌</div>
          <h2 className="text-2xl font-bold mb-2">Wallet Not Connected</h2>
          <p className="text-gray-600">Please connect your wallet.</p>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <div className="text-4xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-600">Only the SimpleSwap owner can access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* List Token */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">List Token</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Token Address</label>
              <select
                value={formData.token}
                onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                className="input"
              >
                <option value="">Select a token</option>
                {tokens.map((token) => (
                  <option key={token} value={token}>
                    {token}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Tokens per ETH</label>
              <input
                type="text"
                value={formData.tokenPerEth}
                onChange={(e) => setFormData({ ...formData, tokenPerEth: e.target.value })}
                placeholder="100"
                className="input"
              />
            </div>
            <div>
              <label className="label">Min ETH Liquidity</label>
              <input
                type="text"
                value={formData.minEthLiquidity}
                onChange={(e) => setFormData({ ...formData, minEthLiquidity: e.target.value })}
                placeholder="1"
                className="input"
              />
            </div>
            <button
              onClick={() =>
                listToken(
                  formData.token as Address,
                  parseEther(formData.tokenPerEth),
                  parseEther(formData.minEthLiquidity)
                )
              }
              disabled={!formData.token || !formData.tokenPerEth || isPending}
              className="btn btn-primary w-full"
            >
              List Token
            </button>
          </div>
        </div>

        {/* Set Rate */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Update Rate</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Token Address</label>
              <select
                value={formData.token}
                onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                className="input"
              >
                <option value="">Select a token</option>
                {tokens.map((token) => (
                  <option key={token} value={token}>
                    {token}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">New Tokens per ETH</label>
              <input
                type="text"
                value={formData.newRate}
                onChange={(e) => setFormData({ ...formData, newRate: e.target.value })}
                placeholder="150"
                className="input"
              />
            </div>
            <button
              onClick={() =>
                setRate(formData.token as Address, parseEther(formData.newRate))
              }
              disabled={!formData.token || !formData.newRate || isPending}
              className="btn btn-primary w-full"
            >
              Update Rate
            </button>
          </div>
        </div>

        {/* Add Liquidity */}
        <div className="card md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Add Liquidity</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="label">Token Address</label>
              <select
                value={formData.token}
                onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                className="input"
              >
                <option value="">Select a token</option>
                {tokens.map((token) => (
                  <option key={token} value={token}>
                    {token}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Token Amount</label>
              <input
                type="text"
                value={formData.liquidityToken}
                onChange={(e) => setFormData({ ...formData, liquidityToken: e.target.value })}
                placeholder="1000"
                className="input"
              />
            </div>
            <div>
              <label className="label">ETH Amount</label>
              <input
                type="text"
                value={formData.liquidityEth}
                onChange={(e) => setFormData({ ...formData, liquidityEth: e.target.value })}
                placeholder="1"
                className="input"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            {needsApproval ? (
              <button
                onClick={() =>
                  approve(
                    formData.token as Address,
                    SWAP_ADDRESS,
                    liquidityTokenAmount,
                  )
                }
                disabled={!formData.token || !formData.liquidityToken || isApprovePending || isApproveConfirming}
                className="btn btn-secondary flex-1"
              >
                {isApprovePending || isApproveConfirming ? 'Approving...' : '1. Approve Tokens'}
              </button>
            ) : null}
            <button
              onClick={() => {
                addLiquidity(
                  formData.token as Address,
                  liquidityTokenAmount,
                  formData.liquidityEth || '0',
                );
                refetchAllowance();
              }}
              disabled={!formData.token || isPending || isConfirming || (liquidityTokenAmount > 0n && needsApproval)}
              className="btn btn-primary flex-1"
            >
              {isPending || isConfirming ? 'Adding...' : needsApproval ? '2. Add Liquidity' : 'Add Liquidity'}
            </button>
          </div>
        </div>
      </div>

      <TxToast
        hash={approveHash}
        isPending={isApprovePending}
        isConfirming={isApproveConfirming}
        isSuccess={isApproveSuccess}
        error={approveError}
      />
      <TxToast
        hash={hash}
        isPending={isPending}
        isConfirming={isConfirming}
        isSuccess={isSuccess}
        error={error}
      />
    </div>
  );
}
