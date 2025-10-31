"use client";

import { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import {
  CoinbaseWalletAdapter,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";

import { clusterApiUrl } from "@solana/web3.js";

import "@solana/wallet-adapter-react-ui/styles.css";

interface WalletProviderProps {
  children: React.ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const endpoint = useMemo(() => clusterApiUrl("devnet"), []);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new CoinbaseWalletAdapter(),
      new TorusWalletAdapter(),
    ],
    [],
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="flex min-h-screen flex-col">
            <header className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
                  ⚡️
                </span>
                <div>
                  <p className="text-sm uppercase tracking-wide text-emerald-200/80">
                    DeCharge Evolution
                  </p>
                  <h1 className="text-lg font-semibold text-white">Network Command</h1>
                </div>
              </div>
              <WalletMultiButton className="wallet-adapter-button wallet-adapter-button-trigger !bg-emerald-500/90 !px-4 !py-2 !text-sm !backdrop-blur" />
            </header>
            <div className="flex-1">{children}</div>
          </div>
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}