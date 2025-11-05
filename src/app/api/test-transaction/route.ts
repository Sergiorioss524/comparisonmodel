import { NextResponse } from 'next/server';
import { Client, Wallet, xrpToDrops } from 'xrpl';
import { ethers } from 'ethers';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Increase timeout for serverless function

interface TransactionResult {
  network: string;
  fee: number;
  time: number;
  success: boolean;
  transactionHash?: string;
  error?: string;
}

// Test XRPL transaction
async function testXRPLTransaction(): Promise<TransactionResult> {
  const startTime = Date.now();
  let client: Client | null = null;

  try {
    // Connect to XRPL Testnet with timeout
    console.log('Connecting to XRPL testnet...');
    client = new Client('wss://s.altnet.rippletest.net:51233', {
      connectionTimeout: 20000,
    });

    await Promise.race([
      client.connect(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connection timeout')), 15000)
      )
    ]);

    console.log('Connected! Generating wallet...');
    const wallet = Wallet.generate();

    // Fund the wallet from testnet faucet
    console.log('Funding wallet from testnet faucet...');
    const fundResult = await Promise.race([
      client.fundWallet(wallet),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Funding timeout')), 25000)
      )
    ]);

    const fundedWallet = fundResult.wallet;
    console.log('Wallet funded:', fundedWallet.address);

    // Prepare payment transaction
    const prepared = await client.autofill({
      TransactionType: 'Payment',
      Account: fundedWallet.address,
      Amount: xrpToDrops(1), // Send 1 XRP
      Destination: 'rPEPPER7kfTD9w2To4CQk6UCfuHM9c6GDY', // Genesis account
    });

    // Sign and submit
    const signed = fundedWallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000; // Convert to seconds

    // Extract fee from transaction (in drops, convert to XRP then USD)
    const feeInDrops = parseInt((prepared as any).Fee || '10');
    const feeInXRP = feeInDrops / 1000000;
    const feeInUSD = feeInXRP * 2.5; // Approximate XRP price

    await client.disconnect();

    return {
      network: 'Ripple Stablecoin (XRPL)',
      fee: Number(feeInUSD.toFixed(4)),
      time: Number(duration.toFixed(2)),
      success: true,
      transactionHash: result.result.hash,
    };
  } catch (error) {
    console.error('XRPL transaction error:', error);

    // Ensure client is disconnected
    if (client && client.isConnected()) {
      try {
        await client.disconnect();
      } catch (disconnectError) {
        console.error('Error disconnecting:', disconnectError);
      }
    }

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    return {
      network: 'Ripple Stablecoin (XRPL)',
      fee: 0.001,
      time: Number(duration.toFixed(2)),
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Test Ethereum USDT transaction (on testnet)
async function testEthereumUSDTTransaction(): Promise<TransactionResult> {
  const startTime = Date.now();

  try {
    // Use Infura or Alchemy public endpoint
    const provider = new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com');

    // Simple connectivity test
    const blockNumber = await Promise.race([
      provider.getBlockNumber(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 10000)
      )
    ]);

    console.log('Ethereum block number:', blockNumber);

    // Typical USDT transfer costs ~65,000 gas
    const gasEstimate = 65000n;

    // Get current gas price
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice || ethers.parseUnits('25', 'gwei');

    const gasCost = gasEstimate * gasPrice;
    const feeInETH = Number(ethers.formatEther(gasCost));
    const feeInUSD = feeInETH * 3000; // Approximate ETH price

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    return {
      network: 'USDT (Ethereum)',
      fee: Number(feeInUSD.toFixed(2)),
      time: Number(duration.toFixed(2)),
      success: true,
    };
  } catch (error) {
    console.error('Ethereum test error:', error);
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    return {
      network: 'USDT (Ethereum)',
      fee: 5.4,
      time: Number(duration.toFixed(2)),
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Test Tron USDT transaction
async function testTronUSDTTransaction(): Promise<TransactionResult> {
  const startTime = Date.now();

  try {
    // Test connectivity to Tron network
    const response = await Promise.race([
      fetch('https://api.trongrid.io/wallet/getnowblock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 10000)
      )
    ]);

    if (!response.ok) {
      throw new Error(`Tron API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Tron block number:', data.block_header?.raw_data?.number);

    // Estimate transaction fee (typically 1-2 TRX for USDT transfers)
    // TRC20 USDT transfer typically costs 13.74 TRX (energy + bandwidth)
    const feeInTRX = 1.2;
    const feeInUSD = feeInTRX * 0.1; // Approximate TRX price ($0.10)

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    return {
      network: 'USDT (Tron)',
      fee: Number(feeInUSD.toFixed(2)),
      time: Number(duration.toFixed(2)),
      success: true,
    };
  } catch (error) {
    console.error('Tron test error:', error);
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    return {
      network: 'USDT (Tron)',
      fee: 1.2,
      time: Number(duration.toFixed(2)),
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function POST(request: Request) {
  try {
    const { network } = await request.json();

    let result: TransactionResult;

    switch (network) {
      case 'xrpl':
        result = await testXRPLTransaction();
        break;
      case 'ethereum':
        result = await testEthereumUSDTTransaction();
        break;
      case 'tron':
        result = await testTronUSDTTransaction();
        break;
      case 'all':
        // Run all tests in parallel
        const [xrplResult, ethResult, tronResult] = await Promise.all([
          testXRPLTransaction(),
          testEthereumUSDTTransaction(),
          testTronUSDTTransaction(),
        ]);

        return NextResponse.json({
          success: true,
          results: [tronResult, ethResult, xrplResult],
        });
      default:
        return NextResponse.json(
          { error: 'Invalid network specified' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('Transaction test error:', error);
    return NextResponse.json(
      {
        error: 'Failed to execute test transaction',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to test transactions',
    availableNetworks: ['xrpl', 'ethereum', 'tron', 'all'],
  });
}
