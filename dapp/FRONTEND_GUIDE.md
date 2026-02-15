# Professional Frontend Architecture Guide

## Overview

This is a production-grade React frontend built with advanced UX patterns, TypeScript, and modern design principles. No emojis, just professional enterprise-level code.

## Tech Stack

### Core
- **React 18** - Latest features with concurrent rendering
- **TypeScript 5.3+** - Type-safe development
- **Vite 5** - Lightning-fast build tool
- **Tailwind CSS 3** - Utility-first styling

### Web3
- **wagmi 2.5+** - React hooks for Ethereum
- **viem 2.7+** - TypeScript Ethereum library
- **RainbowKit** - Wallet connection UI

### UI/UX Libraries
- **Framer Motion** - Production-ready animations
- **Lucide React** - Clean, consistent icons
- **React Query (TanStack)** - Server state management
- **React Router** - Client-side routing

## Architecture

### Component Structure

```
dapp/src/
├── components/
│   ├── ui/                       # Base UI components (Design System)
│   │   ├── Button.tsx           # Primary button component
│   │   ├── Input.tsx            # Input with validation states
│   │   ├── Card.tsx             # Card layouts
│   │   ├── Badge.tsx            # Status badges
│   │   └── Modal.tsx            # Modal dialogs
│   ├── TransactionPreviewEngine.tsx  # Transaction preview system
│   ├── WalletConnect.tsx        # Wallet connection component
│   └── Layout.tsx               # App layout wrapper
├── pages/
│   ├── SwapPro.tsx              # Professional swap interface
│   ├── StakingPro.tsx           # Advanced staking UI
│   ├── CreateToken.tsx          # Token creation wizard
│   ├── Analytics.tsx            # Data visualization
│   └── Admin.tsx                # Admin panel
├── hooks/
│   ├── useTransactionPreview.ts # Transaction preview logic
│   ├── useTokenBalance.ts       # Token balance hook
│   └── useContract.ts           # Contract interaction
├── utils/
│   ├── formatting.ts            # Number/currency formatting
│   ├── validation.ts            # Input validation
│   └── constants.ts             # App constants
└── types/
    └── index.ts                 # TypeScript definitions
```

## Transaction Preview Engine

### Features

The Transaction Preview Engine shows users exactly what will happen before they confirm:

1. **Amount Calculation** - Precise input/output amounts
2. **Gas Estimation** - Real-time gas cost in ETH and USD
3. **Liquidity Impact** - Percentage change in pool liquidity
4. **Post-Transaction Balance** - What your balance will be after
5. **Warnings** - Smart alerts for risky transactions
6. **Slippage Protection** - Minimum received amount

### Usage

```tsx
import { useTransactionPreview } from '../hooks/useTransactionPreview';

function MyComponent() {
  const { preview, isOpen, calculateSwapPreview, close } = useTransactionPreview();

  const handlePreview = async () => {
    await calculateSwapPreview({
      tokenInSymbol: 'ETH',
      tokenInAmount: '1.0',
      tokenInDecimals: 18,
      tokenOutSymbol: 'TOKEN',
      estimatedOutput: '1000',
      tokenOutDecimals: 18,
      liquidityBefore: parseEther('100'),
      liquidityAfter: parseEther('101'),
      gasEstimate: 150000n
    });
  };

  return (
    <>
      <button onClick={handlePreview}>Preview Transaction</button>

      <TransactionPreviewEngine
        preview={preview}
        isOpen={isOpen}
        onClose={close}
        onConfirm={() => {
          // Execute transaction
        }}
      />
    </>
  );
}
```

## UI Components

### Button Component

Professional button with variants, sizes, loading states:

```tsx
<Button variant="primary" size="lg" isLoading={isPending}>
  Swap Tokens
</Button>

<Button variant="outline" leftIcon={<Icon />}>
  Cancel
</Button>

<Button variant="danger" fullWidth>
  Delete
</Button>
```

**Variants**: `primary`, `secondary`, `outline`, `ghost`, `danger`, `success`
**Sizes**: `sm`, `md`, `lg`

### Input Components

Type-safe inputs with validation states:

```tsx
<Input
  label="Amount"
  error="Insufficient balance"
  hint="Enter amount to swap"
  leftIcon={<Icon />}
  placeholder="0.00"
/>

<TokenInput
  token="ETH"
  balance="1.234"
  onMaxClick={() => setAmount('1.234')}
  price="2500"
/>
```

### Card Component

Flexible card layouts:

```tsx
<Card hover gradient>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Actions</CardFooter>
</Card>

<StatCard
  label="Total Staked"
  value="1,234 ETH"
  change={12.5}
  trend="up"
  icon={<Icon />}
/>
```

## Design System

### Colors

```tsx
// Primary
bg-blue-600 text-blue-600

// Secondary
bg-gray-600 text-gray-600

// Success
bg-green-600 text-green-600

// Danger
bg-red-600 text-red-600

// Warning
bg-yellow-600 text-yellow-600
```

### Typography

```tsx
// Headings
text-4xl font-bold      // Page title
text-2xl font-semibold  // Section heading
text-lg font-medium     // Subsection

// Body
text-base               // Default
text-sm                 // Small text
text-xs                 // Fine print
```

