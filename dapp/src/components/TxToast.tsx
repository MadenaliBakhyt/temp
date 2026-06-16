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

export function TxToast({ hash, isPending, isConfirming, isSuccess, error, onClose }: TxToastProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isPending || isConfirming || isSuccess || error) setShow(true);
  }, [isPending, isConfirming, isSuccess, error]);

  useEffect(() => {
    if (isSuccess || error) {
      const t = setTimeout(() => { setShow(false); onClose?.(); }, 6000);
      return () => clearTimeout(t);
    }
  }, [isSuccess, error, onClose]);

  if (!show) return null;

  const states = {
    error: {
      icon: (
        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      ),
      label: 'Transaction failed',
      sub: error?.message?.slice(0, 80),
      border: 'border-red-200',
    },
    success: {
      icon: (
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      ),
      label: 'Transaction confirmed',
      sub: hash ? (
        <a href={`https://sepolia.etherscan.io/tx/${hash}`} target="_blank" rel="noopener noreferrer"
          className="text-primary-600 hover:underline font-mono">
          {formatTxHash(hash)}
        </a>
      ) : null,
      border: 'border-emerald-200',
    },
    confirming: {
      icon: (
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 animate-spin">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
      ),
      label: 'Confirming on-chain',
      sub: 'Waiting for block confirmation…',
      border: 'border-blue-200',
    },
    pending: {
      icon: (
        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      ),
      label: 'Pending wallet confirmation',
      sub: 'Approve the transaction in MetaMask',
      border: 'border-amber-200',
    },
  };

  const state = error ? states.error : isSuccess ? states.success : isConfirming ? states.confirming : states.pending;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
      <div className={`bg-white border ${state.border} rounded-lg shadow-lg p-4 flex items-start gap-3 min-w-[280px] max-w-sm`}>
        {state.icon}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-slate-900">{state.label}</div>
          {state.sub && <div className="text-xs text-slate-500 mt-0.5 truncate">{state.sub}</div>}
        </div>
        <button onClick={() => { setShow(false); onClose?.(); }}
          className="text-slate-300 hover:text-slate-500 transition-colors flex-shrink-0 ml-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}
