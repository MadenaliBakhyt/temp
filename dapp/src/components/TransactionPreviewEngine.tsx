import React, { useState, useEffect } from 'react';
import { formatEther, formatUnits, parseEther } from 'viem';
import { useAccount, useBalance, useGasPrice, useEstimateGas } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, TrendingUp, TrendingDown, Fuel, Wallet, ArrowRight, Info } from 'lucide-react';

interface TransactionPreview {
  type: 'swap' | 'stake' | 'create-token' | 'add-liquidity';
  tokenIn?: {
    symbol: string;
    amount: string;
    decimals: number;
  };
  tokenOut?: {
    symbol: string;
    amount: string;
    decimals: number;
  };
  gasEstimate?: bigint;
  liquidityImpact?: number; // percentage
  postBalance?: {
    token: string;
    amount: bigint;
  };
  warnings?: string[];
  slippage?: number;
}

interface TransactionPreviewEngineProps {
  preview: TransactionPreview | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function TransactionPreviewEngine({
  preview,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false
}: TransactionPreviewEngineProps) {
  const { address } = useAccount();
  const { data: ethBalance } = useBalance({ address });
  const { data: gasPrice } = useGasPrice();

  const [gasCostUSD, setGasCostUSD] = useState<number>(0);
  const ETH_PRICE_USD = 2500; // In production, fetch from oracle

  useEffect(() => {
    if (preview?.gasEstimate && gasPrice) {
      const gasCostEth = Number(formatEther(preview.gasEstimate * gasPrice));
      setGasCostUSD(gasCostEth * ETH_PRICE_USD);
    }
  }, [preview?.gasEstimate, gasPrice]);

  if (!preview || !isOpen) return null;

  const getTypeLabel = () => {
    switch (preview.type) {
      case 'swap': return 'Token Swap';
      case 'stake': return 'Stake Tokens';
      case 'create-token': return 'Create Token';
      case 'add-liquidity': return 'Add Liquidity';
      default: return 'Transaction';
    }
  };

  const getImpactColor = (impact: number) => {
    if (impact < 1) return 'text-green-600';
    if (impact < 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getImpactIcon = (impact: number) => {
    if (impact < 1) return <TrendingUp className="w-4 h-4" />;
    return <TrendingDown className="w-4 h-4" />;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">
                    Transaction Preview
                  </h2>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium text-white">
                    {getTypeLabel()}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Token Exchange Display */}
                {preview.tokenIn && preview.tokenOut && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm text-gray-500 mb-1">You Send</div>
                        <div className="text-2xl font-bold text-gray-900">
                          {preview.tokenIn.amount} {preview.tokenIn.symbol}
                        </div>
                      </div>

                      <div className="px-4">
                        <div className="bg-white rounded-full p-2 shadow-sm">
                          <ArrowRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>

                      <div className="flex-1 text-right">
                        <div className="text-sm text-gray-500 mb-1">You Receive</div>
                        <div className="text-2xl font-bold text-green-600">
                          {preview.tokenOut.amount} {preview.tokenOut.symbol}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Transaction Details */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                    Transaction Details
                  </h3>

                  {/* Gas Estimate */}
                  {preview.gasEstimate && (
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Fuel className="w-4 h-4" />
                        <span className="text-sm font-medium">Network Fee</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatEther(preview.gasEstimate * (gasPrice || 0n))} ETH
                        </div>
                        <div className="text-xs text-gray-500">
                          ${gasCostUSD.toFixed(2)} USD
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Liquidity Impact */}
                  {preview.liquidityImpact !== undefined && (
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Info className="w-4 h-4" />
                        <span className="text-sm font-medium">Liquidity Impact</span>
                      </div>
                      <div className={`flex items-center gap-1 text-sm font-semibold ${getImpactColor(preview.liquidityImpact)}`}>
                        {getImpactIcon(preview.liquidityImpact)}
                        {preview.liquidityImpact.toFixed(2)}%
                      </div>
                    </div>
                  )}

                  {/* Slippage */}
                  {preview.slippage !== undefined && (
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div className="flex items-center gap-2 text-gray-600">
                        <TrendingDown className="w-4 h-4" />
                        <span className="text-sm font-medium">Max Slippage</span>
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {preview.slippage}%
                      </div>
                    </div>
                  )}

                  {/* Post-Transaction Balance */}
                  {preview.postBalance && (
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Wallet className="w-4 h-4" />
                        <span className="text-sm font-medium">Post-Transaction Balance</span>
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {formatEther(preview.postBalance.amount)} {preview.postBalance.token}
                      </div>
                    </div>
                  )}
                </div>

                {/* Warnings */}
                {preview.warnings && preview.warnings.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        {preview.warnings.map((warning, index) => (
                          <p key={index} className="text-sm text-yellow-800">
                            {warning}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Current Wallet Balance */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-900">Current ETH Balance</span>
                    <span className="text-sm font-semibold text-blue-900">
                      {ethBalance ? formatEther(ethBalance.value) : '0.00'} ETH
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>

                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="px-8 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Confirm Transaction'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Hook for calculating transaction preview
export function useTransactionPreview() {
  const [preview, setPreview] = useState<TransactionPreview | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const calculateSwapPreview = async ({
    tokenInSymbol,
    tokenInAmount,
    tokenInDecimals,
    tokenOutSymbol,
    estimatedOutput,
    tokenOutDecimals,
    liquidityBefore,
    liquidityAfter,
    gasEstimate
  }: {
    tokenInSymbol: string;
    tokenInAmount: string;
    tokenInDecimals: number;
    tokenOutSymbol: string;
    estimatedOutput: string;
    tokenOutDecimals: number;
    liquidityBefore: bigint;
    liquidityAfter: bigint;
    gasEstimate: bigint;
  }) => {
    const liquidityImpact = liquidityBefore > 0n
      ? Number((liquidityBefore - liquidityAfter) * 10000n / liquidityBefore) / 100
      : 0;

    const warnings: string[] = [];
    if (liquidityImpact > 5) {
      warnings.push('High liquidity impact detected. Consider splitting into smaller transactions.');
    }
    if (liquidityImpact > 10) {
      warnings.push('Critical liquidity impact. Price may be significantly affected.');
    }

    setPreview({
      type: 'swap',
      tokenIn: {
        symbol: tokenInSymbol,
        amount: tokenInAmount,
        decimals: tokenInDecimals
      },
      tokenOut: {
        symbol: tokenOutSymbol,
        amount: estimatedOutput,
        decimals: tokenOutDecimals
      },
      gasEstimate,
      liquidityImpact,
      warnings,
      slippage: 0.5
    });

    setIsOpen(true);
  };

  const calculateStakePreview = async ({
    amount,
    symbol,
    gasEstimate,
    currentBalance,
    estimatedRewards
  }: {
    amount: string;
    symbol: string;
    gasEstimate: bigint;
    currentBalance: bigint;
    estimatedRewards?: string;
  }) => {
    const amountBigInt = parseEther(amount);
    const postBalance = currentBalance - amountBigInt;

    const warnings: string[] = [];
    if (postBalance < parseEther('0.01')) {
      warnings.push('Low balance after staking. Ensure you have enough for gas fees.');
    }

    setPreview({
      type: 'stake',
      tokenIn: {
        symbol,
        amount,
        decimals: 18
      },
      gasEstimate,
      postBalance: {
        token: symbol,
        amount: postBalance
      },
      warnings
    });

    setIsOpen(true);
  };

  const close = () => setIsOpen(false);

  return {
    preview,
    isOpen,
    calculateSwapPreview,
    calculateStakePreview,
    close
  };
}
