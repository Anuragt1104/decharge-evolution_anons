"use client";

import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import toast from "react-hot-toast";
import { createPointsPurchaseTransaction } from "@/lib/solana-pay";

interface SolanaPayButtonProps {
  itemId: string;
  itemName: string;
  pointsCost: number;
  priceUsd: number;
  onSuccess?: () => void;
}

export function SolanaPayButton({ itemId, itemName, pointsCost, priceUsd, onSuccess }: SolanaPayButtonProps) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async () => {
    if (!publicKey) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsProcessing(true);

    try {
      // Convert USD to SOL (mock rate: 1 SOL = $100)
      const solPrice = priceUsd / 100;

      // Create transaction
      const transaction = await createPointsPurchaseTransaction(
        publicKey,
        connection,
        pointsCost,
        solPrice
      );

      // Get latest blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Send transaction
      const signature = await sendTransaction(transaction, connection);

      toast.loading(`Processing payment...`, { id: "purchase-tx" });

      // Confirm transaction
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });

      if (confirmation.value.err) {
        throw new Error("Transaction failed");
      }

      toast.success(`Successfully purchased ${itemName}!`, {
        duration: 5000,
        icon: "🎁",
        id: "purchase-tx",
      });

      // Notify gateway
      try {
        await fetch(`${process.env.NEXT_PUBLIC_DECHARGE_GATEWAY || "http://localhost:8787"}/ingest`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "points_purchase",
            itemId,
            wallet: publicKey.toBase58(),
            points: pointsCost,
          }),
        });
      } catch (e) {
        console.warn("Failed to update gateway:", e);
      }

      console.log(`Purchase completed: ${itemName}`);
      console.log(`Transaction signature: ${signature}`);

      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to complete purchase";
      toast.error(errorMessage, { id: "purchase-tx" });
      console.error("Purchase error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button
      onClick={handlePurchase}
      disabled={isProcessing || !publicKey}
      className="mt-4 inline-flex items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-r from-emerald-500 to-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:from-emerald-600 hover:to-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isProcessing ? "Processing..." : publicKey ? "Purchase with SOL" : "Connect Wallet"}
    </button>
  );
}

