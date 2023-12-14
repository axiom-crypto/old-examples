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

    /// @notice True if the `account` has already claimed.
    mapping (address => bool) public hasMinted;

    error ProofError();
    error InvalidInputError();
    error InvalidSenderError();
    error InvalidDataLengthError();
    error NotEnoughTransactionsError();
    error AlreadyClaimedError();

    constructor() ERC721("Bearliever", "BLV") {}

    /// @notice Validate axiomResponse and check that account meets conditions to mint NFT
    /// @param axiomResponse The Axiom query response.
    /// @dev Reverts if proof isn't valid, or if the account doesn't meet the conditions to mint.
    function _validateData(ResponseStruct calldata axiomResponse) private view {
        // Mainnet AxiomV1Query address
        IAxiomV1Query axiomV1Query = IAxiomV1Query(AXIOM_V1_QUERY_MAINNET_ADDR);
        
        // Check that the responses are valid
        bool valid = axiomV1Query.areResponsesValid(
            axiomResponse.keccakBlockResponse,
            axiomResponse.keccakAccountResponse,
            axiomResponse.keccakStorageResponse,
            axiomResponse.blockResponses,
            axiomResponse.accountResponses,
            axiomResponse.storageResponses
        );
        if (!valid) {
            revert ProofError();
        }

        // Decode the query metadata 
        uint256 length = axiomResponse.accountResponses.length;
        if (length != 2) {
            revert InvalidDataLengthError();
        }

        // Get values from start block
        uint256 startBlockNumber = axiomResponse.accountResponses[0].blockNumber;
        uint256 startNonce = axiomResponse.accountResponses[0].nonce;
        address startAddr = axiomResponse.accountResponses[0].addr;

        // Get values from end block
        uint256 endBlockNumber = axiomResponse.accountResponses[1].blockNumber;
        uint256 endNonce = axiomResponse.accountResponses[1].nonce;
        address endAddr = axiomResponse.accountResponses[1].addr;

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
        if (startAddr != msg.sender || endAddr != msg.sender) {
            revert InvalidSenderError();
        }
    }

    function mint(ResponseStruct calldata response) external {
        if (hasMinted[_msgSender()]) {
            revert AlreadyClaimedError();
        }

        // Validates the incoming ResponseStruct
        _validateData(response);
        
        // Mints a new NFT to the sender if input validation passes
        hasMinted[_msgSender()] = true;
        _safeMint(msg.sender, totalSupply());
    }
}
