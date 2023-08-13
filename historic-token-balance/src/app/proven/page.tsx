import BalancesForm from '@/components/balancesForm/BalancesForm';
import GenerateProofServer from '@/components/generateProof/GenerateProofServer';
import Navbar from '@/components/layout/Navbar';
import { Axiom, AxiomConfig } from '@axiom-crypto/core';
import { ethers } from 'ethers';
import Image from 'next/image'
import Link from 'next/link';

interface PageProps {
  params: Params;
  searchParams: SearchParams;
}

interface Params {
  slug: string;
}

interface SearchParams {
  [key: string]: string | string[] | undefined;
}

export default async function Proof({ searchParams }: PageProps) {
  console.log(searchParams);

  // Parse searchParams for blockNumbers and contractAddresses
  const keccakQueryResponse = searchParams?.keccakQueryResponse;

  const renderMessage = () => {
    if (!keccakQueryResponse) {
      return "Proof generation failed."
    }
    return (
      <>
        <div>
          { "Proof generation succeeded. " }
          <Link href={`https://explorer.axiom.xyz/mainnet/query/${keccakQueryResponse}`} target="_blank">
            { "Click here to view your proof." }
          </Link>
        </div>
        <div>
          { "Documentation on " } 
          <Link href="https://docs.axiom.xyz/developers/using-proven-data-in-your-smart-contract" target="_blank">
            { "how to use proven data in your smart contract." }
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="flex flex-row w-full justify-between items-end">
        <div className="text-white text-3xl font-bold">
          Proof Generated
        </div>
        <div>
          <Link href="/">
            { "Start Over" }
          </Link>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        { renderMessage() }
      </div>
    </>
  )
}
