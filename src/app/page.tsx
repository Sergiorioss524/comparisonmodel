'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CodeBlock } from '@/components/ui/code-block';
import { Activity, Zap, Terminal, Code2, DollarSign, Clock, CheckCircle2 } from 'lucide-react';

interface LogEntry {
  id: string;
  message: string;
  network?: string;
  timestamp: Date;
  type: 'log' | 'error' | 'result';
}

interface TransactionResult {
  network: string;
  fee: number;
  time: number;
  success: boolean;
  transactionHash?: string;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [results, setResults] = useState<TransactionResult[]>([]);
  const logsEndRef = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const scrollToBottom = (network: string) => {
    logsEndRef.current[network]?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (logs.length > 0) {
      const lastLog = logs[logs.length - 1];
      if (lastLog.network) {
        scrollToBottom(lastLog.network);
      }
    }
  }, [logs]);

  const runLiveTest = async () => {
    setIsLoading(true);
    setLogs([]);
    setResults([]);

    try {
      const response = await fetch('/api/test-transaction-stream', {
        method: 'POST',
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No reader available');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'result') {
                setResults(data.data.results);
              } else {
                const logEntry: LogEntry = {
                  id: Math.random().toString(36).substr(2, 9),
                  message: data.message,
                  network: data.network,
                  timestamp: new Date(),
                  type: data.type,
                };
                setLogs(prev => [...prev, logEntry]);
              }
            } catch (e) {
              console.error('Failed to parse log:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Stream error:', error);
      setLogs(prev => [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        type: 'error',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getLogsByNetwork = (network: string) => {
    return logs.filter(log => log.network === network);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-4">
              Blockchain Performance
              <span className="block text-gray-600 mt-2">Comparison Tool</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Real-time analysis of transaction fees and confirmation times across leading blockchain networks.
            </p>
            <Button
              onClick={runLiveTest}
              disabled={isLoading}
              size="lg"
              className="text-base"
            >
              {isLoading ? (
                <>
                  <Activity className="mr-2 h-5 w-5 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-5 w-5" />
                  Run Live Test
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Live Logs in 3 Columns */}
        {logs.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Terminal className="h-6 w-6 mr-2" />
              Live Connection Logs
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Tron Column */}
              <Card className="border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <div className="w-3 h-3 rounded-full bg-black mr-2"></div>
                    Tron Network
                  </CardTitle>
                  <CardDescription>USDT-TRC20 Transfer</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-black rounded-lg p-4 font-mono text-xs h-96 overflow-y-auto">
                    {getLogsByNetwork('Tron').map((log) => (
                      <div
                        key={log.id}
                        className={`mb-2 ${
                          log.type === 'error'
                            ? 'text-red-400'
                            : 'text-green-400'
                        }`}
                      >
                        <span className="text-gray-500">
                          [{log.timestamp.toLocaleTimeString()}]
                        </span>
                        <span className="ml-2">{log.message}</span>
                      </div>
                    ))}
                    <div ref={(el) => { logsEndRef.current['Tron'] = el; }} />
                  </div>
                </CardContent>
              </Card>

              {/* Ethereum Column */}
              <Card className="border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <div className="w-3 h-3 rounded-full bg-gray-600 mr-2"></div>
                    Ethereum Network
                  </CardTitle>
                  <CardDescription>USDT-ERC20 Transfer</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-black rounded-lg p-4 font-mono text-xs h-96 overflow-y-auto">
                    {getLogsByNetwork('Ethereum').map((log) => (
                      <div
                        key={log.id}
                        className={`mb-2 ${
                          log.type === 'error'
                            ? 'text-red-400'
                            : 'text-blue-400'
                        }`}
                      >
                        <span className="text-gray-500">
                          [{log.timestamp.toLocaleTimeString()}]
                        </span>
                        <span className="ml-2">{log.message}</span>
                      </div>
                    ))}
                    <div ref={(el) => { logsEndRef.current['Ethereum'] = el; }} />
                  </div>
                </CardContent>
              </Card>

              {/* XRPL Column */}
              <Card className="border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <div className="w-3 h-3 rounded-full bg-gray-400 mr-2"></div>
                    XRP Ledger
                  </CardTitle>
                  <CardDescription>Native XRP Transfer</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-black rounded-lg p-4 font-mono text-xs h-96 overflow-y-auto">
                    {getLogsByNetwork('XRPL').map((log) => (
                      <div
                        key={log.id}
                        className={`mb-2 ${
                          log.type === 'error'
                            ? 'text-red-400'
                            : 'text-purple-400'
                        }`}
                      >
                        <span className="text-gray-500">
                          [{log.timestamp.toLocaleTimeString()}]
                        </span>
                        <span className="ml-2">{log.message}</span>
                      </div>
                    ))}
                    <div ref={(el) => { logsEndRef.current['XRPL'] = el; }} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Results Summary */}
        {results.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Test Results Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {results.map((result, index) => (
                <Card key={index} className={`border-2 ${result.success ? 'border-green-600' : 'border-red-600'}`}>
                  <CardHeader>
                    <CardTitle className="text-lg text-gray-900 flex items-center justify-between">
                      {result.network}
                      {result.success && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                    </CardTitle>
                    <CardDescription>
                      {result.success ? (
                        <span className="text-green-600 font-medium">✓ Success</span>
                      ) : (
                        <span className="text-red-600 font-medium">✗ Failed</span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center text-gray-600">
                          <DollarSign className="h-4 w-4 mr-1" />
                          <span className="text-sm font-medium">Fee</span>
                        </div>
                        <span className="text-2xl font-bold text-gray-900">
                          ${result.fee < 0.01 ? result.fee.toFixed(6) : result.fee.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-4 w-4 mr-1" />
                          <span className="text-sm font-medium">Time</span>
                        </div>
                        <span className="text-2xl font-bold text-gray-900">
                          {result.time}s
                        </span>
                      </div>
                      {result.transactionHash && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <dt className="text-xs text-gray-500 mb-1 font-medium">Transaction Hash:</dt>
                          <dd className="text-xs font-mono text-gray-700 break-all bg-gray-50 p-2 rounded">
                            {result.transactionHash}
                          </dd>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Code Snippets for Engineers */}
        {results.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Code2 className="h-6 w-6 mr-2" />
              Implementation Details
            </h2>
            <div className="grid grid-cols-1 gap-6">
              {/* XRPL Code */}
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg">XRPL Implementation</CardTitle>
                  <CardDescription>Real testnet transaction using xrpl.js</CardDescription>
                </CardHeader>
                <CardContent>
                  <CodeBlock
                    language="typescript"
                    filename="xrpl-transaction.ts"
                    highlightLines={[7, 8, 12, 13, 14, 15, 16, 17, 19, 20, 22, 23, 24]}
                    code={`import { Client, Wallet, xrpToDrops } from 'xrpl';

const client = new Client('wss://s.altnet.rippletest.net:51233');
await client.connect();

const bankAWallet = Wallet.generate();
const fundResult = await client.fundWallet(bankAWallet);
const fundedWallet = fundResult.wallet;

const bankBWallet = Wallet.generate();

const prepared = await client.autofill({
  TransactionType: 'Payment',
  Account: fundedWallet.address,
  Amount: xrpToDrops(10),
  Destination: bankBWallet.address,
});

const signed = fundedWallet.sign(prepared);
const result = await client.submitAndWait(signed.tx_blob);

const feeInDrops = parseInt(prepared.Fee || '10');
const feeInXRP = feeInDrops / 1000000;
const feeInUSD = feeInXRP * 2.5;`}
                  />
                </CardContent>
              </Card>

              {/* Ethereum Code */}
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg">Ethereum Implementation</CardTitle>
                  <CardDescription>USDT ERC-20 transfer simulation using ethers.js</CardDescription>
                </CardHeader>
                <CardContent>
                  <CodeBlock
                    language="typescript"
                    filename="ethereum-usdt.ts"
                    highlightLines={[3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 22, 23, 24, 26, 27, 28]}
                    code={`import { ethers } from 'ethers';

const rpcEndpoints = [
  'https://rpc.sepolia.org',
  'https://eth-sepolia.public.blastapi.io',
  'https://ethereum-sepolia-rpc.publicnode.com'
];

let provider: ethers.JsonRpcProvider | null = null;
for (const endpoint of rpcEndpoints) {
  try {
    const testProvider = new ethers.JsonRpcProvider(endpoint);
    await testProvider.getBlockNumber();
    provider = testProvider;
    break;
  } catch {
    continue;
  }
}

const bankAWallet = ethers.Wallet.createRandom();
const bankBWallet = ethers.Wallet.createRandom();

const USDT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7';

const gasEstimate = 65000n;
const feeData = await provider.getFeeData();
const gasPrice = feeData.gasPrice || ethers.parseUnits('25', 'gwei');

const gasCost = gasEstimate * gasPrice;
const feeInETH = Number(ethers.formatEther(gasCost));
const feeInUSD = feeInETH * 3000;`}
                  />
                </CardContent>
              </Card>

              {/* Tron Code */}
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg">Tron Implementation</CardTitle>
                  <CardDescription>USDT TRC-20 transfer simulation using Tron API</CardDescription>
                </CardHeader>
                <CardContent>
                  <CodeBlock
                    language="typescript"
                    filename="tron-usdt.ts"
                    highlightLines={[1, 2, 3, 8, 9, 11, 13, 14, 15, 16]}
                    code={`const response = await fetch('https://api.trongrid.io/wallet/getnowblock', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
});

const data = await response.json();
const blockNumber = data.block_header?.raw_data?.number;

const bankAAddress = 'T' + Math.random().toString(36).substring(2, 15).toUpperCase();
const bankBAddress = 'T' + Math.random().toString(36).substring(2, 15).toUpperCase();

const USDT_TRC20 = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';

const energyUnits = 31895;
const bandwidthBytes = 345;
const feeInTRX = 1.2;
const feeInUSD = feeInTRX * 0.1;`}
                  />
                </CardContent>
              </Card>

              {/* API Route */}
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg">API Route (Server-Sent Events)</CardTitle>
                  <CardDescription>Next.js API route for real-time log streaming</CardDescription>
                </CardHeader>
                <CardContent>
                  <CodeBlock
                    language="typescript"
                    filename="route.ts"
                    highlightLines={[3, 5, 6, 7, 10, 11, 12, 13, 15, 16, 17, 24, 25, 26, 27]}
                    code={`export async function POST() {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendLog = (log: LogMessage) => {
        const message = \`data: \${JSON.stringify(log)}\\n\\n\`;
        controller.enqueue(encoder.encode(message));
      };

      const [xrplResult, ethResult, tronResult] = await Promise.all([
        testXRPLWithLogs(sendLog),
        testEthereumWithLogs(sendLog),
        testTronWithLogs(sendLog),
      ]);

      sendLog({
        type: 'result',
        data: { results: [xrplResult, ethResult, tronResult] },
      });

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}`}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 text-center text-gray-500 text-sm border-t border-gray-200 pt-8">
          <p>
            Real-time blockchain performance comparison tool. Data refreshed on each test run.
          </p>
          <p className="mt-2">
            Built with Next.js 15, TypeScript, and Tailwind CSS
          </p>
        </div>
      </div>
    </div>
  );
}
