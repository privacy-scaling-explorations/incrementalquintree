const { ethers } = require('hardhat')
import * as path from 'path'
import * as fs from 'fs'

const abiDir = path.resolve(path.join(__dirname, '..', 'artifacts'))

const getDefaultSigner = async () => {
	const signers = await ethers.getSigners()
	return signers[0]
}

const loadAbi = (jsonPath: string) => {
    const j = JSON.parse(fs.readFileSync(jsonPath).toString())
    return j.abi
}

const getAbi = (contractName: string) => {
    const r = {
        VerifyMarket: [
            'contracts', 'VerifyMarket.sol', 'VerifyMarket.json'
        ],
        Seller: [
            'contracts', 'impl', 'Seller.sol', 'Seller.json'
        ],
    }
    return loadAbi(path.join(abiDir, ...r[contractName]))

    throw new Error('Error: no such contract in getAbi()')
}

const deployMultiIncrementalQuinTreeContract = async (
    treeLevels: number,
    zeroValue: bigint,
    quiet = false,) => {

    log('Deploying MultiIncrementalQuinTree', quiet)
	const signer = await getDefaultSigner()

    const {
        //PoseidonT3Contract,
        //PoseidonT4Contract,
        //PoseidonT5Contract,
        PoseidonT6Contract,
    } = await deployPoseidonContracts()

    const factory = await linkPoseidonLibraries(
        'MultiIncrementalQuinTree',
        //PoseidonT3Contract.address,
        //PoseidonT4Contract.address,
        //PoseidonT5Contract.address,
        PoseidonT6Contract.address,
    )
    const contract = await factory.deploy(
        treeLevels.toString(),
        zeroValue.toString(),
    )
    const receipt = await contract.deployTransaction.wait()
    log('Gas used to deploy MultiIncrementalQuinTree: ' + receipt.gasUsed.toString(), quiet)
    return contract
}

const deployHasherContract = async (quiet = false) => {
    const {
        //PoseidonT3Contract,
        //PoseidonT4Contract,
        //PoseidonT5Contract,
        PoseidonT6Contract,
    } = await deployPoseidonContracts()

    const hasherContractFactory = await linkPoseidonLibraries(
        'Hasher',
        //PoseidonT3Contract.address,
        //PoseidonT4Contract.address,
        //PoseidonT5Contract.address,
        PoseidonT6Contract.address,
    )

    const hasherContract = await hasherContractFactory.deploy()
    await hasherContract.deployTransaction.wait()
    return hasherContract
}

const deployPoseidonContracts = async (quiet = false) => {
    log('Deploying Poseidon Contracts', quiet)

    //const PoseidonT3Contract = await deployContract(quiet, 'PoseidonT3')
    //const PoseidonT4Contract = await deployContract(quiet, 'PoseidonT4')
    //const PoseidonT5Contract = await deployContract(quiet, 'PoseidonT5')
    const PoseidonT6Contract = await deployContract(quiet, 'PoseidonT6')

    return {
        //PoseidonT3Contract,
        //PoseidonT4Contract,
        //PoseidonT5Contract,
        PoseidonT6Contract,
    }
}

/*
 * Deploy a contract that does not need to be linked to any libraries
 */
const deployContract = async (
    quiet = false,
    contractName: string,
    ...args
) => {
    log('Deploying ' + contractName, quiet)
	const signer = await getDefaultSigner()
    const factory = await ethers.getContractFactory(contractName, signer)

    const contract = await factory.deploy(...args)
    const receipt = await contract.deployTransaction.wait()

    return contract
}

const linkPoseidonLibraries = async (
    solFileToLink: string,
    //poseidonT3Address,
    //poseidonT4Address,
    //poseidonT5Address,
    poseidonT6Address,
    quiet = false,
) => {
	const signer = await getDefaultSigner()

	log('Linking Poseidon libraries', false)
	const contractFactory = await ethers.getContractFactory(
		solFileToLink,
		{
			signer,
			libraries: {
				//PoseidonT3: poseidonT3Address,
				//PoseidonT4: poseidonT4Address,
				//PoseidonT5: poseidonT5Address,
				PoseidonT6: poseidonT6Address,
			},
		},
	)

	return contractFactory
}

const log = (msg: string, quiet: boolean) => {
    if (!quiet) {
        console.log(msg)
    }
}

export {
    linkPoseidonLibraries,
    deployPoseidonContracts,
    deployHasherContract,
    deployMultiIncrementalQuinTreeContract,
    getAbi,
    getDefaultSigner,
}