### Spacing

```tsx
gap-2   // 0.5rem - Tight spacing
gap-4   // 1rem - Default spacing
gap-6   // 1.5rem - Comfortable spacing
gap-8   // 2rem - Section spacing
```

### Shadows

```tsx
shadow-sm       // Subtle
shadow-lg       // Prominent
shadow-2xl      // Modal/overlay
shadow-blue-500/30  // Colored shadow
```

## Advanced UX Patterns

### Loading States

```tsx
{isLoading && <LoadingSkeleton />}
{data && <Content />}
{error && <ErrorState />}
```

### Optimistic Updates

```tsx
const mutation = useMutation({
  mutationFn: updateData,
  onMutate: async (newData) => {
    // Optimistically update UI
    await queryClient.cancelQueries(['data']);
    const previous = queryClient.getQueryData(['data']);
    queryClient.setQueryData(['data'], newData);
    return { previous };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(['data'], context.previous);
  }
});
```

### Real-time Updates

```tsx
const { data } = useReadContract({
  address: CONTRACT_ADDRESS,
  abi: ABI,
  functionName: 'balanceOf',
  args: [address],
  query: {
    refetchInterval: 10000, // Update every 10s
    refetchOnWindowFocus: true
  }
});
```

### Error Boundaries

```tsx
<ErrorBoundary fallback={<ErrorState />}>
  <YourComponent />
</ErrorBoundary>
```

## Performance Optimizations

### Code Splitting

```tsx
const Analytics = lazy(() => import('./pages/Analytics'));

<Suspense fallback={<LoadingSpinner />}>
  <Analytics />
</Suspense>
```

### Memoization

```tsx
const expensiveValue = useMemo(() => {
  return calculateComplexValue(data);
}, [data]);

const handleClick = useCallback(() => {
  doSomething(value);
}, [value]);
```

### Virtual Lists

For large lists, use virtualization:

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

const virtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 50
});
```

## Accessibility

All components follow WCAG 2.1 AA standards:

- Proper ARIA labels
- Keyboard navigation
- Focus management
- Color contrast ratios
- Screen reader support

```tsx
<button
  aria-label="Close dialog"
  aria-describedby="dialog-description"
  onClick={onClose}
>
  Close
</button>
```

## Testing

### Unit Tests

```tsx
import { render, screen } from '@testing-library/react';

test('renders button', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

### Integration Tests

```tsx
test('swap flow', async () => {
  render(<SwapPro />);

  await userEvent.type(screen.getByPlaceholderText('0.00'), '1.0');
  await userEvent.click(screen.getByText('Preview Swap'));

  expect(screen.getByText('Transaction Preview')).toBeInTheDocument();
});
```

## Build & Deploy

### Development

```bash
npm run dev
# Runs on http://localhost:5173
```

### Production Build

```bash
npm run build
# Outputs to /dist

npm run preview
# Preview production build
```

### Environment Variables

```env
VITE_FACTORY_ADDRESS=0x...
VITE_SWAP_ADDRESS=0x...
VITE_STAKING_ADDRESS=0x...
VITE_CHAIN_ID=11155111
VITE_ALCHEMY_ID=your_key
```

## Best Practices

### 1. Type Everything

```tsx
interface SwapParams {
  tokenIn: Address;
  tokenOut: Address;
  amount: bigint;
}

function swap(params: SwapParams): Promise<Hash> {
  // Implementation
}
```

### 2. Handle All States

```tsx
if (isLoading) return <LoadingSkeleton />;
if (isError) return <ErrorState error={error} />;
if (!data) return <EmptyState />;
return <DataDisplay data={data} />;
```

### 3. Validate Inputs

```tsx
const schema = z.object({
  amount: z.string().refine(val => Number(val) > 0, 'Must be positive'),
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid address')
});
```

### 4. Use Semantic HTML

```tsx
<main>
  <section aria-labelledby="swap-title">
    <h2 id="swap-title">Token Swap</h2>
    <form onSubmit={handleSubmit}>
      {/* Form content */}
    </form>
  </section>
</main>
```

### 5. Optimize Images

```tsx
<img
  src="/logo.png"
  alt="Company Logo"
  loading="lazy"
  width="200"
  height="50"
/>
```

## Common Patterns

### Modal Management

```tsx
const [isOpen, setIsOpen] = useState(false);

<Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
  <ModalContent />
</Modal>
```

### Form Handling

```tsx
const { register, handleSubmit, formState: { errors } } = useForm();

<form onSubmit={handleSubmit(onSubmit)}>
  <Input {...register('amount', { required: true })} />
  {errors.amount && <span>Required</span>}
</form>
```

### Toast Notifications

```tsx
import { toast } from 'react-hot-toast';

toast.success('Transaction confirmed');
toast.error('Transaction failed');
toast.loading('Processing...');
```

## Maintenance

### Update Dependencies

```bash
npm outdated
npm update
npm audit fix
```

### Code Quality

```bash
npm run lint
npm run type-check
npm run test
npm run format
```

## Resources

- [React Documentation](https://react.dev/)
- [wagmi Documentation](https://wagmi.sh/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Built with professional standards. No shortcuts. No emojis. Just clean, maintainable code.**
