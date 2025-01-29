import { Arguments, Argv } from "yargs";
import { addProvingTask } from "../task";
import { parseProofSubmitMode } from "../util";

export const command = "addprovingtask";
export const desc = "Add proving task";

export const builder = (yargs: Argv) => {
  return yargs
    .option("i", {
      alias: "image",
      describe: "image md5",
      demandOption: "The image md5 is required",
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
    .option("public_input", {
      describe:
        "public input of the proof, inputs must have format (0x)[0-f]*:(i64|bytes|bytes-packed) and been separated by spaces (eg: 0x12:i64 44:i64 32:i64).",
      type: "string",
    })
    .option("submit_mode", {
      describe:
        "Submit mode for the proof, either 'Manual' or 'Auto', default is 'Manual'",
      type: "string",
      default: "Manual",
    })
    .option("private_input", {
      describe: "private currently not supported",
      type: "string",
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
