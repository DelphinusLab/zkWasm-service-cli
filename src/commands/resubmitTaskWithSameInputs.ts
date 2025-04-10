import { Arguments, Argv } from "yargs";
import { resubmitTaskWithSameInputs } from "../task";

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
      demandOption: "The task ids are required.",
      type: "array",
      string: true,
      default: [],
    });
};

export const handler = async (argv: Arguments) => {
  console.log("Begin resubmit tasks with same inputs");
  await resubmitTaskWithSameInputs(
    argv.r as string,
    argv.x as string,
    argv.taskids as string[],
  );
};
