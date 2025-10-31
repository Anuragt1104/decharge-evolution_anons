"use client";

import { useState, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import toast from "react-hot-toast";
import { createPlotClaimTransaction } from "@/lib/solana-pay";

const DECHARGE_PROGRAM_ID = new PublicKey("DeChrg11111111111111111111111111111111111111");

export function useClaimPlot() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const claimPlot = useCallback(
    async (regionKey: string) => {
      if (!publicKey) {
        setError("Wallet not connected");
        toast.error("Please connect your wallet first");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Create the transaction with payment to treasury
        const transaction = await createPlotClaimTransaction(
          publicKey,
          connection,
          regionKey,
          0.01 // 0.01 SOL cost
        );

        // Get the latest blockhash
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = publicKey;

        // Send the transaction
        const signature = await sendTransaction(transaction, connection);

        toast.loading(`Confirming transaction...`, { id: "claim-tx" });

        // Wait for confirmation
        const confirmation = await connection.confirmTransaction({
          signature,
          blockhash,
          lastValidBlockHeight,
        });

        if (confirmation.value.err) {
          throw new Error("Transaction failed");
        }

        toast.success(`Successfully claimed plot: ${regionKey}!`, {
          duration: 5000,
          icon: "🎉",
          id: "claim-tx",
        });

        // Trigger gateway to refetch world data
        try {
          await fetch(`${process.env.NEXT_PUBLIC_DECHARGE_GATEWAY || "http://localhost:8787"}/ingest`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "world_plot_claim",
              regionKey,
              wallet: publicKey.toBase58(),
              boosts: [],
            }),
          });
        } catch (e) {
          console.warn("Failed to update gateway:", e);
        }

        console.log(`Plot claimed: ${regionKey} by ${publicKey.toBase58()}`);
        console.log(`Transaction signature: ${signature}`);

        return signature;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to claim plot";
        setError(errorMessage);
        toast.error(errorMessage, { id: "claim-tx" });
        console.error("Claim error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [publicKey, connection, sendTransaction]
  );

  return {
    claimPlot,
    isLoading,
    error,
  };
}

export function useUpgradeCharger() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upgradeCharger = useCallback(
    async (regionKey: string, upgradeLevel: number) => {
      if (!publicKey) {
        setError("Wallet not connected");
        toast.error("Please connect your wallet first");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const { createChargerUpgradeTransaction } = await import("@/lib/solana-pay");

        // Create the transaction
        const transaction = await createChargerUpgradeTransaction(
          publicKey,
          connection,
          regionKey,
          upgradeLevel
        );

        // Get the latest blockhash
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = publicKey;

        // Send the transaction
        const signature = await sendTransaction(transaction, connection);

        toast.loading(`Upgrading charger...`, { id: "upgrade-tx" });

        // Wait for confirmation
        const confirmation = await connection.confirmTransaction({
          signature,
          blockhash,
          lastValidBlockHeight,
        });

        if (confirmation.value.err) {
          throw new Error("Transaction failed");
        }

        toast.success(`Charger upgraded to Level ${upgradeLevel}!`, {
          duration: 4000,
          icon: "⚡",
          id: "upgrade-tx",
        });

        console.log(`Charger upgraded: ${regionKey} to level ${upgradeLevel}`);
        console.log(`Transaction signature: ${signature}`);

        return signature;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to upgrade charger";
        setError(errorMessage);
        toast.error(errorMessage, { id: "upgrade-tx" });
        console.error("Upgrade error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [publicKey, connection, sendTransaction]
  );

  return {
    upgradeCharger,
    isLoading,
    error,
  };
}

