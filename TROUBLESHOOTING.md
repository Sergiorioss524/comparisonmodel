# Troubleshooting Guide

## WebSocket / XRPL Connection Issues

### Error: `bufferUtil.mask is not a function`

This error occurs when WebSocket native modules aren't properly configured.

**Solution:**
1. Make sure these packages are installed:
   ```bash
   pnpm add ws bufferutil utf-8-validate
   ```

2. Verify `next.config.ts` has the WebSocket configuration:
   ```typescript
   webpack: (config, { isServer }) => {
     if (isServer) {
       config.externals = config.externals || [];
       config.externals.push({
         'bufferutil': 'commonjs bufferutil',
         'utf-8-validate': 'commonjs utf-8-validate',
       });
     }
     return config;
   }
   ```

3. **Restart your dev server** (important!)
   ```bash
   # Stop the current server (Ctrl+C)
   pnpm run dev
   ```

### Error: `Timeout for request` or `Connection timeout`

The XRPL testnet can be slow or temporarily unavailable.

**Solutions:**
1. **Use "Run Network Test" button** instead of "Real Blockchain Test"
   - Network Test: Fast simulation measuring network latency
   - Real Blockchain Test: Actual testnet transactions (slower, can fail)

2. Try a different XRPL server:
   ```typescript
   // In src/app/api/test-transaction/route.ts
   const client = new Client('wss://testnet.xrpl-labs.com');
   // or
   const client = new Client('wss://s.devnet.rippletest.net:51233');
   ```

3. Increase timeout values in the API route

### Charts Not Displaying

**Check:**
1. Is Recharts installed?
   ```bash
   pnpm list recharts
   ```

2. Check browser console for errors (F12)

3. Verify TailwindCSS is working (you should see dark background)

## API Route Issues

### 404 Error on `/api/test-transaction`

**Check:**
1. The API route file exists at: `src/app/api/test-transaction/route.ts`
2. Restart dev server
3. Clear `.next` folder:
   ```bash
   rm -rf .next
   pnpm run dev
   ```

### Fetch Failed Errors

**Check:**
1. Is dev server running on correct port?
   ```bash
   # Should see: ready - started server on 0.0.0.0:3000
   ```

2. Check Network tab in browser DevTools for error details

3. Look at terminal/console for server errors

## Build Issues

### Build Fails with TypeScript Errors

```bash
# Clean and rebuild
rm -rf .next node_modules
pnpm install
pnpm run build
```

### Module Not Found Errors

Ensure all dependencies are installed:
```bash
pnpm install
```

Check `package.json` has:
```json
{
  "dependencies": {
    "ethers": "^6.15.0",
    "recharts": "^3.3.0",
    "tronweb": "^6.1.0",
    "xrpl": "^4.4.2",
    "ws": "^8.18.3",
    "bufferutil": "^4.0.9",
    "utf-8-validate": "^6.0.5"
  }
}
```

## Performance Issues

### Slow Page Load

The page loads charts library which can be large.

**Solutions:**
1. Use production build for better performance:
   ```bash
   pnpm run build
   pnpm start
   ```

2. Charts load faster after first render (caching)

### Slow Test Execution

**Network Test (~3-5 seconds):**
- Normal speed
- Just measures network latency

**Real Blockchain Test (30-60 seconds):**
- Expected to be slow
- Creates real wallets
- Funds from testnet faucet
- Executes transactions
- Waits for confirmation

## Common Questions

### Why two test buttons?

1. **"Run Network Test"** (Blue):
   - Fast (3-5 seconds)
   - Simulates blockchain performance
   - Measures actual network response times
   - Recommended for demos

2. **"Real Blockchain Test"** (Green):
   - Slow (30-60 seconds)
   - Executes actual testnet transactions
   - Can fail due to testnet issues
   - Provides transaction hashes
   - Use for verification

### Can I use mainnet?

No, this demo uses testnets only. Mainnet transactions require:
- Real cryptocurrency
- Wallet management
- Security considerations
- Compliance requirements

For mainnet data, consider using:
- Blockchain explorers (read-only)
- Historical data APIs
- View-only integrations

### Why does XRPL test sometimes fail?

Common reasons:
1. Testnet faucet rate limits
2. Network congestion
3. Testnet maintenance
4. WebSocket connection issues

**Solution:** Use "Run Network Test" for reliable results.

## Getting Help

If you're still having issues:

1. Check the browser console (F12)
2. Check the terminal/server logs
3. Try the simple network test first
4. Verify all dependencies are installed
5. Restart the dev server

## Debug Mode

Enable detailed logging:

```typescript
// In src/app/comparison/page.tsx
const runLiveTest = async (useRealTransactions = false) => {
  console.log('Starting test, real transactions:', useRealTransactions);
  // ... rest of code
};
```

Check terminal and browser console for detailed error messages.
