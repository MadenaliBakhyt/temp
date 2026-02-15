import React, { forwardRef } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      success,
      hint,
      leftIcon,
      rightIcon,
      containerClassName = '',
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;
    const hasSuccess = !!success;

    const inputClasses = `
      w-full px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400
      bg-white border rounded-lg transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-0
      disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
      ${hasError ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : ''}
      ${hasSuccess ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20' : ''}
      ${!hasError && !hasSuccess ? 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20' : ''}
      ${leftIcon ? 'pl-10' : ''}
      ${rightIcon ? 'pr-10' : ''}
      ${className}
    `;

    return (
      <div className={`space-y-1.5 ${containerClassName}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            disabled={disabled}
            className={inputClasses}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}

          {hasError && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
          )}

          {hasSuccess && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            {error}
          </p>
        )}

        {success && (
          <p className="text-sm text-green-600 flex items-center gap-1">
            {success}
          </p>
        )}

        {hint && !error && !success && (
          <p className="text-sm text-gray-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Token Input Component
interface TokenInputProps extends Omit<InputProps, 'type'> {
  token: string;
  balance?: string;
  onMaxClick?: () => void;
  price?: string;
}

export function TokenInput({
  token,
  balance,
  onMaxClick,
  price,
  value,
  ...props
}: TokenInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">Amount</span>
        {balance && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Balance: {balance}</span>
            {onMaxClick && (
              <button
                type="button"
                onClick={onMaxClick}
                className="text-blue-600 font-medium hover:text-blue-700 transition-colors"
              >
                MAX
              </button>
            )}
          </div>
        )}
      </div>

      <div className="relative">
        <Input
          type="number"
          step="any"
          value={value}
          className="pr-20 text-lg font-semibold"
          {...props}
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500" />
          <span className="text-sm font-semibold text-gray-900">{token}</span>
        </div>
      </div>

      {price && value && Number(value) > 0 && (
        <div className="text-sm text-gray-500">
          ≈ ${(Number(value) * Number(price)).toFixed(2)} USD
        </div>
      )}
    </div>
  );
}
