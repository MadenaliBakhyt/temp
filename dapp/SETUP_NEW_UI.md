# Setup Professional UI - Installation Guide

## Required Dependencies

Install these packages for the new professional UI components:

```bash
cd dapp

# Core UI dependencies
npm install framer-motion lucide-react

# Additional utilities (if not already installed)
npm install @tanstack/react-query
npm install react-hot-toast
npm install zod  # For form validation

# Optional but recommended
npm install clsx  # For conditional classNames
npm install @headlessui/react  # For accessible components
```

## Verify Installation

After installation, check your `package.json`:

```json
{
  "dependencies": {
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.300.0",
    "@tanstack/react-query": "^5.0.0",
    "react-hot-toast": "^2.4.1",
    "zod": "^3.22.4",
    "clsx": "^2.1.0",
    "@headlessui/react": "^1.7.17"
  }
}
```

## Quick Start

### 1. Import UI Components

```tsx
import { Button } from './components/ui/Button';
import { Input, TokenInput } from './components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/Card';
import { TransactionPreviewEngine, useTransactionPreview } from './components/TransactionPreviewEngine';
```

### 2. Use Transaction Preview

```tsx
function MySwapComponent() {
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
      <Button onClick={handlePreview}>Preview Transaction</Button>

      <TransactionPreviewEngine
        preview={preview}
        isOpen={isOpen}
        onClose={close}
        onConfirm={() => {
          // Execute actual transaction
          console.log('Transaction confirmed');
        }}
      />
    </>
  );
}
```

### 3. Use Professional Buttons

```tsx
// Primary action
<Button variant="primary" size="lg">
  Swap Tokens
</Button>

// Secondary action
<Button variant="outline" leftIcon={<Settings />}>
  Settings
</Button>

// Loading state
<Button variant="primary" isLoading={isPending}>
  Processing...
</Button>

// Danger action
<Button variant="danger" onClick={handleDelete}>
  Delete
</Button>
```

### 4. Use Token Input

```tsx
<TokenInput
  token="ETH"
  value={amount}
  onChange={(e) => setAmount(e.target.value)}
  balance="1.234"
  onMaxClick={() => setAmount('1.234')}
  price="2500"  // USD price
  placeholder="0.00"
/>
```

### 5. Use Card Components

```tsx
<Card hover>
  <CardHeader>
    <CardTitle>Swap Tokens</CardTitle>
    <CardDescription>Exchange ETH for tokens</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Your content */}
  </CardContent>
  <CardFooter>
    <Button>Swap</Button>
  </CardFooter>
</Card>
```

## File Structure

After setup, your structure should look like:

```
dapp/src/
├── components/
│   ├── ui/
│   │   ├── Button.tsx              ✅ Created
│   │   ├── Input.tsx               ✅ Created
│   │   └── Card.tsx                ✅ Created
│   └── TransactionPreviewEngine.tsx ✅ Created
├── pages/
│   └── SwapPro.tsx                 ✅ Created
└── hooks/
    └── useTransactionPreview.ts    ✅ Included in TransactionPreviewEngine
```

## Running the App

```bash
# Development
npm run dev

# Build
npm run build

# Preview production build
npm run preview
```

## Common Issues

### Issue: `framer-motion` not found

**Solution**:
```bash
npm install framer-motion
```

### Issue: `lucide-react` icons not showing

**Solution**:
```bash
npm install lucide-react
# Restart dev server
```

### Issue: TypeScript errors on `motion` components

**Solution**: Add to `tsconfig.json`:
```json
{
  "compilerOptions": {
    "types": ["vite/client", "node"]
  }
}
```

### Issue: Tailwind classes not applying

**Solution**: Ensure `tailwind.config.js` includes new paths:
```js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // ...
}
```

## Testing Components

### Button Test

```tsx
import { render, screen } from '@testing-library/react';
import { Button } from './components/ui/Button';

test('renders button with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

### Transaction Preview Test

```tsx
test('opens transaction preview', async () => {
  const { calculateSwapPreview } = useTransactionPreview();

  await calculateSwapPreview({
    tokenInSymbol: 'ETH',
    tokenInAmount: '1.0',
    // ...other params
  });

  expect(screen.getByText('Transaction Preview')).toBeInTheDocument();
});
```

## Features Included

### Transaction Preview Engine
- Real-time gas estimation
- Liquidity impact calculation
- Post-transaction balance preview
- Automatic warnings for risky transactions
- Slippage protection display

### UI Components
- **Button**: 6 variants, 3 sizes, loading states, icons
- **Input**: Validation states, icons, token-specific input
- **Card**: Flexible layouts, hover effects, gradients

### Design System
- Professional color palette (no emojis)
- Consistent spacing and typography
- Accessible components (WCAG 2.1 AA)
- Smooth animations with Framer Motion

## Next Steps

1. **Replace old pages** with new `SwapPro.tsx`
2. **Create `StakingPro.tsx`** using same patterns
3. **Add `CreateTokenPro.tsx`** with wizard UI
4. **Build `AnalyticsPro.tsx`** with charts
5. **Update routing** in `App.tsx`

## Example: Replace Old Swap Page

```tsx
// Old: src/pages/Swap.tsx
// New: Import and use SwapPro

import { SwapPro } from './pages/SwapPro';

// In your router
<Route path="/swap" element={<SwapPro />} />
```

## Support

For issues or questions:
1. Check `FRONTEND_GUIDE.md` for detailed documentation
2. Review component source code in `src/components/ui/`
3. See `SwapPro.tsx` for real-world usage example

---

**Professional UI installed and ready to use.**

No emojis. No shortcuts. Production-ready code.
