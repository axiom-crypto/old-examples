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

import { abi as specialCounterAbi } from "../contracts/out/SpecialCounter.sol/SpecialCounter.json";

const specialCounterAddress = "0x3cb574dab82327cce5bfc9b6877e66a0dcf90940";
const keccakQueryResponseForData = "0x903a839b0f0ae6da3baadca22db49632856f1e0ca45b2113a261808564bd294e";
const providerUri = process.env.PROVIDER_URI ?? 'http://localhost:8545';
// const providerUri = "http://localhost:8545";
const provider = new ethers.JsonRpcProvider(providerUri);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider);

if (!process.env.PRIVATE_KEY) {
  throw new Error("PRIVATE_KEY environment variable is not set");
}

const config: AxiomConfig = {
  providerUri,
  version: "v1",
  chainId: 5,
  mock: true,
};
const ax = new Axiom(config);

const queryData = [
  {
    blockNumber: 9335357,
    address: "0x4Fb202140c5319106F15706b1A69E441c9536306",
    slot: "0x1f5f6074f4419ff8032f6dd23e65794ca104b323667b66be5a0c73fd6ba2857e",
  }, {
    blockNumber: 9335466,
    address: "0x4Fb202140c5319106F15706b1A69E441c9536306",
    slot: "0xe162aef9009a7c65cb8d0c7992b1086de24c2a149b9b0d3db4ed7e64df46fa0f",
  // }, {
  //   blockNumber: 9335492,
  //   address: "0x4Fb202140c5319106F15706b1A69E441c9536306",
  //   slot: "0x9704ebc2f19c9b523a93412dbd2135a468af6ab1ca28a2e272acd0f27d7f33b0",
  }
];

async function buildQuery() {
  const qb = ax.newQueryBuilder();
  await qb.append(queryData[0]);
  await qb.append(queryData[1]);
  // await qb.append(queryData[2]);
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
      value: ethers.parseEther("0.01"), // Goerli payment value
    }
  );
  const txReceipt = await txResult.wait(); 
  console.log("sendQuery Receipt", txReceipt);
}

async function queryTransaction(qb: QueryBuilder) {
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
      value: ethers.parseEther("0.01"), // Goerli payment value
    }
  );
  const txReceipt = await txResult.wait(); 
  console.log("sendQuery Receipt", txReceipt);

  const responseTree = await qb.getResponseTree();
  if (!responseTree) {
    throw new Error("Response tree is undefined");
  }
  const keccakBlockResponse = responseTree.blockTree.getHexRoot();
  const keccakAccountResponse = responseTree.accountTree.getHexRoot();
  const keccakStorageResponse = responseTree.storageTree.getHexRoot();
  const storageWitness: ValidationWitnessResponse = ax.query.getValidationWitness(
    responseTree,
    9335464,
    "0x4Fb202140c5319106F15706b1A69E441c9536306",
    "0xe162aef9009a7c65cb8d0c7992b1086de24c2a149b9b0d3db4ed7e64df46fa0f"
  ) as ValidationWitnessResponse;

  axiomV1Query.on("QueryFulfilled", async (keccakQueryResponse, _payment, _prover) => {
    // Validate that this query is the one that we want to use
    const calculatedResponse = keccak256(ethers.solidityPacked(["bytes32", "bytes32", "bytes32"], [keccakBlockResponse, keccakAccountResponse, keccakStorageResponse]));
    // if (calculatedResponse !== keccakQueryResponse) {
    //   throw new Error("Invalid query response");
    // }
    console.log("keccakQueryResponse", keccakQueryResponse);
    console.log("calculatedResponse", calculatedResponse);

    // Now you can use the queried data in a smart contract
    const specialCounter = new ethers.Contract(
      specialCounterAddress,
      specialCounterAbi,
      wallet
    );
    const txResult = await specialCounter.setNumber(
      150,
      keccakBlockResponse,
      keccakAccountResponse,
      keccakStorageResponse,
      [storageWitness.blockResponse],
      [storageWitness.accountResponse],
      [storageWitness.storageResponse]
    );
    const txReceipt = await txResult.wait();
    console.log("setNumber Receipt", txReceipt);
  });
}

async function setNumberTransaction(qb: QueryBuilder) {
  const { keccakQueryResponse, queryHash, query } = await qb.build();
  console.log("keccakQueryResponse", keccakQueryResponse);
  // console.log("queryHash", queryHash);
  // console.log("query", query);

  // const responseTree = await ax.query.getResponseTreeForKeccakQueryResponse(keccakQueryResponseForData);
  const responseTree = await qb.getResponseTree();
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
    const storageWitness: ValidationWitnessResponse = ax.query.getValidationWitness(
      responseTree,
      queryData[i].blockNumber,
      queryData[i].address,
      queryData[i].slot
    ) as ValidationWitnessResponse;
    console.log("storageWitness", i, storageWitness);
    // responses.blockResponses.push(storageWitness.blockResponse);
    // if (storageWitness.accountResponse) {
    //   responses.accountResponses.push(storageWitness.accountResponse);
    // }
    if (storageWitness.storageResponse) {
      responses.storageResponses.push(storageWitness.storageResponse);
    }
  }
  console.log(responses);

  const specialCounter = new ethers.Contract(
    specialCounterAddress,
    specialCounterAbi,
    wallet
  );
  const txResult = await specialCounter.setNumber(
    128,
    responses
  );  // gasUsed: 13364634n
  const txReceipt = await txResult.wait();
  console.log("setNumber Receipt", txReceipt);
}

async function main() {
  const qb = await buildQuery();
  // await submitQuery(qb);
  // await queryTransaction(qb);
  await setNumberTransaction(qb);
}

main();