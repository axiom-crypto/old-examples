import { useAccount } from "wagmi";
import { JsonRpcProvider } from "ethers";
import { getProof } from "@/shared/provider";

interface NonceConnectProps {
  isConnected: boolean;
  address: string;
}

interface SearchParams {
  [key: string]: string | undefined;
}

interface PageProps {
  params: NonceConnectProps;
  searchParams: SearchParams;
}

export default async function NonceConnect({ searchParams }: PageProps) {
  const { address, isConnected } = searchParams;

  if (!isConnected || !address) {
    return null;
  }

  const providerUri = process.env.PROVIDER_URI as string;
  const provider = new JsonRpcProvider(providerUri);
  const proof0 = await getProof(provider, address as string, 6120000);
  const proof1 = await getProof(provider, address as string, 10430000);

  console.log("proof0", proof0)

  return (
    <>
      <div>
        Nonce at 6120000: {}
      </div>
      <div>
        Nonce at 10430000: {}
      </div>
    </>
  )
}

