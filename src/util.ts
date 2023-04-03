import EthCrypto from "eth-crypto";

export function signMessage(message: string): string {
  //Currently not working with B/E validation
  let msg_len = message.length;
  const ETH_PREFIX = "\x19Ethereum Signed Message:\n" + msg_len;
  const messageHash = EthCrypto.hash.keccak256(ETH_PREFIX + message);
  let priv = "";
  return EthCrypto.sign(priv, messageHash);
}
