import { Arguments, Argv } from "yargs";
import { addResetImageTask } from "../task";
import { parseAutoSubmitNetworkIds } from "../util";

export const command = "resetimage";
export const desc = "Add reset image task";

export const builder = (yargs: Argv) => {
  return yargs
    .option("u", {
      alias: "address",
      describe: "User address which is adding the image",
      demandOption: "User address is required",
      type: "string",
    })
    .option("x", {
      alias: "priv",
      describe: "The private key of user address.",
      demandOption: "The priv is required for signing message.",
      type: "string",
    })
    .option("i", {
      alias: "image",
      describe: "The MD5 of the wasm image",
      demandOption: "The image MD5 is required",
      type: "string",
    })
    .option("c", {
      alias: "circuit_size",
      describe: "The circuit size of the image. If not specified, the default size is 22",
      type: "number",
      default: 22,
    })
    .option("creator_paid_proof", {
      describe:
        "Specify if proofs for this image will be charged to the creator of the image",
      type: "boolean",
      default: false,
    })
    .option("creator_only_add_prove_task", {
      describe:
        "Specify if proofs for this image are restricted to only be added by the creator of the image",
      type: "boolean",
      default: false,
    })
    .option("auto_submit_network_ids", {
      describe:
        "List of network ids to automatically submit proofs to. If not specified, proofs will not be automatically submitted.",
      type: "array",
      default: [],
    });
};

export const handler = async (argv: Arguments) => {
  console.log("Begin reset image task for ", argv.i);
  await addResetImageTask(
    argv.r as string,
    argv.u as string,
    argv.i as string,
    argv.circuit_size as number,
    argv.x as string,
    argv.creator_paid_proof as boolean,
    argv.creator_only_add_prove_task as boolean,
    parseAutoSubmitNetworkIds(argv.auto_submit_network_ids),
  );
};
