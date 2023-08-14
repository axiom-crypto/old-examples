import { getCurrentBlock } from "@/shared/provider";
import LabeledInput from "../ui/LabeledInput";
import Button from "../ui/Button";
import FloatingInfoOverlay from "./FloatingInfoOverlay";

export default async function BalancesForm({
  defaultAddress,
}: {
  defaultAddress: string;
}) {
  const currentBlock = await getCurrentBlock();

  const renderInputRow = (i: number) => {
    return (
      <div className="flex flex-row relative justify-start items-center gap-[1em]" key={i}>
        <LabeledInput label="Block number" name="blockNumber" placeholder={`0 to ${currentBlock}`} defaultValue="" maxLength={8} width="w-[10em]" />
        <LabeledInput label="ERC20/ERC721 contract address" name="contractAddress" placeholder="<ERC20 contract address>" defaultValue="" maxLength={42} width="w-[28em]" />
        <LabeledInput label="Balance mapping slot" name="slot" placeholder="0" defaultValue="" maxLength={66} width="w-[10em]" />
        <div className="absolute top-[-3px] right-4 cursor-default">
          <FloatingInfoOverlay />
        </div>
      </div>
    )
  }

  return (
    <form action="/generate" className="flex flex-col gap-4">
      <div className="flex flex-col w-full">
        <LabeledInput label="Wallet address for balance query" name="walletAddress" placeholder="Any wallet address" defaultValue={defaultAddress} maxLength={42} width="w-[50em]" />
      </div>

      { new Array(8).fill(0).map((_, i) => renderInputRow(i)) }

      <div className="flex flex-col w-full py-4">
        <Button type="submit">Build Axiom Query</Button>
      </div>
    </form>
  )
}