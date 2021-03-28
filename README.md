# An incremental Merkle tree written in Typescript and circom

This repository provides a Typescript implementation of an incremental Merkle
tree which supports either 2 (binary) or 5 (quinary) leaves per node.

The original code is from the [MACI
project](https://github.com/appliedzkp/maci), but has been placed in its own
repository and NPM package so other projects can use it.

`circom` circuits for zero-knowledge applications are also included. Please
note that it is not possible to import `.circom` files from this module as the
`circom` compiler does not yet have a way to specify custom import origins,
like how `solc` has a `--allow-paths` flag.

Solidity contracts are also included.

To run all tests, first clone this repository, navigate to its root
directory, and perform the following steps inside it:

1. Run `npm i`
1. In a separate terminal, run `npm run circom-helper`.
2. In a separate terminal, run `npm run hardhat`.
3. In a separate terminal, run `npm run test`.
