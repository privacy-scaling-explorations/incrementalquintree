import axios from 'axios'
import * as crypto from 'crypto'
import * as assert from 'assert'

const ff = require('ffjavascript')
const stringifyBigInts: (obj: object) => any = ff.utils.stringifyBigInts

import { poseidon } from 'circomlib'

// Hash up to 5 elements
const hash5 = (inputs: BigInt[]) => {
    assert(inputs.length === 5)
    return poseidon(inputs)
}

const hash2 = (inputs: BigInt[]) => {
    assert(inputs.length === 2)
    return poseidon(inputs)
}

const OPTS = {
    headers: {
        'Content-Type': 'application/json',
    }
}

const post = (id: number, method: string, params: any) => {
    return axios.post(
        'http://localhost:9001',
        {
            jsonrpc: '2.0',
            id,
            method,
            params,
        },
        OPTS,
    )
}

const genWitness = async (circuit: string, inputs: any) => {
    const resp = await post(1, 'gen_witness', { circuit, inputs })
    if (resp.data.error) {
        throw Error(resp.data.error.message)
    }
    return resp.data.result.witness
}

const getSignalByName = async (
    circuit: string,
    witness: any,
    name: string,
) => {
    const resp = await post(1, 'get_signal_index', { circuit, name })
    return witness[Number(resp.data.result.index)]
}

const str2BigInt = (s: string): BigInt => {
    return BigInt(parseInt(
        Buffer.from(s).toString('hex'), 16
    ))
}

// The BN254 group order p
const SNARK_FIELD_SIZE = BigInt(
    '21888242871839275222246405745257275088548364400416034343698204186575808495617'
)

const genRandomSalt = (): BigInt => {

    // Prevent modulo bias
    //const lim = BigInt('0x10000000000000000000000000000000000000000000000000000000000000000')
    //const min = (lim - SNARK_FIELD_SIZE) % SNARK_FIELD_SIZE
    const min = BigInt('6350874878119819312338956282401532410528162663560392320966563075034087161851')

    let rand
    while (true) {
        rand = BigInt('0x' + crypto.randomBytes(32).toString('hex'))

        if (rand >= min) {
            break
        }
    }

    const privKey = rand % SNARK_FIELD_SIZE
    assert(privKey < SNARK_FIELD_SIZE)

    return privKey
}


export {
    genRandomSalt,
    str2BigInt,
    genWitness,
    getSignalByName,
    hash2,
    hash5,
    stringifyBigInts,
}
