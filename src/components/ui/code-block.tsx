"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  language: string;
  filename?: string;
  highlightLines?: number[];
  code: string;
  className?: string;
}

export function CodeBlock({
  language,
  filename,
  highlightLines = [],
  code,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.split("\n");

  return (
    <div className={cn("relative w-full", className)}>
      {filename && (
        <div className="flex items-center justify-between bg-gray-800 text-gray-300 px-4 py-2 rounded-t-lg border-b border-gray-700">
          <span className="text-sm font-mono">{filename}</span>
          <span className="text-xs text-gray-500 uppercase">{language}</span>
        </div>
      )}
      <div className="relative">
        <pre className={cn(
          "bg-black text-gray-300 p-4 overflow-x-auto text-xs font-mono",
          filename ? "rounded-b-lg" : "rounded-lg"
        )}>
          <code>
            {lines.map((line, index) => {
              const lineNumber = index + 1;
              const isHighlighted = highlightLines.includes(lineNumber);
              return (
                <div
                  key={index}
                  className={cn(
                    "table-row",
                    isHighlighted && "bg-blue-500/10"
                  )}
                >
                  <span className="table-cell pr-4 text-gray-600 select-none text-right">
                    {lineNumber}
                  </span>
                  <span className={cn(
                    "table-cell",
                    isHighlighted && "text-blue-400"
                  )}>
                    {line}
                  </span>
                </div>
              );
            })}
          </code>
        </pre>
        <button
          onClick={copyToClipboard}
          className="absolute top-3 right-3 p-2 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          aria-label="Copy code"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-400" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
