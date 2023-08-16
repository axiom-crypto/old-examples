// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import { CounterZKAdmin } from '../src/CounterZKAdmin.sol';

contract CounterZKAdminScript is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        new CounterZKAdmin();
        vm.stopBroadcast();
    }
}
