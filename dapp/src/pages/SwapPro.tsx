import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { ArrowDownUp, Settings, Info, TrendingUp, Clock, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { TokenInput } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { TransactionPreviewEngine, useTransactionPreview } from '../components/TransactionPreviewEngine';

const SIMPLE_SWAP_ADDRESS = import.meta.env.VITE_SWAP_ADDRESS as `0x${string}`;

const SIMPLE_SWAP_ABI = [
  {
    name: 'buyTokens',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'token_', type: 'address' },
      { name: 'ethAmount_', type: 'uint256' }
    ],
    outputs: []
  },
  {
    name: 'tokenInfo',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'address' }],
    outputs: [
      { name: 'isListed', type: 'bool' },
      { name: 'tokensPerEth', type: 'uint256' },
      { name: 'ethBalance', type: 'uint256' },
      { name: 'tokenBalance', type: 'uint256' }
    ]
  }
] as const;

export function SwapPro() {
  const { address, isConnected } = useAccount();
  const { writeContract, isPending } = useWriteContract();
  const { preview, isOpen, calculateSwapPreview, close } = useTransactionPreview();

  const [ethAmount, setEthAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState<`0x${string}` | null>(null);
  const [slippage, setSlippage] = useState('0.5');
  const [showSettings, setShowSettings] = useState(false);

  // Read token info
  const { data: tokenInfo } = useReadContract({
    address: SIMPLE_SWAP_ADDRESS,
    abi: SIMPLE_SWAP_ABI,
    functionName: 'tokenInfo',
    args: selectedToken ? [selectedToken] : undefined,
    query: {
      enabled: !!selectedToken,
      refetchInterval: 10000
    }
  });

  const calculateOutput = () => {
    if (!ethAmount || !tokenInfo || !tokenInfo[1]) return '0';
    try {
      const ethIn = parseEther(ethAmount);
      const tokensOut = (ethIn * tokenInfo[1]) / parseEther('1');
      return formatEther(tokensOut);
    } catch {
      return '0';
    }
  };

  const estimatedOutput = calculateOutput();

  const calculateLiquidityImpact = () => {
    if (!tokenInfo || !ethAmount) return 0;
    const ethIn = parseEther(ethAmount);
    const currentLiquidity = tokenInfo[2]; // ethBalance
    if (currentLiquidity === 0n) return 0;
    return Number((ethIn * 10000n) / currentLiquidity) / 100;
  };

  const handleSwapPreview = async () => {
    if (!selectedToken || !ethAmount || !tokenInfo) return;

    const gasEstimate = 150000n; // Estimated gas

    await calculateSwapPreview({
      tokenInSymbol: 'ETH',
      tokenInAmount: ethAmount,
      tokenInDecimals: 18,
      tokenOutSymbol: 'TOKEN',
      estimatedOutput,
      tokenOutDecimals: 18,
      liquidityBefore: tokenInfo[2],
      liquidityAfter: tokenInfo[2] + parseEther(ethAmount),
      gasEstimate
    });
  };

  const handleConfirmSwap = () => {
    if (!selectedToken || !ethAmount) return;

    writeContract({
      address: SIMPLE_SWAP_ADDRESS,
      abi: SIMPLE_SWAP_ABI,
      functionName: 'buyTokens',
      args: [selectedToken, parseEther(ethAmount)],
      value: parseEther(ethAmount)
    });

    close();
  };

  const exchangeRate = tokenInfo && tokenInfo[1]
    ? formatEther(tokenInfo[1])
    : '0';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Token Exchange
          </h1>
          <p className="text-lg text-gray-600">
            Trade tokens with instant settlement and transparent pricing
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Swap Interface */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Swap Tokens</CardTitle>
                    <CardDescription>Exchange ETH for tokens at fixed rates</CardDescription>
                  </div>
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Settings className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Settings Panel */}
                {showSettings && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Slippage Tolerance</span>
                      <div className="flex items-center gap-2">
                        {['0.1', '0.5', '1.0'].map((value) => (
                          <button
                            key={value}
                            onClick={() => setSlippage(value)}
                            className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                              slippage === value
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {value}%
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* From Token */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">From</label>
                  <TokenInput
                    token="ETH"
                    value={ethAmount}
                    onChange={(e) => setEthAmount(e.target.value)}
                    placeholder="0.00"
                    balance="1.234"
                    onMaxClick={() => setEthAmount('1.234')}
                  />
                </div>

                {/* Swap Icon */}
                <div className="flex justify-center -my-2 z-10">
                  <div className="bg-white border-4 border-gray-50 rounded-full p-2 shadow-sm">
                    <ArrowDownUp className="w-5 h-5 text-gray-400" />
                  </div>
                </div>

                {/* To Token */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">To</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={estimatedOutput}
                      readOnly
                      className="w-full px-4 py-2.5 pr-20 text-lg font-semibold bg-gray-50 border border-gray-300 rounded-lg text-gray-900"
                      placeholder="0.00"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
                      <span className="text-sm font-semibold text-gray-900">TOKEN</span>
                    </div>
                  </div>
                </div>

                {/* Exchange Rate */}
                {tokenInfo && tokenInfo[0] && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">Exchange Rate</span>
                      <span className="font-semibold text-gray-900">
                        1 ETH = {exchangeRate} TOKEN
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-gray-700">Liquidity Impact</span>
                      <span className={`font-semibold ${calculateLiquidityImpact() > 5 ? 'text-red-600' : 'text-green-600'}`}>
                        {calculateLiquidityImpact().toFixed(2)}%
                      </span>
                    </div>
                  </div>
                )}

                {/* Swap Button */}
                {isConnected ? (
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleSwapPreview}
                    disabled={!ethAmount || !selectedToken || isPending}
                    isLoading={isPending}
                  >
                    {isPending ? 'Swapping...' : 'Preview Swap'}
                  </Button>
                ) : (
                  <Button variant="primary" size="lg" fullWidth>
                    Connect Wallet
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Transaction Details */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Transaction Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Minimum Received</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {(Number(estimatedOutput) * (1 - Number(slippage) / 100)).toFixed(6)} TOKEN
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Network Fee</span>
                    <span className="text-sm font-semibold text-gray-900">~$2.50</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600">Route</span>
                    <span className="text-sm font-semibold text-gray-900">ETH → TOKEN</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Info Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Market Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm">24h Volume</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">$12,456</p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm">Total Liquidity</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {tokenInfo ? formatEther(tokenInfo[2]) : '0'} ETH
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Transactions (24h)</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">142</p>
                </div>
              </CardContent>
            </Card>

            {/* Security Info */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-900 mb-1">Secure Trading</h4>
                    <p className="text-sm text-green-700">
                      All smart contracts are audited and verified on Etherscan
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Help */}
            <Card>
              <CardContent>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Info className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Need Help?</h4>
                    <p className="text-sm text-gray-600">
                      View our documentation or contact support for assistance
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Transaction Preview Modal */}
      <TransactionPreviewEngine
        preview={preview}
        isOpen={isOpen}
        onClose={close}
        onConfirm={handleConfirmSwap}
        isLoading={isPending}
      />
    </div>
  );
}
