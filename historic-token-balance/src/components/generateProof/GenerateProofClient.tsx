"use client";

import { useAccount, useContractEvent, useContractRead, useContractWrite, usePrepareContractWrite } from "wagmi";
import { parseEther } from "viem";
import { useEffect, useState } from "react";
import Button from "../ui/Button";
import Link from "next/link";
import { CodeBlock, dracula } from "react-code-blocks";
import { useRouter } from "next/navigation";

interface GenerateProofClientProps {
  keccakQueryResponse: string;
  query: string;
  blockNumber: number;
  axiomV1QueryAddress: string;
  axiomV1QueryAbi: any;
  outStr: string;
}

export default function GenerateProofClient(props: GenerateProofClientProps) {
  const { keccakQueryResponse, query, blockNumber, axiomV1QueryAddress, axiomV1QueryAbi, outStr } = props;
  const { address } = useAccount();
  const router = useRouter();

  // Prepare hook for the sendQuery transaction
  const { config } = usePrepareContractWrite({
    address: axiomV1QueryAddress as `0x${string}`,
    abi: axiomV1QueryAbi,
    functionName: 'sendQuery',
    args: [keccakQueryResponse, address, query],
    value: parseEther("0.01"),
  });
  const { data, isLoading, isSuccess, write } = useContractWrite(config);

  // Check that the AxiomV1Query `queries` mapping doesn't already contain this `keccakQueryResponse`
  const { data: queryExists, isLoading: queryExistsLoading } = useContractRead({
    address: axiomV1QueryAddress as `0x${string}`,
    abi: axiomV1QueryAbi,
    functionName: 'queries',
    args: [keccakQueryResponse],
  });

  const proofGeneratedAction = () => {
    router.push(`proven/?address=${address}&keccakQueryResponse=${keccakQueryResponse}`);
  }

  // If the `keccakQueryResponse` has status 2 (Fulfilled), then the proof has been generated
  useEffect(() => {
    if (queryExists?.[1] === 2) {
      proofGeneratedAction();
    }
  }, [queryExists]);
  
  // Add listener for QueryFulfilled event
  useContractEvent({
    address: axiomV1QueryAddress as `0x${string}`,
    abi: axiomV1QueryAbi,
    eventName: 'QueryFulfilled',
    listener(log) {
      console.log(log);
      proofGeneratedAction();
    },
  })

  const renderLoading = () => {
    if (!isLoading) {
      return null;
    }
    return (
      <div>
        Transaction processing...
      </div>
    )
  }

  const renderSuccess = () => {
    if (!isSuccess) {
      return null;
    }
    return (
      <div className="flex flex-col items-center">
        <div>
          { "Proof successfully submitted to Axiom. Proof can take 1-3 minutes to generate..." }
        </div>
        <div>
          { "You'll automatically be redirected when the proof is complete." }
        </div>
      </div>
    )
  }

  const renderProofGenStatus = () => {
    return (
      <>
        { renderLoading() }
        { renderSuccess() }
      </>
    )
  }

  return (
    <>
      <div>
        <div>
          Data to be proven:
        </div>
        <div className="text-sm font-mono">
          <CodeBlock text={outStr} language="typescript" showLineNumbers={false} theme={dracula} />
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Button
          disabled={isLoading || isSuccess}
          onClick={() => {
            write?.()
          }}
        >
          { !(isLoading || isSuccess) ? "Generate Proof (0.01 ETH)" : "Generating proof..." }
        </Button>
        { renderProofGenStatus() }
      </div>
    </>
  )
}