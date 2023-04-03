import EthCrypto from 'eth-crypto';

export function signMessage(message: string): string {
    //Currently not working with B/E validation
    const messageHash = EthCrypto.hash.keccak256(message);
    let priv = "";
    return EthCrypto.sign(priv, messageHash);
}