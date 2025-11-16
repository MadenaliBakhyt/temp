import { useState, useEffect } from 'react';
import { Address, parseEther } from 'viem';
import { useAccount } from 'wagmi';
import { useSimpleSwap, useTokenInfo } from '@/hooks/useSimpleSwap';
import { useToken, useTokenBalance, useTokenApprove, useTokenAllowance } from '@/hooks/useToken';
import { SWAP_ADDRESS } from '@/lib/contracts';
import { formatTokenAmount, parseTokenAmount, isValidAmount } from '@/lib/format';
import { TxToast } from './TxToast';

interface SwapFormProps {
  tokenAddress: Address;
}

export function SwapForm({ tokenAddress }: SwapFormProps) {
  const { address: userAddress } = useAccount();
  const { symbol, decimals } = useToken(tokenAddress);
  const { tokenInfo } = useTokenInfo(tokenAddress);
  const { balance } = useTokenBalance(tokenAddress, userAddress);
  const { allowance, refetch: refetchAllowance } = useTokenAllowance(
    tokenAddress,
    userAddress,
    SWAP_ADDRESS
  );

  const { buyToken, sellToken, hash, isPending, isConfirming, isSuccess, error } = useSimpleSwap();
  const {
    approve,
    hash: approveHash,
    isPending: isApprovePending,
    isConfirming: isApproveConfirming,
    isSuccess: isApproveSuccess,
  } = useTokenApprove();

  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [preview, setPreview] = useState('0');

  useEffect(() => {
    if (isApproveSuccess) {
      refetchAllowance();
    }
  }, [isApproveSuccess, refetchAllowance]);

  useEffect(() => {
    if (!amount || !tokenInfo || !isValidAmount(amount)) {
      setPreview('0');
      return;
    }

    try {
      if (mode === 'buy') {
        // Calculate tokens out: ethIn * tokenPerEth / 1e18
        const ethIn = parseEther(amount);
        const tokensOut = (ethIn * tokenInfo.tokenPerEth) / BigInt(1e18);
        setPreview(formatTokenAmount(tokensOut, decimals));
      } else {
        // Calculate ETH out: tokensIn * 1e18 / tokenPerEth
        const tokensIn = parseTokenAmount(amount, decimals);
        const ethOut = (tokensIn * BigInt(1e18)) / tokenInfo.tokenPerEth;
        setPreview(formatTokenAmount(ethOut, 18));
      }
    } catch {
      setPreview('0');
    }
  }, [amount, mode, tokenInfo, decimals]);

  const handleSwap = () => {
    if (!isValidAmount(amount)) return;

    if (mode === 'buy') {
      buyToken(tokenAddress, amount);
    } else {
      const tokenAmount = parseTokenAmount(amount, decimals);
      sellToken(tokenAddress, tokenAmount);
    }
  };

  const handleApprove = () => {
    if (!isValidAmount(amount)) return;
    const tokenAmount = parseTokenAmount(amount, decimals);
    approve(tokenAddress, SWAP_ADDRESS, tokenAmount);
  };

  const needsApproval = mode === 'sell' && allowance < parseTokenAmount(amount, decimals);

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6">Swap {symbol}</h2>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode('buy')}
          className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
            mode === 'buy'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setMode('sell')}
          className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
            mode === 'sell'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Sell
        </button>
      </div>

      {/* Input */}
      <div className="mb-4">
        <label className="label">
          {mode === 'buy' ? 'ETH Amount' : `${symbol} Amount`}
        </label>
        <input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.0"
          className="input"
        />
        {mode === 'sell' && (
          <div className="mt-1 text-sm text-gray-600">
            Balance: {formatTokenAmount(balance, decimals)} {symbol}
          </div>
        )}
      </div>

      {/* Preview */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600 mb-1">You will receive</div>
        <div className="text-2xl font-bold">
          {preview} {mode === 'buy' ? symbol : 'ETH'}
        </div>
      </div>

      {/* Exchange Rate Info */}
      {tokenInfo && (
        <div className="mb-6 text-sm text-gray-600 space-y-1">
          <div className="flex justify-between">
            <span>Rate:</span>
            <span>
              1 ETH = {formatTokenAmount(tokenInfo.tokenPerEth, decimals)} {symbol}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Pool Liquidity:</span>
            <span>
              {formatTokenAmount(tokenInfo.tokenBalance, decimals)} {symbol} /{' '}
              {formatTokenAmount(tokenInfo.ethBalance, 18)} ETH
            </span>
          </div>
        </div>
      )}

      {/* Action Button */}
      {needsApproval ? (
        <button
          onClick={handleApprove}
          disabled={!isValidAmount(amount) || isApprovePending || isApproveConfirming}
          className="btn btn-primary w-full"
        >
          {isApprovePending || isApproveConfirming ? 'Approving...' : 'Approve'}
        </button>
      ) : (
        <button
          onClick={handleSwap}
          disabled={!isValidAmount(amount) || isPending || isConfirming}
          className="btn btn-primary w-full"
        >
          {isPending || isConfirming ? 'Processing...' : mode === 'buy' ? 'Buy' : 'Sell'}
        </button>
      )}

      {/* Transaction Status */}
      <TxToast
        hash={hash || approveHash}
        isPending={isPending || isApprovePending}
        isConfirming={isConfirming || isApproveConfirming}
        isSuccess={isSuccess || isApproveSuccess}
        error={error}
      />
    </div>
  );
}
