import { 
  Axiom,
  AxiomConfig,
  SolidityAccountResponse,
  SolidityBlockResponse,
  SolidityStorageResponse,
  ValidationWitnessResponse,
} from '@axiom-crypto/core';
import type { QueryBuilder } from '@axiom-crypto/core/query/queryBuilder';
import { ethers, keccak256 } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

import { abi as bearlieverAbi } from "../contracts/out/Bearliever.sol/Bearliever.json";

const bearlieverAddress = "0x3cbba4f0cb2b2ff6138370eff10b8fa252b6a217"; // Update w/ your local deployment 
const keccakQueryResponse = "0x4da5b7574f5a3a6b2d44be2d02c4418b03306a97582c590e31da7c29c460c16d";
const providerUri = process.env.PROVIDER_URI ?? 'http://localhost:8545';
const provider = new ethers.JsonRpcProvider(providerUri);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider);

if (!process.env.PRIVATE_KEY) {
  throw new Error("PRIVATE_KEY environment variable is not set");
}

const config: AxiomConfig = {
  providerUri,
  version: "v1",
  chainId: 1,
};
const ax = new Axiom(config);

const queryData = [
  {
    blockNumber: 6120000,
    address: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045", // vitalik.eth
  }, {
    blockNumber: 10430000,
    address: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045", // replace these with your own address
  }
];

async function buildQuery() {
  const qb = ax.newQueryBuilder();
  await qb.append(queryData[0]);
  await qb.append(queryData[1]);
  return qb;
}

async function submitQuery(qb: QueryBuilder) {
  const { keccakQueryResponse, queryHash, query } = await qb.build();
  console.log("keccakQueryResponse", keccakQueryResponse);
  console.log("queryHash", queryHash);
  console.log("query", query);
  
  const axiomV1Query = new ethers.Contract(
    ax.getAxiomQueryAddress() as string,
    ax.getAxiomQueryAbi(),
    wallet
  );

  const txResult = await axiomV1Query.sendQuery(
    keccakQueryResponse,
    wallet.address,
    query,
    {
      value: ethers.parseEther("0.01"), // Mainnet payment value
    }
  );
  const txReceipt = await txResult.wait(); 
  console.log("sendQuery Receipt", txReceipt);

  axiomV1Query.on("QueryFulfilled", async (keccakQueryResponse, _payment, _prover) => {
    mintTransaction(keccakQueryResponse);
  });
}

async function mintTransaction(keccakQueryResponse: string) {
  const responseTree = await ax.query.getResponseTreeForKeccakQueryResponse(keccakQueryResponse);
  // const responseTree = await qb.getResponseTree();
  if (!responseTree) {
    throw new Error("Response tree is undefined");
  }
  const keccakBlockResponse = responseTree.blockTree.getHexRoot();
  const keccakAccountResponse = responseTree.accountTree.getHexRoot();
  const keccakStorageResponse = responseTree.storageTree.getHexRoot();

  const responses = {
    keccakBlockResponse,
    keccakAccountResponse,
    keccakStorageResponse,
    blockResponses: [] as SolidityBlockResponse[],
    accountResponses: [] as SolidityAccountResponse[],
    storageResponses: [] as SolidityStorageResponse[],
  };
  for (let i = 0; i < queryData.length; i++) {
    const witness: ValidationWitnessResponse = ax.query.getValidationWitness(
      responseTree,
      queryData[i].blockNumber,
      queryData[i].address
    ) as ValidationWitnessResponse;
    if (witness.accountResponse) {
      responses.accountResponses.push(witness.accountResponse);
    }
  }
  console.log(responses);
  
  const bearliever = new ethers.Contract(
    bearlieverAddress,
    bearlieverAbi,
    wallet
  );
  const txResult = await bearliever.mint(responses);
  console.log("setNumber tx", txResult);
  const txReceipt = await txResult.wait();
  console.log("setNumber Receipt", txReceipt);
}

async function buildAndSubmit() {
  const qb = await buildQuery();
  await submitQuery(qb);
}

// Step 1: First, call this function. Once the `keccakQueryResponse` has been submitted to the
// AxiomV1Query function, subsequent calls will revert since the `keccakQueryResponse` is saved 
// to contract storage already.
buildAndSubmit();

// After the Query has been fulfilled, you may want to mint another NFT. You can do so by 
// uncommenting the following line (be sure to comment the above buildAndSubmit() function call):
// mintTransaction(keccakQueryResponse)