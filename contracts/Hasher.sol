// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { 
    //PoseidonT3,
    //PoseidonT4,
    //PoseidonT5,
    PoseidonT6
} from "./Poseidon.sol";

import { SnarkConstants } from "./SnarkConstants.sol";

contract Hasher is SnarkConstants {
    ///*
     //* Hash 2 values with the Poseidon hash function.
     //*/
    //function hash2(uint256[2] memory array) public pure returns (uint256) {
        //return PoseidonT3.poseidon(array);
    //}

    ///*
     //* Hash 3 values with the Poseidon hash function.
     //*/
    //function hash3(uint256[3] memory array) public pure returns (uint256) {
        //return PoseidonT4.poseidon(array);
    //}

    ///*
     //* Hash 4 values with the Poseidon hash function.
     //*/
    //function hash4(uint256[4] memory array) public pure returns (uint256) {
        //return PoseidonT5.poseidon(array);
    //}

    /*
     * Hash 5 values with the Poseidon hash function.
     */
    function hash5(uint256[5] memory array) public pure returns (uint256) {
        return PoseidonT6.poseidon(array);
    }
}
