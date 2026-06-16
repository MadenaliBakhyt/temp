import { useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { Address, parseEther, parseUnits } from 'viem';
import { SWAP_ADDRESS } from '@/lib/contracts';
import SimpleSwapAbi from '@/abi/SimpleSwap.json';
import { useSwapAdmin } from '@/hooks/useSimpleSwap';
import { useAllTokens } from '@/hooks/useTokenFactory';
import { useToken, useTokenApprove, useTokenAllowance } from '@/hooks/useToken';
import { TxToast } from '@/components/TxToast';
import { formatAddress } from '@/lib/format';

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

  const isOwner =
    address &&
    swapOwner &&
    address.toLowerCase() === (swapOwner as string).toLowerCase();

  if (!isConnected) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="card text-center py-12">
          <svg className="w-10 h-10 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Wallet not connected</h2>
          <p className="text-sm text-slate-500">Connect your wallet to access the admin panel.</p>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="card text-center py-12">
          <svg className="w-10 h-10 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Access denied</h2>
          <p className="text-sm text-slate-500 mb-3">Only the SimpleSwap contract owner can access this page.</p>
          {swapOwner && (
            <p className="text-xs text-slate-400 font-mono">Owner: {formatAddress(swapOwner as string)}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-header mb-0">Admin Panel</h1>
        <span className="badge badge-green">Owner</span>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* List Token */}
        <div className="card">
          <h2 className="section-header">List Token</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Token</label>
              <select
                value={formData.token}
                onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                className="input"
              >
                <option value="">Select a token</option>
                {tokens.map((token) => (
                  <option key={token} value={token}>
                    {formatAddress(token)} — {token}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Rate (tokens per 1 ETH)</label>
              <input
                type="number"
                value={formData.tokenPerEth}
                onChange={(e) => setFormData({ ...formData, tokenPerEth: e.target.value })}
                placeholder="e.g. 1000"
                className="input"
              />
            </div>
            <div>
              <label className="label">Min ETH Liquidity</label>
              <input
                type="number"
                value={formData.minEthLiquidity}
                onChange={(e) => setFormData({ ...formData, minEthLiquidity: e.target.value })}
                placeholder="e.g. 0.01"
                className="input"
              />
            </div>
            <button
              onClick={() =>
                listToken(
                  formData.token as Address,
                  parseEther(formData.tokenPerEth || '0'),
                  parseEther(formData.minEthLiquidity || '0'),
                )
              }
              disabled={!formData.token || !formData.tokenPerEth || isPending || isConfirming}
              className="btn btn-primary w-full"
            >
              {isPending || isConfirming ? 'Listing...' : 'List Token'}
            </button>
          </div>
        </div>

        {/* Set Rate */}
        <div className="card">
          <h2 className="section-header">Update Rate</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Token</label>
              <select
                value={formData.token}
                onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                className="input"
              >
                <option value="">Select a token</option>
                {tokens.map((token) => (
                  <option key={token} value={token}>
                    {formatAddress(token)} — {token}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">New Rate (tokens per 1 ETH)</label>
              <input
                type="number"
                value={formData.newRate}
                onChange={(e) => setFormData({ ...formData, newRate: e.target.value })}
                placeholder="e.g. 1500"
                className="input"
              />
            </div>
            <button
              onClick={() =>
                setRate(formData.token as Address, parseEther(formData.newRate || '0'))
              }
              disabled={!formData.token || !formData.newRate || isPending || isConfirming}
              className="btn btn-primary w-full"
            >
              {isPending || isConfirming ? 'Updating...' : 'Update Rate'}
            </button>
          </div>
        </div>

        {/* Add Liquidity */}
        <div className="card md:col-span-2">
          <h2 className="section-header">Add Liquidity</h2>
          <p className="text-sm text-slate-500 mb-4">
            Step 1: Approve the contract to spend your tokens. Step 2: Add liquidity.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="label">Token</label>
              <select
                value={formData.token}
                onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                className="input"
              >
                <option value="">Select a token</option>
                {tokens.map((token) => (
                  <option key={token} value={token}>
                    {formatAddress(token)} — {token}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Token Amount</label>
              <input
                type="number"
                value={formData.liquidityToken}
                onChange={(e) => setFormData({ ...formData, liquidityToken: e.target.value })}
                placeholder="e.g. 10000"
                className="input"
              />
            </div>
            <div>
              <label className="label">ETH Amount</label>
              <input
                type="number"
                value={formData.liquidityEth}
                onChange={(e) => setFormData({ ...formData, liquidityEth: e.target.value })}
                placeholder="e.g. 0.1"
                className="input"
              />
            </div>
          </div>

          {/* Approval status indicator */}
          {formData.token && liquidityTokenAmount > 0n && (
            <div className={`mt-4 px-3 py-2 rounded-md text-xs flex items-center gap-2 ${
              needsApproval
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${needsApproval ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              {needsApproval
                ? 'Token approval required before adding liquidity'
                : 'Token approved — ready to add liquidity'}
            </div>
          )}

          <div className="mt-4 flex gap-3">
            {needsApproval && (
              <button
                onClick={() =>
                  approve(formData.token as Address, SWAP_ADDRESS, liquidityTokenAmount)
                }
                disabled={!formData.token || !formData.liquidityToken || isApprovePending || isApproveConfirming}
                className="btn btn-secondary flex-1"
              >
                {isApprovePending || isApproveConfirming ? 'Approving...' : '1. Approve Tokens'}
              </button>
            )}
            <button
              onClick={() => {
                addLiquidity(
                  formData.token as Address,
                  liquidityTokenAmount,
                  formData.liquidityEth || '0',
                );
                refetchAllowance();
              }}
              disabled={
                !formData.token ||
                isPending ||
                isConfirming ||
                (liquidityTokenAmount > 0n && needsApproval)
              }
              className="btn btn-primary flex-1"
            >
              {isPending || isConfirming
                ? 'Adding...'
                : needsApproval
                ? '2. Add Liquidity'
                : 'Add Liquidity'}
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
