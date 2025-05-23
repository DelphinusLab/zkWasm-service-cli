import { Arguments, Argv } from "yargs";
import { addProvingTask } from "../task";
import { parseProofSubmitMode } from "../util";

export const command = "addprovingtask";
export const desc = "Add proving task";

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
    .option("public_input", {
      describe:
        "public input of the proof, inputs must have format (0x)[0-f]*:(i64|bytes|bytes-packed) and been separated by spaces (eg: 0x12:i64 44:i64 32:i64).",
      type: "string",
    })
    .option("private_input", {
      describe: "The private input of the proof. Currently not supported.",
      type: "string",
    })
    .option("submit_mode", {
      describe:
        "The submit mode of the proving task. Specify 'Auto' or 'Manual'. If not specified, the default is 'Manual'",
      type: "string",
      default: "Manual",
    });
};

export const handler = async (argv: Arguments) => {
  console.log("Begin adding prove task for ", argv.i, argv.public_input);
  await addProvingTask(
    argv.r as string,
    argv.u as string,
    argv.i as string,
    argv.public_input ? (argv.public_input as string) : "",
    argv.private_input ? (argv.private_input as string) : "",
    parseProofSubmitMode(argv.submit_mode),
    argv.x as string,
  );
};
