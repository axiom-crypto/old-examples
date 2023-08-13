"use client";

import Link from "next/link";
import ConnectWallet from "../ConnectWallet";
import { useSearchParams } from "next/navigation";

export default function Navbar() {
  const searchParams = useSearchParams();
  const addressVerify = searchParams.get('addressVerify') ?? "";

  return (
    <div className="flex flex-row justify-between items-center w-full px-8 py-4 border-b-[2px] border-darkgrey">
      <Link href="/" className="text-xl text-white font-mono">
        <div >
          Axiom Examples
        </div>
      </Link>
      <div className="flex flex-row items-center gap-4">
        <Link href="https://axiom.xyz">
          Axiom
        </Link>
        <Link href="https://docs.axiom.xyz">
          Docs
        </Link>
        <ConnectWallet addressVerify={addressVerify} />
      </div>
    </div>
  )
}