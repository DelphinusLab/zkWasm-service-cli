import { forceUnprovableToReprocess } from "../task";
import { Arguments, Argv } from "yargs";

export const command = "forceunprovabletoreprocess";
export const desc =
  "Force an `Unprovable` task into a `Fail` state to allow it's proof to be retried";

export const builder = (yargs: Argv) => {
  return yargs
    .option("x", {
      alias: "priv",
      describe: "The private key of user address.",
      demandOption: "The priv is required for signing message.",
      type: "string",
    })
    .option("task_ids", {
      describe: "Id of the task to reprocess",
      demandOption: "The task_ids list is required for reprocessing unprovable task.",
      type: "string",
    });
};

export const handler = async (argv: Arguments) => {
  console.log("Forcing an unprovable task to reprocess ...");
  await forceUnprovableToReprocess(
    argv.r as string,
    argv.x as string,
    argv.task_ids as string[],
  );
};
