import { Arguments, Argv } from "yargs";
import { resubmitTaskWithSameInputs } from "../task";
import { parseTasksIds } from "../util";

export const command = "resubmittasks";
export const desc = "Resubmit Task With Same Inputs";

export const builder = (yargs: Argv) => {
  return yargs
    .option("x", {
      alias: "priv",
      describe: "The private key of user address.",
      demandOption: "The priv is required for signing message.",
      type: "string",
    })
    .option("taskids", {
      describe: "List of task ids to resubmit proofs for.",
      type: "array",
      default: [],
    });
};

export const handler = async (argv: Arguments) => {
  console.log("Begin reset image task for ", argv.i);
  await resubmitTaskWithSameInputs(
    argv.r as string,
    argv.x as string,
    parseTasksIds(argv.taskids),
  );
};
