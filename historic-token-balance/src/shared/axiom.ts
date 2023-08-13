import { Axiom, AxiomConfig } from "@axiom-crypto/core";

const config: AxiomConfig = {
  providerUri: process.env.PROVIDER_URI_MAINNET as string,
  version: "v1",
  chainId: 1,
};
export const axiom = new Axiom(config);