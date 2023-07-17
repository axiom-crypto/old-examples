"use client";

import { useAccount } from "wagmi";
import { JsonRpcProvider } from "ethers";
import { numberToHex } from "viem";
import { getProof } from "@/shared/provider";
import { useRouter } from "next/navigation";

export default function NonceCheck({ children }: { children: React.ReactNode}) {
  const { address, isConnected } = useAccount();
  const router = useRouter();

  if (!isConnected || !address) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-2">
      { children }
    </div>
  )
}