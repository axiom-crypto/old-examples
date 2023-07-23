# Age Gate Mint

The goal of this example is to get developers familar with using [Axiom](https://www.axiom.xyz) to generate Zero Knowledge proofs of Ethereum data that they can trustlessly use.

We'll be building a simple ERC721 contract that only allows accounts older than 250 blocks (~1 hour) to mint an NFT. The accounts may furnish a proof generated from Axiom of a block number that contains their account address with a nonce of 1 (one outgoing transaction).

## /contracts

Contains the Distributor contract. The Distributor contract will mint a Distributor NFT to users who submit a proof of account age greater than 250 blocks (~1 hour).

Required .env file:
```
PROVIDER_URI_GOERLI=
PRIVATE_KEY=
```

You can use the following scripts for starting a local Anvil mainnet fork (run from /contracts folder):

```
./script/local/start_anvil.sh
```

And the following script for deploying to your fork:

```
./script/local/deploy_local.sh
```

## /webapp

Simple web app in Next.js 13 (using app router) that allows users to connect their wallet, check if their first transaction is more than 250 blocks old, and generate an Axiom proof if so. After generating the proof, users may then claim an NFT if their first transaction passes the check.

Run dev server
```
pnpm dev
```