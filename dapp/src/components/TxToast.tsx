import { useEffect, useState } from 'react';
import { formatTxHash } from '@/lib/format';

interface TxToastProps {
  hash?: `0x${string}`;
  isPending?: boolean;
  isConfirming?: boolean;
  isSuccess?: boolean;
  error?: Error | null;
  onClose?: () => void;
}

export function TxToast({
  hash,
  isPending,
  isConfirming,
  isSuccess,
  error,
  onClose,
}: TxToastProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isPending || isConfirming || isSuccess || error) {
      setShow(true);
    }
  }, [isPending, isConfirming, isSuccess, error]);

  useEffect(() => {
    if (isSuccess || error) {
      const timer = setTimeout(() => {
        setShow(false);
        onClose?.();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, error, onClose]);

  if (!show) return null;

  let content;
  let bgColor;

  if (error) {
    content = (
      <>
        <div className="text-red-600 text-xl">❌</div>
        <div>
          <div className="font-semibold">Transaction Failed</div>
          <div className="text-sm text-gray-600">{error.message}</div>
        </div>
      </>
    );
    bgColor = 'bg-red-50 border-red-200';
  } else if (isSuccess) {
    content = (
      <>
        <div className="text-green-600 text-xl">✅</div>
        <div>
          <div className="font-semibold">Transaction Confirmed</div>
          {hash && (
            <a
              href={`https://sepolia.etherscan.io/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary-600 hover:underline"
            >
              {formatTxHash(hash)}
            </a>
          )}
        </div>
      </>
    );
    bgColor = 'bg-green-50 border-green-200';
  } else if (isConfirming) {
    content = (
      <>
        <div className="animate-spin text-2xl">⏳</div>
        <div>
          <div className="font-semibold">Confirming Transaction</div>
          <div className="text-sm text-gray-600">Waiting for confirmation...</div>
        </div>
      </>
    );
    bgColor = 'bg-blue-50 border-blue-200';
  } else if (isPending) {
    content = (
      <>
        <div className="animate-spin text-2xl">🔄</div>
        <div>
          <div className="font-semibold">Transaction Pending</div>
          <div className="text-sm text-gray-600">Confirm in your wallet...</div>
        </div>
      </>
    );
    bgColor = 'bg-yellow-50 border-yellow-200';
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className={`card ${bgColor} flex items-center gap-4 min-w-[300px] max-w-md`}>
        {content}
        <button
          onClick={() => {
            setShow(false);
            onClose?.();
          }}
          className="ml-auto text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
