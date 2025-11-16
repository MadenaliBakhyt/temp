import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Address, parseEther } from 'viem';
import { SWAP_ADDRESS } from '@/lib/contracts';
import SimpleSwapAbi from '@/abi/SimpleSwap.json';
import { TokenInfo } from '@/types';

export function useSimpleSwap() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  function buyToken(tokenAddress: Address, ethAmount: string) {
    writeContract({
      address: SWAP_ADDRESS,
      abi: SimpleSwapAbi.abi,
      functionName: 'buyToken',
      args: [tokenAddress],
      value: parseEther(ethAmount),
    });
  }

  function sellToken(tokenAddress: Address, amount: bigint) {
    writeContract({
      address: SWAP_ADDRESS,
      abi: SimpleSwapAbi.abi,
      functionName: 'sellToken',
      args: [tokenAddress, amount],
    });
  }

  return {
    buyToken,
    sellToken,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

export function useListedTokens() {
  const { data, isLoading, refetch } = useReadContract({
    address: SWAP_ADDRESS,
    abi: SimpleSwapAbi.abi,
    functionName: 'getListedTokens',
  });

  return {
    tokens: (data as Address[]) || [],
    isLoading,
    refetch,
  };
}

export function useTokenInfo(tokenAddress?: Address) {
  const { data, isLoading, refetch } = useReadContract({
    address: SWAP_ADDRESS,
    abi: SimpleSwapAbi.abi,
    functionName: 'getTokenInfo',
    args: tokenAddress ? [tokenAddress] : undefined,
    query: {
      enabled: !!tokenAddress,
    },
  });

  const tokenInfo: TokenInfo | null = data
    ? {
        isListed: (data as any)[0],
        tokenPerEth: (data as any)[1],
        minEthLiquidity: (data as any)[2],
        tokenBalance: (data as any)[3],
        ethBalance: (data as any)[4],
      }
    : null;

  return {
    tokenInfo,
    isLoading,
    refetch,
  };
}

export function useSwapAdmin() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  function listToken(token: Address, tokenPerEth: bigint, minEthLiquidity: bigint) {
    writeContract({
      address: SWAP_ADDRESS,
      abi: SimpleSwapAbi.abi,
      functionName: 'listToken',
      args: [token, tokenPerEth, minEthLiquidity],
    });
  }

  function setRate(token: Address, newTokenPerEth: bigint) {
    writeContract({
      address: SWAP_ADDRESS,
      abi: SimpleSwapAbi.abi,
      functionName: 'setRate',
      args: [token, newTokenPerEth],
    });
  }

  function addLiquidity(token: Address, tokenAmount: bigint, ethAmount: string) {
    writeContract({
      address: SWAP_ADDRESS,
      abi: SimpleSwapAbi.abi,
      functionName: 'addLiquidity',
      args: [token, tokenAmount],
      value: parseEther(ethAmount),
    });
  }

  return {
    listToken,
    setRate,
    addLiquidity,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}
