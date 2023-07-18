"use client";

import { Config } from "@/shared/config";
import { useAccount, useContractWrite, usePrepareContractWrite } from "wagmi";
import bearlieverAbi from '@/shared/abi/Bearliever.json';

interface MintBearlieverButtonProps {
  responses: any;
}

export default function MintBearlieverButton(props: MintBearlieverButtonProps) {
  const { responses } = props;
  const { address } = useAccount();

  // Prepare the sendQuery transaction 
  const { config } = usePrepareContractWrite({
    address: Config.BEARLIEVER_ADDR as `0x${string}`,
    abi: bearlieverAbi.abi,
    functionName: 'mint',
    args: [responses],
  })
  const { data, isLoading, isSuccess, write } = useContractWrite(config);

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center">
        <div className="text-2xl font-bold">
          Bearliever NFT Minted!
        </div>
        <div>
          Tx hash: { data?.hash }
        </div>
      </div>
    )
  }

  return (
    <button 
      disabled={!write} 
      onClick={() => {
        console.log("Mint Bearliever");
        write?.();
      }}
      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 duration-100 cursor-pointer"
    >
      Mint Bearliever NFT
    </button>
  )
}