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
  const address = searchParams?.address as string ?? "";

  // Parse searchParams for blockNumbers and contractAddresses
  const walletAddress = searchParams?.walletAddress;
  const blockNumbers = searchParams?.blockNumber ?? [];
  const contractAddresses = searchParams?.contractAddress ?? [];
  let queryRows = [];
  for (let i = 0; i < blockNumbers?.length; i++) {
    if (blockNumbers[i] === '' || contractAddresses[i] === '') {
      continue;
    }
    const abiCoder = ethers.AbiCoder.defaultAbiCoder();
    const slot = ethers.keccak256(abiCoder.encode(["address", "uint256"], [walletAddress, 0]));
    const queryRow = {
      blockNumber: parseInt(blockNumbers[i]),
      address: contractAddresses[i],
      slot,
    }
    queryRows.push(queryRow);
  }
  console.log(queryRows);

  const renderMessage = () => {
    if (!walletAddress || queryRows.length === 0) {
      return "Query must have at least one block number and one contract address."
    }
    return (
      <div>
        { "Constructed a Query into Axiom whose contents you can view below. To generate a proof, use the botton at the bottom to submit an on-chain transaction to begin the proof generation process." }
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-row w-full justify-between items-end">
        <div className="text-white text-3xl font-bold">
          Axiom Query
        </div>
        <div>
          <Link href="/">
            { "Back" }
          </Link>
        </div>
      </div>
      <div>
        { renderMessage() }
      </div>
      <GenerateProofServer queryRows={queryRows} />
    </>
  )
}
