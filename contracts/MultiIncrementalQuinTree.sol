// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { SnarkConstants } from "./SnarkConstants.sol";
import { Hasher } from "./Hasher.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/*
 * An incremental Merkle tree which supports up to 5 leaves per node. Supports
 * multiple trees, such that when the current tree is full, it stores the root
 * and creates a new tree.
 */
contract MultiIncrementalQuinTree is Ownable, Hasher {
    // The maximum tree depth
    uint256 internal constant MAX_DEPTH = 256;

    // The number of leaves per node
    uint8 internal constant LEAVES_PER_NODE = 5;

    // The tree depth
    uint8 internal treeLevels;

    // The number of inserted leaves
    uint256 internal nextLeafIndex = 0;

    uint256 internal currentTreeNum;

    // The Merkle roots (currentTreeNum => root)
    mapping (uint256 => uint256) public roots;

    // The zero value per level
    mapping (uint256 => uint256) internal zeros;

    // Allows you to compute the path to the element (but it's not the path to
    // the elements). Caching these values is essential to efficient appends.
    mapping (uint256 => mapping (uint256 => uint256)) internal filledSubtrees;

    // The filled subtrees for a blank tree.
    mapping (uint256 => mapping (uint256 => uint256)) internal originalFilledSubtrees;

    //// Whether the contract has already seen a particular Merkle tree root
    //mapping (uint256 => mapping (uint256 => bool)) public rootHistory;

    string constant internal ERROR_INVALID_LEVELS = "MIQTE1";
    string constant internal ERROR_LEAF_TOO_LARGE = "MIQTE2";

    event LeafInsertion(
        uint256 indexed leaf,
        uint256 indexed leafIndex,
        uint256 indexed treeNum
    );

    /*
     * Stores the Merkle root and intermediate values (the Merkle path to the
     * the first leaf) assuming that all leaves are set to _zeroValue.
     * @param _treeLevels The number of levels of the tree
     * @param _zeroValue The value to set for every leaf. Ideally, this should
     *                   be a nothing-up-my-sleeve value, so that nobody can
     *                   say that the deployer knows the preimage of an empty
     *                   leaf.
     */
    constructor(uint8 _treeLevels, uint256 _zeroValue) {
        // Limit the Merkle tree to MAX_DEPTH levels
        require(
            _treeLevels > 0 && _treeLevels <= MAX_DEPTH,
            ERROR_INVALID_LEVELS
        );
        
        /*
           To initialise the Merkle tree, we need to calculate the Merkle root
           assuming that each leaf is the zero value.

           `zeros` and `filledSubtrees` will come in handy later when we do
           inserts or updates. e.g when we insert a value in index 1, we will
           need to look up values from those arrays to recalculate the Merkle
           root.
         */
        treeLevels = _treeLevels;

        uint256 currentZero = _zeroValue;

        // hash5 requires a uint256[] memory input, so we have to use temp
        uint256[LEAVES_PER_NODE] memory temp;

        for (uint8 i = 0; i < _treeLevels; i++) {
            for (uint8 j = 0; j < LEAVES_PER_NODE; j ++) {
                //filledSubtrees[i][j] = currentZero;
                originalFilledSubtrees[i][j] = currentZero;
                temp[j] = currentZero;
            }

            zeros[i] = currentZero;
            currentZero = hash5(temp);
        }

        roots[currentTreeNum] = currentZero;
    }

    /*
     * Inserts a leaf into the Merkle tree and updates its root.
     * Also updates the cached values which the contract requires for efficient
     * insertions.
     * @param _leaf The value to insert. It must be less than the snark scalar
     *              field or this function will throw.
     * @return The leaf index.
     */
    function insertLeaf(uint256 _leaf) public onlyOwner returns (uint256) {
        require(
            _leaf < SNARK_SCALAR_FIELD,
            ERROR_LEAF_TOO_LARGE
        );

        // If the current tree overflows, create a new one
        if (nextLeafIndex >= uint256(LEAVES_PER_NODE) ** uint256(treeLevels)) {
            nextLeafIndex = 0;
            currentTreeNum ++;
            for (uint8 i = 0; i < treeLevels; i++) {
                for (uint8 j = 0; j < LEAVES_PER_NODE; j ++) {
                    filledSubtrees[i][j] = originalFilledSubtrees[i][j];
                }
            }
        }

        uint256 currentIndex = nextLeafIndex;

        uint256 currentLevelHash = _leaf;

        // hash5 requires a uint256[] memory input, so we have to use temp
        uint256[LEAVES_PER_NODE] memory temp;

        // The leaf's relative position within its node
        uint256 m = currentIndex % LEAVES_PER_NODE;

        for (uint8 i = 0; i < treeLevels; i++) {
            // If the leaf is at relative index 0, zero out the level in
            // filledSubtrees
            if (m == 0) {
                for (uint8 j = 1; j < LEAVES_PER_NODE; j ++) {
                    filledSubtrees[i][j] = zeros[i];
                }
            }

            // Set the leaf in filledSubtrees
            filledSubtrees[i][m] = currentLevelHash;

            // Hash the level
            for (uint8 j = 0; j < LEAVES_PER_NODE; j ++) {
                temp[j] = filledSubtrees[i][j];
            }
            currentLevelHash = hash5(temp);

            currentIndex /= LEAVES_PER_NODE;
            m = currentIndex % LEAVES_PER_NODE;
        }

        roots[currentTreeNum] = currentLevelHash;

        //rootHistory[currentTreeNum][currentLevelHash] = true;

        uint256 n = nextLeafIndex;
        nextLeafIndex += 1;

        emit LeafInsertion(_leaf, n, currentTreeNum);

        return currentIndex;
    }
}
