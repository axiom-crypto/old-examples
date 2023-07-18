# Counter ZKAdmin

This is your standard decentralized Counter app with a twist. Here, anyone can increment the counter, but only a ZKAdmin can set the count value directly.

Anyone can be a Counter ZKAdmin allows anyone who has generated at least two proofs using [Axiom](https://www.axiom.xyz)'s Goerli Mock Prover to become a Counter ZKAdmin! 


## /contracts

Contains the main Counter ZKAdmin contract. 

Required .env file:
```
PROVIDER_URI=
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

## /scripts

Contains a script that sends a historical data Query into the AxiomV1Query contract and attempts to mint an NFT based on the input.

Required .env file:
```
PROVIDER_URI=
PRIVATE_KEY=
```

Run via (must be in /scripts directory):

```
pnpm start
```

