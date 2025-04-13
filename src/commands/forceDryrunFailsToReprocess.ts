import { forceDryrunFailsToReprocess } from "task";
import { Arguments, Argv } from "yargs";

export const command = "forcedryrunfailstoreprocess";
export const desc =
  "Force an `DryRunFailed` task into a `Pending` state to allow it's dry run to be retried";

export const builder = (yargs: Argv) => {
  return yargs
    .option("x", {
      alias: "priv",
      describe: "The private key of user address.",
      demandOption: "The priv is required for signing message.",
      type: "string",
    })
    .option("task_ids", {
      describe: "Id of the tasks to reprocess",
      type: "array",
      default: [],
    });
};

export const handler = async (argv: Arguments) => {
  console.log("Forcing an dry run failed tasks to reprocess ...");
  await forceDryrunFailsToReprocess(
    argv.r as string,
    argv.x as string,
    argv.task_ids as string[],
  );
};
