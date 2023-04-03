import EthCrypto from "eth-crypto";

export function signMessage(message: string, priv: string): string {
    const messageHash = hasPersonalMessage(message);
    return EthCrypto.sign(priv, messageHash);
}

export function hasPersonalMessage(message:string): string {
    const msg_len = message.length;
    const ETH_PREFIX = "\x19Ethereum Signed Message:\n" + msg_len;
    return EthCrypto.hash.keccak256(ETH_PREFIX + message);
}
