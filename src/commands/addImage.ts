import { Arguments, Argv } from "yargs";
import { resolve } from "path";
import { addNewWasmImage } from "../task";
import { parseAutoSubmitNetworkIds } from "../util";

export const command = "addimage";
export const desc = "Add wasm image";

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
    .option("p", {
      alias: "path",
      describe: "Wasm image path",
      demandOption: "The wasm image path is required",
      type: "string",
    })
    .option("n", {
      alias: "name",
      describe: "The name of the image (legacy and not used)",
      type: "string",
      default: "",
    })
    .option("c", {
      alias: "circuit_size",
      describe:
        "The circuit size of the image. If not specified, the default size is 22",
      type: "number",
      default: 22,
    })
    .option("d", {
      alias: "description",
      describe:
        "The description of the image. If not specified, the name will be used",
      type: "string",
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
    })
    .option("import_data_image", {
      describe: "The MD5 in which to inherit merkle data from",
      type: "string",
    });
};

export const handler = async (argv: Arguments) => {
  const absolutePath = resolve(argv.p as string);
  console.log("Begin adding image for ", absolutePath);
  let desc = argv.d ? (argv.d as string) : "";
  let image_data_image = argv.import_data_image
    ? (argv.import_data_image as string)
    : undefined;

  await addNewWasmImage(
    argv.r as string,
    absolutePath,
    argv.u as string,
    argv.n as string | undefined,
    desc,
    "",
    argv.circuit_size as number,
    argv.x as string,
    argv.creator_paid_proof as boolean,
    argv.creator_only_add_prove_task as boolean,
    parseAutoSubmitNetworkIds(argv.auto_submit_network_ids),
    image_data_image,
  );
};
