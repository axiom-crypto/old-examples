// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "../lib/openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import "../lib/openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "./interfaces/IAxiomV1Query.sol";

struct ResponseStruct {
    bytes32 keccakBlockResponse;
    bytes32 keccakAccountResponse;
    bytes32 keccakStorageResponse;
    IAxiomV1Query.BlockResponse[] blockResponses;
    IAxiomV1Query.AccountResponse[] accountResponses;
    IAxiomV1Query.StorageResponse[] storageResponses;
}

contract Bearliever is ERC721Enumerable {
    uint256 public constant BEAR_START_BLOCK = 6120000;
    uint256 public constant BEAR_END_BLOCK = 10430000;
    uint256 public constant NUM_TX_THRESHOLD = 16;
    address public constant AXIOM_V1_QUERY_MAINNET_ADDR = 0xd617ab7f787adF64C2b5B920c251ea10Cd35a952;

    error ProofError();
    error InvalidInputError();
    error InvalidSenderError();
    error InvalidDataLengthError();
    error NotEnoughTransactionsError();

    constructor() ERC721("Bearliever", "BLV") {}

    function _validateData(ResponseStruct calldata response) private view {
        // Mainnet AxiomV1Query address
        IAxiomV1Query axiomV1Query = IAxiomV1Query(AXIOM_V1_QUERY_MAINNET_ADDR);
        
        // Check that the responses are valid
        bool valid = axiomV1Query.areResponsesValid(
            response.keccakBlockResponse,
            response.keccakAccountResponse,
            response.keccakStorageResponse,
            response.blockResponses,
            response.accountResponses,
            response.storageResponses
        );
        if (!valid) {
            revert ProofError();
        }

        // Decode the query metadata 
        uint256 length = response.accountResponses.length;
        if (length != 2) {
            revert InvalidDataLengthError();
        }

        // Get values from start block
        uint256 startBlockNumber = response.accountResponses[0].blockNumber;
        uint256 startNonce = response.accountResponses[0].nonce;
        address startAddr = response.accountResponses[0].addr;

        // Get values from end block
        uint256 endBlockNumber = response.accountResponses[1].blockNumber;
        uint256 endNonce = response.accountResponses[1].nonce;
        address endAddr = response.accountResponses[1].addr;

        // Check that the start and end blocks proved match the values set in the contract
        if (startBlockNumber != BEAR_START_BLOCK || endBlockNumber != BEAR_END_BLOCK) {
            revert InvalidInputError();
        }

        // Check that the account nonce at the end of the bear market is a set threshold above the 
        // account nonce at the start of the bear market, since it acts as a transaction counter
        if (endNonce - startNonce < NUM_TX_THRESHOLD) {
            revert NotEnoughTransactionsError();
        }

        // Check that the proof submitted is for the same address that is submitting the transaction
        // Note, we are checking that you ARE the sender just for this demo. You'll likely want 
        // to revert if the sender is NOT the startAddr/endAddr.
        if (startAddr == msg.sender || endAddr == msg.sender) {
            revert InvalidSenderError();
        }
    }

    function mint(ResponseStruct calldata response) external {
        // Validates the incoming ResponseStruct
        _validateData(response);
        
        // Mints a new NFT to the sender if input validation passes
        _safeMint(msg.sender, totalSupply());
    }
}
