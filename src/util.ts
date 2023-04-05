import EthCrypto from "eth-crypto";
import readline from "readline";

export function signMessage(message: string, priv: string): string {
  const messageHash = hasPersonalMessage(message);
  return EthCrypto.sign(priv, messageHash);
}

export function hasPersonalMessage(message: string): string {
  const msg_len = message.length;
  const ETH_PREFIX = "\x19Ethereum Signed Message:\n" + msg_len;
  return EthCrypto.hash.keccak256(ETH_PREFIX + message);
}

export async function askQuestion(query: string) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}
