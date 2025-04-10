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
    .option("source_url", {
      alias: "source_url",
      describe:
        "The rest server url of zkwasm cloud serivce in which to fetch the tasks from. Fetch tasks from <source_url> and submit tasks to <rest_url>",
      demandOption: "The source url is required.",
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
  console.log(`Fetching from ${argv.source_url} and submitting to ${argv.r}`);
  await resubmitTaskWithSameInputs(
    argv.r as string,
    argv.x as string,
    argv.source_url as string,
    argv.taskids as string[],
  );
};
