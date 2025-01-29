import EthCrypto from "eth-crypto";
import { exit } from "process";
import readline from "readline";
import { ProofSubmitMode, ZkWasmUtil } from "zkwasm-service-helper";

export async function signMessage(message: string, priv: string) {
  return await ZkWasmUtil.signMessage(message, priv);
}

export function signMessageLocal(message: string, priv: string) {
  const messageHash = hasPersonalMessage(message);
  return EthCrypto.sign(priv, messageHash)
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

export function parseProofSubmitMode(submit_mode: any) {
  const psm = (submit_mode as string).toLowerCase();
  if (psm === "auto") {
    return ProofSubmitMode.Auto;
  } else if (psm === "manual") {
    return ProofSubmitMode.Manual;
  } else {
    console.log("Invalid option for proof_submit_mode, must be either 'Auto' or 'Manual', input:", submit_mode);
    exit(1);
  }
}

export function parseAutoSubmitNetworkIds(auto_submit_network_ids: any) {
  return (auto_submit_network_ids as any[]).map((it) => {
    if (typeof it === "number" && !Number.isNaN(it) && Number.isFinite(it)) {
      return it as number;
    } else {
      console.log("Invalid type detected in auto_submit_network_ids, must only contain network ids, input:", auto_submit_network_ids);
      exit(1);
    }
  })
}
