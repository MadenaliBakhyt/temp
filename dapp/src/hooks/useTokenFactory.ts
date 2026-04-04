import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Address } from 'viem';
import { FACTORY_ADDRESS } from '@/lib/contracts';
import TokenFactoryAbi from '@/abi/TokenFactory.json';

export function useTokenFactory() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  function createToken(
    name: string,
    symbol: string,
    decimals: number,
    initialSupply: bigint,
    cap: bigint
  ) {
    writeContract({
      address: FACTORY_ADDRESS,
      abi: TokenFactoryAbi.abi,
      functionName: 'createToken',
      args: [name, symbol, decimals, initialSupply, cap],
      gas: 3000000n,
    });
  }

  return {
    createToken,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

export function useAllTokens() {
  const { data, isLoading, refetch } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: TokenFactoryAbi.abi,
    functionName: 'getAllTokens',
  });

  return {
    tokens: (data as Address[]) || [],
    isLoading,
    refetch,
  };
}

export function useMyTokens(owner?: Address) {
  const { data, isLoading, refetch } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: TokenFactoryAbi.abi,
    functionName: 'getMyTokens',
    args: owner ? [owner] : undefined,
    query: {
      enabled: !!owner,
    },
  });

  return {
    tokens: (data as Address[]) || [],
    isLoading,
    refetch,
  };
}
