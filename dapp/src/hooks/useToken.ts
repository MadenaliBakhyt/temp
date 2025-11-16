import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Address } from 'viem';
import YourTokenAbi from '@/abi/YourToken.json';

export function useToken(tokenAddress?: Address) {
  const { data: name } = useReadContract({
    address: tokenAddress,
    abi: YourTokenAbi.abi,
    functionName: 'name',
    query: { enabled: !!tokenAddress },
  });

  const { data: symbol } = useReadContract({
    address: tokenAddress,
    abi: YourTokenAbi.abi,
    functionName: 'symbol',
    query: { enabled: !!tokenAddress },
  });

  const { data: decimals } = useReadContract({
    address: tokenAddress,
    abi: YourTokenAbi.abi,
    functionName: 'decimals',
    query: { enabled: !!tokenAddress },
  });

  const { data: totalSupply } = useReadContract({
    address: tokenAddress,
    abi: YourTokenAbi.abi,
    functionName: 'totalSupply',
    query: { enabled: !!tokenAddress },
  });

  const { data: cap } = useReadContract({
    address: tokenAddress,
    abi: YourTokenAbi.abi,
    functionName: 'cap',
    query: { enabled: !!tokenAddress },
  });

  const { data: owner } = useReadContract({
    address: tokenAddress,
    abi: YourTokenAbi.abi,
    functionName: 'owner',
    query: { enabled: !!tokenAddress },
  });

  return {
    name: (name as string) || '',
    symbol: (symbol as string) || '',
    decimals: (decimals as number) || 18,
    totalSupply: (totalSupply as bigint) || 0n,
    cap: (cap as bigint) || 0n,
    owner: (owner as Address) || '0x',
  };
}

export function useTokenBalance(tokenAddress?: Address, account?: Address) {
  const { data, isLoading, refetch } = useReadContract({
    address: tokenAddress,
    abi: YourTokenAbi.abi,
    functionName: 'balanceOf',
    args: account ? [account] : undefined,
    query: {
      enabled: !!tokenAddress && !!account,
    },
  });

  return {
    balance: (data as bigint) || 0n,
    isLoading,
    refetch,
  };
}

export function useTokenApprove() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  function approve(tokenAddress: Address, spender: Address, amount: bigint) {
    writeContract({
      address: tokenAddress,
      abi: YourTokenAbi.abi,
      functionName: 'approve',
      args: [spender, amount],
    });
  }

  return {
    approve,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

export function useTokenAllowance(
  tokenAddress?: Address,
  owner?: Address,
  spender?: Address
) {
  const { data, isLoading, refetch } = useReadContract({
    address: tokenAddress,
    abi: YourTokenAbi.abi,
    functionName: 'allowance',
    args: owner && spender ? [owner, spender] : undefined,
    query: {
      enabled: !!tokenAddress && !!owner && !!spender,
    },
  });

  return {
    allowance: (data as bigint) || 0n,
    isLoading,
    refetch,
  };
}
