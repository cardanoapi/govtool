import * as CardanoWasm from '@emurgo/cardano-serialization-lib-nodejs'
import * as blakejs from 'blakejs'
import * as cbor from 'cbor'

import { SignatureVerificationResult } from '../types/signature.types'

const regExpHex = /^[0-9a-fA-F]+$/;

function trimString(value:string): string{
    return value.trim().replace(/\n /, '\n');
}

function getPublicKeyFromVkey(vkey: string): CardanoWasm.PublicKey {
    return CardanoWasm.PublicKey.from_bytes(Buffer.from(vkey, 'hex'))
}

export async function verifyCIP8Signature(payload: {
    vkey: string;
    signature: string;
    message?: Uint8Array;
}): Promise<SignatureVerificationResult> {
    let coseKeyHex = trimString(payload.vkey.toLowerCase());
    let coseSign1Hex = trimString(payload.signature.toLowerCase());

    if(!regExpHex.test(coseKeyHex)) {
        throw new Error('COSE key is not a valid hex string');
    }

    if(!regExpHex.test(coseSign1Hex)){
        throw new Error('COSE_SIGN1 is not a valid hex string');
    }

    let publicKey : CardanoWasm.PublicKey | undefined;

    try {
        const coseKey = cbor.decode(Buffer.from(coseKeyHex, 'hex'));
        if(!(coseKey instanceof Map)) {
            throw new Error('COSE_KEY is not a map');
        }

        const publicKeyBuffer = coseKey.get(-2);
        if(!Buffer.isBuffer(publicKeyBuffer)) {
            throw new Error('COSE_Key public key is missing');
        }
        publicKey = CardanoWasm.PublicKey.from_bytes(publicKeyBuffer); 
    } catch {
        publicKey = getPublicKeyFromVkey(coseKeyHex);
    }
    const coseSign1 = cbor.decode(Buffer.from(coseSign1Hex, 'hex'));

    if(!Array.isArray(coseSign1) || coseSign1.length !==4){
        throw new Error ('COSE_Sign1 is not valid');
    }
    const [protectedHeaderBuffer, ,payloadBuffer, signatureBuffer] =coseSign1;

    if(!Buffer.isBuffer(protectedHeaderBuffer)) {
        throw new Error('Protected header is not a byte array');
    }
    if(!Buffer.isBuffer(payloadBuffer)) {
        throw new Error('Payload is not a byte array');
    }
    if(!Buffer.isBuffer(signatureBuffer)) {
        throw new Error('Signature is not a byte array');
    }

    if(payload.message) {
        const messageHash = blakejs.blake2b(payload.message, undefined, 32);
        const messageHashHex = Buffer.from(messageHash).toString('hex');

        if(messageHashHex !== payloadBuffer.toString('hex')) {
            return {
                isValid: false,
                message: 'Signature verification failed',
                error: 'Payload in signature does not match hash of provided message',
            };
        }
    }
    const sigStructure =[
        'Signature1',
        protectedHeaderBuffer,
        Buffer.from(''),
        payloadBuffer
    ];

    const sigStructureCbor = cbor.encode(sigStructure);
    const signature = CardanoWasm.Ed25519Signature.from_hex(
        signatureBuffer.toString('hex')
    );

    const isValid = publicKey.verify(sigStructureCbor, signature);
    return {
        isValid,
        message: isValid ? 'Signature is valid' : 'Signature verification failed',
    };
}