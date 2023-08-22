// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "./interfaces/IAxiomV1Query.sol";

struct ResponseStruct {
    bytes32 keccakBlockResponse;
    bytes32 keccakAccountResponse;
    bytes32 keccakStorageResponse;
    IAxiomV1Query.BlockResponse[] blockResponses;
    IAxiomV1Query.AccountResponse[] accountResponses;
    IAxiomV1Query.StorageResponse[] storageResponses;
}

contract CounterZKAdmin {
    uint256 public s_number;
    IAxiomV1Query s_axiomV1Query;

    error ProofError();
    error QueryNotFulfilledError();
    error InvalidSenderError();
    error NotEnoughDataError();
    error InvalidAxiomContractAddressError();

    constructor() {
        // Goerli AxiomV1Query address
        address axiomV1QueryGoerliAddress = 0x4Fb202140c5319106F15706b1A69E441c9536306;
        s_axiomV1Query = IAxiomV1Query(axiomV1QueryGoerliAddress);
    }

    function _validateQuery(ResponseStruct calldata response) internal view {
        // Check that the responses are valid
        bool valid = s_axiomV1Query.areResponsesValid(
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

        // Decode the query metadata and ensure that we have at least 2 responses
        uint256 length = response.storageResponses.length;
        if (length < 2) {
            revert NotEnoughDataError();
        }

        for (uint256 i = 0; i < length; i++) {
            uint256 value = response.storageResponses[i].value;

            // Get the AxiomQueryState enum value from storage value and validate that the query 
            // was indeed fulfilled
            uint256 state = value & 0xFF;
            if (state != uint256(IAxiomV1Query.AxiomQueryState.Fulfilled)) {
                revert QueryNotFulfilledError();
            }

            // Get the refundee address from storage value and validate that the refundee is 
            // indeed the sender
            uint256 refundeeUint = (value >> (40)) & 0x00FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;
            address refundee = address(uint160(refundeeUint));
            if (refundee != msg.sender) {
                revert InvalidSenderError();
            }

            // Get the contract address that was used to make the query and ensure that the address
            // is indeed the AxiomV1Query contract address (versus a spoof contract that would send
            // spoofed data)
            address claimedAxiomContractAddress = response.storageResponses[i].addr;
            if (claimedAxiomContractAddress != address(s_axiomV1Query)) {
                revert InvalidSenderError();
            }
        }
    }

    function setNumber(
        uint256 newNumber,
        ResponseStruct calldata response
    ) public {
        // Validate the incoming response data
        _validateQuery(response);

        // Any user who passes the above validation can set the number
        s_number = newNumber;
    }

    function increment() public {
        // Anyone can increment this counter
        s_number++;
    }
}
