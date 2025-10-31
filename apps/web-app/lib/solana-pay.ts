"use client";

import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { encodeURL, createQR, TransactionRequestURLFields, findReference } from "@solana/pay";
import type { Connection } from "@solana/web3.js";

export const PLATFORM_TREASURY = new PublicKey("DeChrg11111111111111111111111111111111111111");

interface CreatePaymentParams {
  recipient: PublicKey;
  amount: number; // in SOL
  label: string;
  message: string;
  memo?: string;
}

export function createPaymentRequest({
  recipient,
  amount,
  label,
  message,
  memo,
}: CreatePaymentParams): TransactionRequestURLFields {
  const reference = PublicKey.unique();

  return {
    link: new URL(`solana:${recipient.toBase58()}`),
    label,
    message,
    amount,
    reference,
    memo,
  };
}

export function generatePaymentQR(paymentRequest: TransactionRequestURLFields): string {
  const url = encodeURL(paymentRequest);
  const qr = createQR(url);
  return qr.toDataURL();
}

export async function createPlotClaimTransaction(
  payer: PublicKey,
  connection: Connection,
  regionKey: string,
  plotPrice: number = 0.01
): Promise<Transaction> {
  const transaction = new Transaction();

  // Add payment to platform treasury
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: payer,
      toPubkey: PLATFORM_TREASURY,
      lamports: plotPrice * LAMPORTS_PER_SOL,
    })
  );

  // In production, add the actual claim_world_plot instruction here
  // const plotPDA = PublicKey.findProgramAddressSync(
  //   [Buffer.from("world_plot"), Buffer.from(regionKey)],
  //   DECHARGE_PROGRAM_ID
  // )[0];
  //
  // transaction.add(
  //   await program.methods
  //     .claimWorldPlot(regionKeyBytes)
  //     .accounts({ ... })
  //     .instruction()
  // );

  return transaction;
}

export async function createChargerUpgradeTransaction(
  payer: PublicKey,
  connection: Connection,
  regionKey: string,
  upgradeLevel: number
): Promise<Transaction> {
  const transaction = new Transaction();

  const upgradeCosts = [0, 0.01, 0.05, 0.15]; // SOL costs for each level
  const cost = upgradeCosts[upgradeLevel] || 0.01;

  transaction.add(
    SystemProgram.transfer({
      fromPubkey: payer,
      toPubkey: PLATFORM_TREASURY,
      lamports: cost * LAMPORTS_PER_SOL,
    })
  );

  // In production, add the actual upgrade instruction
  return transaction;
}

export async function createPointsPurchaseTransaction(
  payer: PublicKey,
  connection: Connection,
  pointsAmount: number,
  priceInSol: number
): Promise<Transaction> {
  const transaction = new Transaction();

  transaction.add(
    SystemProgram.transfer({
      fromPubkey: payer,
      toPubkey: PLATFORM_TREASURY,
      lamports: priceInSol * LAMPORTS_PER_SOL,
    })
  );

  // In production, add the actual purchase_points instruction
  return transaction;
}

export async function verifyTransaction(
  connection: Connection,
  signature: string,
  recipient: PublicKey,
  amount: number,
  reference: PublicKey
): Promise<boolean> {
  try {
    const found = await findReference(connection, reference, { finality: "confirmed" });
    return !!found.signature;
  } catch (error) {
    console.error("Transaction verification failed:", error);
    return false;
  }
}

