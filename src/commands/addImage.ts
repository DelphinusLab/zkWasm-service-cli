import { Arguments, Argv } from "yargs";
import { resolve } from "path";
import { addNewWasmImage } from "../task";

export const command = "addimage";
export const desc = "Add wasm image";

export const builder = (yargs: Argv) => {
  return yargs
    .option("p", {
      alias: "path",
      describe: "Wasm image path",
      demandOption: "The wasm image path is required",
      type: "string",
    })
    .option("u", {
      alias: "address",
      describe: "User address which adding the image",
      demandOption: "User address is required",
      type: "string",
    })
    .option("x", {
      alias: "priv",
      describe: "The priv of user address.",
      demandOption: "The priv is required for signing message.",
      type: "string",
    })
    .option("c", {
      alias: "circuit_size",
      describe: "image's circuits size, if not specified, default is 22",
      type: "number",
    })
    .option("d", {
      alias: "description",
      describe: "image's description, if not specifed, will use name",
      type: "string",
    })
    .option("n", {
      alias: "name",
      describe: "image's name",
      type: "string",
    })
    .option("creator_paid_proof", {
      describe:
        "Specify if proofs for this image will be charged to the creator of the image",
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
  const absolutePath = resolve(argv.p as string);
  console.log("Begin adding image for ", absolutePath);
  let circuit_size: number = argv.c ? (argv.c as number) : 18;
  let desc = argv.d ? (argv.d as string) : (argv.n as string);

  await addNewWasmImage(
    argv.r as string,
    absolutePath,
    argv.u as string,
    argv.n as string,
    desc,
    "",
    circuit_size,
    argv.x as string,
    argv.creator_paid_proof as boolean,
    argv.auto_submit_network_ids as number[]
  );
};
