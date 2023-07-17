# Bearliever

Did you stay or did you go? Were you a true believer during the bear market?

Bearliever allows users to mint an NFT if they are able to prove that they were active between the period of low activity (and prices) between Aug 10, 2018 (block 6120000) to July 10, 2020 (block 10430000). Utilizing [Axiom](https://www.axiom.xyz), users are able to generate a Zero Knowledge proof and submit that data into the Bearliever contract, which verifies that they did at least 32 transactions during that time by looking at the difference in account nonce at those two blocks.

## /webapp <WIP>

WIP. Do not use.

## /contracts

Contains the main Bearliever contract. 

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

