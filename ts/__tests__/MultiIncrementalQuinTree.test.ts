jest.setTimeout(180000)

import { poseidon as hash5 } from 'circomlib'
import { deployMultiIncrementalQuinTreeContract } from '../'
import { MultiIncrementalQuinTree } from '../IncrementalQuinTree'

let deployer
let mtContract
let crContract
let PoseidonT3Contract, PoseidonT6Contract

const DEPTH = 2
const LEAVES_PER_NODE = 5

let tree

const NOTHING_UP_MY_SLEEVE = BigInt(0)

describe('MultiIncrementalQuinTree', () => {
    beforeAll(async () => {
        mtContract = await deployMultiIncrementalQuinTreeContract(
            DEPTH,
            NOTHING_UP_MY_SLEEVE,
            false,
        )
    })

    it('an empty tree should have the correct root', async () => {
        const tree = new MultiIncrementalQuinTree(DEPTH, NOTHING_UP_MY_SLEEVE, LEAVES_PER_NODE, hash5)
        const root = await mtContract.roots(0)
        expect(tree.roots[0].toString()).toEqual(root.toString())
    })

    it('the on-chain root should match an off-chain root after insertions', async () => {
        const tree = new MultiIncrementalQuinTree(DEPTH, NOTHING_UP_MY_SLEEVE, LEAVES_PER_NODE, hash5)
        const capacity = LEAVES_PER_NODE ** DEPTH
        const numTrees = 2

        expect.assertions(capacity * numTrees)

        for (let i = 0; i < capacity * numTrees; i++) {
            const treeNum = Math.floor(i  / capacity)
            const leaf = BigInt(i)

            tree.insert(leaf)

            const tx = await mtContract.insertLeaf(leaf.toString(), { gasLimit: 5000000 })
            const receipt = await tx.wait()

            const onChainRoot = (await mtContract.roots(treeNum)).toString()

            expect(tree.roots[treeNum].toString()).toEqual(onChainRoot)
        }
    })
})
