import BalancesForm from '@/components/balancesForm/BalancesForm';

interface PageProps {
  params: Params;
  searchParams: SearchParams;
}

interface Params {
  slug: string;
}

interface SearchParams {
  [key: string]: string | undefined;
}

export default async function Home({ searchParams }: PageProps) {
  let address = searchParams?.address as string ?? "";
  if (address.includes(",")) {
    address = address.split(",")[0];
  }
  return (
    <>
      <div className="text-white text-3xl font-bold">
        Historic Token Balance Example
      </div>
      <div>
        { "Get the historic token balance(s) for any Ethereum address. For each ERC-20 token contract address, enter a historic block number as well. Specify up to eight block number and contract address pairs below (AxiomV1Query supports up to 64 rows, but we use 8 for simplicity in this example)." }
      </div>
      <BalancesForm defaultAddress={address} />
    </>
  )
}
