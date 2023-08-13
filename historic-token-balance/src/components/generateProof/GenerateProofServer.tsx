import { QueryRow } from '@axiom-crypto/core';
import { axiom } from '@/shared/axiom';
import GenerateProofClient from './GenerateProofClient';

export default async function GenerateProofServer({
  queryRows
}:{
  queryRows: QueryRow[],
}) {

  // Build a new Query with Axiom QueryBuilder
  const qb = await axiom.newQueryBuilder();
  for (const queryRow of queryRows) {
    await qb.append(queryRow);
  }
  const { keccakQueryResponse, query } = await qb.build();
  const formattedStr = qb.asSortedFormattedString().replaceAll("\n","\n\n").replaceAll(", ","\n");
  const outStr = formattedStr.slice(0, formattedStr.length - 2);

  return (
    <GenerateProofClient 
      keccakQueryResponse={keccakQueryResponse} 
      query={query}
      blockNumber={queryRows[0].blockNumber}
      axiomV1QueryAddress={axiom.getAxiomQueryAddress() as string}
      axiomV1QueryAbi={axiom.getAxiomQueryAbi()}
      outStr={outStr}
    />
  )
}