import EthCrypto from 'eth-crypto';

export function signMessage(message: string): string {
    const messageHash = EthCrypto.hash.keccak256(message);
    let priv = "917b1dc01120430c3f7c15b653e9b2278115b1b3a943e4f092c7aa079b0b3f3d";
    return EthCrypto.sign(priv, messageHash);
}